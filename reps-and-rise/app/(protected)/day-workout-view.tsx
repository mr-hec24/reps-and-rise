import { Screen } from '@/components/Screen';
import { BackButton, DateField, SectionLabel } from '@/components/ui-ember';
import WorkoutForm, { WorkoutFormValues } from '@/components/WorkoutForm';
import { useWorkoutStore } from '@/store/globalStore';
import { useThemeMode } from '@/theme/ThemeContext';
import { workoutDayKey } from '@/utils/workoutStats';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DayWorkoutSet = WorkoutFormValues['sets'][number] & { _rowId?: string };

export default function DayWorkoutView() {
  const posthog = usePostHog();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { date, workouts } = params;
  const [isEditing, setIsEditing] = useState(false);
  const parsedRouteDate = React.useMemo(() => {
    if (!date) return null;
    const dateValue = Array.isArray(date) ? date[0] : date;
    const parsed = dayjs(
      dateValue,
      ['YYYY-MM-DD', 'MMMM D, YYYY', 'MMMM DD, YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'],
      true
    );
    return parsed.isValid() ? parsed.toDate() : null;
  }, [date]);
  const [sessionDate, setSessionDate] = useState<Date>(parsedRouteDate ?? new Date());
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const storeAddWorkout = useWorkoutStore((state: any) => state.addWorkout);
  const storeUpdateWorkout = useWorkoutStore((state: any) => state.updateWorkout);
  const storeDeleteWorkout = useWorkoutStore((state: any) => state.deleteWorkout);
  const fetchWorkouts = useWorkoutStore((state: any) => state.fetchWorkouts);
  const storeWorkouts = useWorkoutStore(state => state.workouts);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', {
        screen: 'day_workout_view',
        section: 'protected',
        date: String(date || ''),
      });
    }, [posthog, date])
  );

  /**
   * Which day this screen is showing. Starts at the date it was opened with and
   * moves when a save reschedules the session, so the rows follow the sets to
   * their new day instead of stranding the screen on the old one.
   */
  const [viewDayKey, setViewDayKey] = useState<string | null>(
    parsedRouteDate ? dayjs(parsedRouteDate).format('YYYY-MM-DD') : null
  );

  // The route param is a JSON snapshot taken when this screen opened. Prefer
  // the live store and fall back to the snapshot only until the store loads.
  const snapshotRows: any[] = React.useMemo(
    () => (typeof workouts === 'string' ? JSON.parse(workouts) : []),
    [workouts]
  );

  const workoutData: any[] = React.useMemo(() => {
    if (storeWorkouts.length === 0) return snapshotRows;
    if (!viewDayKey) return snapshotRows;
    return storeWorkouts.filter(row => workoutDayKey(row) === viewDayKey);
  }, [storeWorkouts, snapshotRows, viewDayKey]);

  // Track current row IDs so we can detect deletions on save
  const originalIds: string[] = workoutData.map((w: any) => w.id);

  // Transform workout data to match WorkoutForm expected format
  const displayData = workoutData.length > 0 ? transformWorkoutsToExercises(workoutData) : [];

  const handleSubmit = async (submittedExercises: WorkoutFormValues | WorkoutFormValues[]) => {
    const exercises = Array.isArray(submittedExercises) ? submittedExercises : [submittedExercises];
    const performedOn = dayjs(sessionDate).format('YYYY-MM-DD');
    const originalIdSet = new Set(originalIds);
    const submittedIdSet = new Set<string>();
    const ops: Promise<any>[] = [];
    let addedCount = 0;
    let editedCount = 0;
    let deletedCount = 0;

    for (const exercise of exercises) {
      if (!exercise.activity_id) continue;
      for (const [i, set] of exercise.sets.entries()) {
        const row = set as DayWorkoutSet;
        const reps = parseInt(row.reps) || null;
        const weight = parseFloat(row.weight) || null;
        if (reps == null && weight == null) continue;

        if (row._rowId) {
          submittedIdSet.add(row._rowId);
          editedCount += 1;
          ops.push(
            storeUpdateWorkout(row._rowId, {
              exercise_xid: exercise.activity_id,
              reps,
              weight,
              set_num: i + 1,
              performed_on: performedOn,
            })
          );
        } else {
          // New set — insert it
          addedCount += 1;
          ops.push(
            storeAddWorkout({
              exercise_xid: exercise.activity_id,
              reps,
              weight,
              set_num: i + 1,
              performed_on: performedOn,
            })
          );
        }
      }
    }

    // Delete rows that were removed from the form
    for (const id of originalIdSet) {
      if (!submittedIdSet.has(id)) {
        deletedCount += 1;
        ops.push(storeDeleteWorkout(id));
      }
    }

    await Promise.all(ops);

    // Re-read the store and follow the session if its date moved, so the rows
    // below reflect what was just saved rather than the opening snapshot.
    await fetchWorkouts();
    setViewDayKey(performedOn);
    setIsEditing(false);

    posthog.capture('workout_day_saved', {
      date: String(date || ''),
      added_rows: addedCount,
      edited_rows: editedCount,
      deleted_rows: deletedCount,
    });
  };

  const goBack = () => {
    posthog.capture('button_click', { screen: 'day_workout_view', button: 'back' });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <View style={styles.headerBody}>
          <Text style={styles.headerTitle}>{dayjs(sessionDate).format('MMMM D, YYYY')}</Text>
          <Text style={styles.headerMeta}>
            {isEditing
              ? 'Editing — save with the button below'
              : 'Session detail · tap Edit to change'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (!isEditing) {
              posthog.capture('workout_edit_mode_started', { source: 'day_workout_view' });
            }
            setIsEditing(editing => !editing);
          }}
          style={styles.editButton}
          accessibilityRole='button'
        >
          <Text style={styles.editText}>{isEditing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {isEditing && (
        <View style={styles.dateRow}>
          <DateField
            value={sessionDate}
            onChange={setSessionDate}
            variant='row'
            label='Session date'
          />
        </View>
      )}

      {isEditing ? (
        <WorkoutForm initialValues={displayData} editable onSubmit={handleSubmit} />
      ) : (
        <ScrollView contentContainerStyle={styles.readList} showsVerticalScrollIndicator={false}>
          {displayData.length === 0 && (
            <Text style={styles.empty}>No sets recorded for this day.</Text>
          )}
          {displayData.map((exercise: any) => (
            <View key={exercise.activity_id} style={styles.exerciseCard}>
              <View style={styles.exerciseHead}>
                <Text style={styles.exerciseName}>{exercise.activity_name}</Text>
                <Text style={styles.exerciseMeta}>{exercise.sets.length} × sets</Text>
              </View>
              <View style={styles.tableHead}>
                <SectionLabel style={styles.colSet}>Set</SectionLabel>
                <SectionLabel style={styles.colValue}>Reps</SectionLabel>
                <SectionLabel style={styles.colValue}>Weight</SectionLabel>
              </View>
              {exercise.sets.map((set: DayWorkoutSet, index: number) => (
                <View key={set._rowId ?? index} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.colSet, styles.cellIndex]}>{index + 1}</Text>
                  <Text style={[styles.cell, styles.colValue]}>{set.reps || '—'}</Text>
                  <Text style={[styles.cell, styles.colValue]}>{set.weight || 'body'}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

// Transform workout data from store format to WorkoutForm format
function transformWorkoutsToExercises(workouts: any[]) {
  // Group workouts by activity
  const groupedByActivity = workouts.reduce((acc: Record<string, any>, workout: any) => {
    const activityId =
      workout.exercises?.id ||
      workout.exercise_xid ||
      workout.activities?.id ||
      workout.activity_id;
    const activityName =
      workout.exercises?.name || workout.activities?.activity_name || workout.activity_name;

    if (!acc[activityId]) {
      acc[activityId] = {
        activity_id: activityId,
        activity_name: activityName,
        sets: [],
      };
    }

    // Add this workout as a set — keep DB row id for update/delete
    acc[activityId].sets.push({
      _rowId: workout.id,
      sets: workout.set_num?.toString() || '1',
      reps: workout.reps?.toString() || '0',
      weight: workout.weight?.toString() || '0',
    });

    return acc;
  }, {});

  // Convert to array and sort sets by set number
  return Object.values(groupedByActivity).map((exercise: any) => ({
    ...exercise,
    sets: exercise.sets.sort((a: any, b: any) => parseInt(a.sets) - parseInt(b.sets)),
  }));
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerBody: { flex: 1, gap: 2 },
    headerTitle: {
      fontFamily: theme.font.family.display,
      fontSize: 18,
      letterSpacing: -0.36,
      color: theme.colors.text,
    },
    headerMeta: {
      fontFamily: theme.font.family.body,
      fontSize: 12,
      color: theme.colors.subtext,
    },
    editButton: {
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 11,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    editText: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 12.5,
      color: theme.colors.secondary,
    },
    dateRow: {
      paddingHorizontal: 20,
      marginBottom: theme.spacing.md,
    },
    readList: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap: 13 },
    empty: {
      fontFamily: theme.font.family.body,
      fontSize: 13,
      color: theme.colors.subtext,
    },
    exerciseCard: {
      borderRadius: 17,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    exerciseHead: {
      paddingHorizontal: 15,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    exerciseName: {
      fontFamily: theme.font.family.display,
      fontSize: 15,
      color: theme.colors.text,
    },
    exerciseMeta: {
      fontFamily: theme.font.family.mono,
      fontSize: 11.5,
      color: theme.colors.subtext,
    },
    tableHead: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10 },
    tableRow: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 11,
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
    },
    cell: {
      fontFamily: theme.font.family.mono,
      fontSize: 14,
      color: theme.colors.text,
    },
    cellIndex: { color: theme.colors.secondary },
    colSet: { width: 44 },
    colValue: { flex: 1 },
  });
