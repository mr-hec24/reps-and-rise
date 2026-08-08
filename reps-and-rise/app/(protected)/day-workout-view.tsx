import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WorkoutForm, { WorkoutFormValues } from '@/components/WorkoutForm';
import { SectionHeader } from '@/components/SectionHeader';

type DayWorkoutSet = WorkoutFormValues['sets'][number] & { _rowId?: string };
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useThemeMode } from '@/theme/ThemeContext';
import { Row } from '@/components/Row';
import { useWorkoutStore } from '@/store/globalStore';
import { usePostHog } from 'posthog-react-native';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DayWorkoutView() {
    const posthog = usePostHog();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { date, workouts } = params;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const insets = useSafeAreaInsets();
    const parsedRouteDate = React.useMemo(() => {
        if (!date) return null;
        const dateValue = Array.isArray(date) ? date[0] : date;
        const parsed = dayjs(dateValue, ['YYYY-MM-DD', 'MMMM D, YYYY', 'MMMM DD, YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'], true);
        return parsed.isValid() ? parsed.toDate() : null;
    }, [date]);
    const [sessionDate, setSessionDate] = useState<Date>(parsedRouteDate ?? new Date());
    const { theme } = useThemeMode();
    const styles = getStyles(theme);
    const storeAddWorkout = useWorkoutStore((state: any) => state.addWorkout);
    const storeUpdateWorkout = useWorkoutStore((state: any) => state.updateWorkout);
    const storeDeleteWorkout = useWorkoutStore((state: any) => state.deleteWorkout);

    useFocusEffect(
        useCallback(() => {
            posthog.capture('screen_view', { screen: 'day_workout_view', section: 'protected', date: String(date || '') });
        }, [posthog, date])
    );

    // Parse the workouts data from params
    const workoutData = typeof workouts === 'string' ? JSON.parse(workouts) : [];

    // Track original row IDs so we can detect deletions on save
    const originalIds: string[] = workoutData.map((w: any) => w.id);

    // Transform workout data to match WorkoutForm expected format
    const displayData = workoutData.length > 0 ? transformWorkoutsToExercises(workoutData) : [];

    const handleSubmit = async (submittedExercises: WorkoutFormValues | WorkoutFormValues[]) => {
        const exercises = Array.isArray(submittedExercises) ? submittedExercises : [submittedExercises];
        const performedOn = sessionDate.toISOString().slice(0, 10);
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
                    ops.push(storeUpdateWorkout(row._rowId, {
                        exercise_xid: exercise.activity_id,
                        reps,
                        weight,
                        set_num: i + 1,
                        performed_on: performedOn,
                    }));
                } else {
                    // New set — insert it
                    addedCount += 1;
                    ops.push(storeAddWorkout({
                        exercise_xid: exercise.activity_id,
                        reps,
                        weight,
                        set_num: i + 1,
                        performed_on: performedOn,
                    }));
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
        posthog.capture('workout_day_saved', {
            date: String(date || ''),
            added_rows: addedCount,
            edited_rows: editedCount,
            deleted_rows: deletedCount,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Row style={styles.header}>
                    <SectionHeader
                        title={dayjs(sessionDate).format('MMMM D, YYYY')}
                        style={styles.headerTitle}
                    />
                </Row>

                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Session date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateValue}>{dayjs(sessionDate).format('MMMM D, YYYY')}</Text>
                    <FontAwesome name="calendar" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (Platform.OS !== 'web' ? (
                  <DateTimePicker
                    value={sessionDate}
                    mode="date"
                    display="default"
                    onChange={(_, newDate) => {
                      setShowDatePicker(false);
                      if (newDate) setSessionDate(newDate);
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={sessionDate}
                    mode="date"
                    display="default"
                    onChange={(_, newDate) => {
                      if (newDate) setSessionDate(newDate);
                    }}
                  />
                ))}

                <WorkoutForm
                    initialValues={displayData}
                    editable={true}
                    onSubmit={handleSubmit}
                />
                
                <TouchableOpacity
                    onPress={() => {
                        posthog.capture('button_click', { screen: 'day_workout_view', button: 'back' });
                        try {
                          router.back();
                        } catch {
                          router.push('/');
                        }
                    }}
                    style={[styles.backButton, { bottom: insets.bottom + 20 }]}
                >
                    <FontAwesome name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Transform workout data from store format to WorkoutForm format
function transformWorkoutsToExercises(workouts: any[]) {
    // Group workouts by activity
    const groupedByActivity = workouts.reduce((acc: Record<string, any>, workout: any) => {
        const activityId = workout.exercises?.id || workout.exercise_xid || workout.activities?.id || workout.activity_id;
        const activityName = workout.exercises?.name || workout.activities?.activity_name || workout.activity_name;

        if (!acc[activityId]) {
            acc[activityId] = {
                activity_id: activityId,
                activity_name: activityName,
                sets: []
            };
        }

        // Add this workout as a set — keep DB row id for update/delete
        acc[activityId].sets.push({
            _rowId: workout.id,
            sets: workout.set_num?.toString() || '1',
            reps: workout.reps?.toString() || '0',
            weight: workout.weight?.toString() || '0'
        });

        return acc;
    }, {});

    // Convert to array and sort sets by set number
    return Object.values(groupedByActivity).map((exercise: any) => ({
        ...exercise,
        sets: exercise.sets.sort((a: any, b: any) => parseInt(a.sets) - parseInt(b.sets))
    }));
}

const getStyles = (theme: any) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        paddingTop: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    headerTitle: {
        marginLeft: theme.spacing.sm,
        marginBottom: 0,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    dateLabel: {
      fontSize: theme.font.body,
      color: theme.colors.subtext,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.iconBackground,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    dateValue: {
      color: theme.colors.text,
      fontSize: theme.font.body,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        padding: 12,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
});