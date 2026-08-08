import { EmberWordmark } from '@/components/EmberMark';
import { MIN_BOTTOM_PAD, Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/ui-ember';
import { useActivities } from '@/context/activity-provider';
import { useWorkoutStore, type WorkoutItem } from '@/store/globalStore';
import { useThemeMode } from '@/theme/ThemeContext';
import { lastSetFor, workoutDayKey } from '@/utils/workoutStats';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];
const MAX_DIGITS = 6;

interface SessionExercise {
  id: string;
  name: string;
}

/**
 * Log workout — the numpad screen.
 *
 * Tap Reps or Weight, type on the pad, log the set: three taps and never a
 * scroll. Sets are written straight through to the workout store, so a set is
 * saved the moment you log it. No analytics here — those live on Metrics.
 */
export default function LogWorkout() {
  const posthog = usePostHog();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const { date } = useLocalSearchParams<{ date?: string }>();
  const { activities, loading: activitiesLoading } = useActivities();

  const workouts = useWorkoutStore(state => state.workouts);
  const fetchWorkouts = useWorkoutStore(state => state.fetchWorkouts);
  const addWorkout = useWorkoutStore(state => state.addWorkout);
  const deleteWorkout = useWorkoutStore(state => state.deleteWorkout);

  const parsedRouteDate = useMemo(() => {
    if (!date) return null;
    const value = Array.isArray(date) ? date[0] : date;
    const parsed = dayjs(
      value,
      ['YYYY-MM-DD', 'MMMM D, YYYY', 'MMMM DD, YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'],
      true
    );
    return parsed.isValid() ? parsed.toDate() : null;
  }, [date]);

  const [sessionDate, setSessionDate] = useState<Date>(parsedRouteDate ?? new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [focus, setFocus] = useState<'reps' | 'weight'>('reps');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'exercise_input', section: 'protected' });
      posthog.capture('workout_session_started', { source: 'exercise_input_screen' });
      fetchWorkouts();
    }, [posthog, fetchWorkouts])
  );

  // Open the picker straight away when there is nothing to log against yet.
  useEffect(() => {
    if (!activitiesLoading && exercises.length === 0) {
      setPickerOpen(true);
    }
    // Only on first load — reopening on every render would trap the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitiesLoading]);

  const activeExercise = exercises[activeIndex];
  const dayKey = dayjs(sessionDate).format('YYYY-MM-DD');

  /** Sets already saved for the active exercise on this date. */
  const setsForExercise = useCallback(
    (exerciseId?: string) =>
      workouts
        .filter(row => workoutDayKey(row) === dayKey)
        .filter(row => (row.exercise_xid || row.exercises?.id) === exerciseId)
        .sort((a, b) => (a.set_num ?? 0) - (b.set_num ?? 0)),
    [workouts, dayKey]
  );

  const loggedSets = useMemo(
    () => setsForExercise(activeExercise?.id),
    [setsForExercise, activeExercise?.id]
  );

  /** The last set of this exercise on any earlier day, for the fill prompt. */
  const previous = useMemo(() => {
    const earlier = workouts.filter(row => workoutDayKey(row) !== dayKey);
    return lastSetFor(earlier, activeExercise?.id);
  }, [workouts, dayKey, activeExercise?.id]);

  const typeDigit = (digit: string) => {
    const current = focus === 'reps' ? reps : weight;
    if (digit === '.' && current.includes('.')) return;
    if (current.length >= MAX_DIGITS) return;
    const next = current === '0' && digit !== '.' ? digit : current + digit;
    if (focus === 'reps') setReps(next);
    else setWeight(next);
  };

  const backspace = () => {
    if (focus === 'reps') setReps(value => value.slice(0, -1));
    else setWeight(value => value.slice(0, -1));
  };

  const logSet = async () => {
    if (!activeExercise) {
      setPickerOpen(true);
      return;
    }

    const parsedReps = parseInt(reps, 10);
    if (!parsedReps) {
      setFocus('reps');
      return;
    }
    const parsedWeight = parseFloat(weight);

    setSaving(true);
    try {
      await addWorkout({
        exercise_xid: activeExercise.id,
        reps: parsedReps,
        weight: Number.isNaN(parsedWeight) ? null : parsedWeight,
        set_num: loggedSets.length + 1,
        performed_on: dayKey,
      });
      posthog.capture('set_added', {
        exercise_id: activeExercise.id,
        set_count_after: loggedSets.length + 1,
      });
      setFocus('reps');
    } catch (error) {
      console.error('Could not log set:', error);
      Alert.alert('Could not log that set', 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeSet = async (row: WorkoutItem) => {
    try {
      await deleteWorkout(row.id);
      posthog.capture('set_deleted', {
        exercise_id: activeExercise?.id ?? null,
        set_count_after: Math.max(0, loggedSets.length - 1),
      });
    } catch (error) {
      console.error('Could not delete set:', error);
      Alert.alert('Could not delete that set', 'Check your connection and try again.');
    }
  };

  const pickExercise = (activity: SessionExercise) => {
    setPickerOpen(false);
    setPickerQuery('');

    const existing = exercises.findIndex(item => item.id === activity.id);
    if (existing >= 0) {
      setActiveIndex(existing);
    } else {
      setExercises(current => [...current, activity]);
      setActiveIndex(exercises.length);
      posthog.capture('exercise_selected', {
        exercise_id: activity.id,
        exercise_name: activity.name,
        source: 'log_workout',
      });
    }
    setReps('');
    setWeight('');
    setFocus('reps');
  };

  const finish = () => {
    posthog.capture('button_click', { screen: 'exercise_input', button: 'finish' });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(pickerQuery.toLowerCase())
  );

  const unit = 'lb';
  const padBottom = Math.max(insets.bottom, MIN_BOTTOM_PAD) + 8;

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <EmberWordmark size={19} style={styles.headerBrand} />
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.chip}
          accessibilityRole='button'
        >
          <Text style={styles.chipText}>{dayjs(sessionDate).format('ddd MMM D')}</Text>
          <Text style={styles.chipCaret}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={finish} style={styles.chip} accessibilityRole='button'>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={sessionDate}
          mode='date'
          display='default'
          onChange={(_, newDate) => {
            if (Platform.OS !== 'web') setShowDatePicker(false);
            if (newDate) setSessionDate(newDate);
          }}
        />
      )}

      {/* Exercise strip */}
      <View style={styles.strip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripScroll}
        >
          {exercises.map((exercise, index) => {
            const active = index === activeIndex;
            const count = setsForExercise(exercise.id).length;
            return (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => {
                  setActiveIndex(index);
                  setReps('');
                  setWeight('');
                  setFocus('reps');
                }}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: active ? theme.colors.selectedCard : theme.colors.card,
                    borderColor: active ? theme.colors.accent : theme.colors.border,
                  },
                ]}
                accessibilityRole='button'
              >
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {exercise.name}
                </Text>
                <Text style={styles.exerciseMeta}>
                  {count ? `${count} ${count === 1 ? 'set' : 'sets'}` : 'no sets yet'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={styles.addExercise}
          accessibilityRole='button'
          accessibilityLabel='Add exercise'
        >
          <Text style={styles.addExerciseText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Reps / weight tiles */}
      <View style={styles.tiles}>
        <TouchableOpacity
          onPress={() => setFocus('reps')}
          activeOpacity={0.9}
          style={[
            styles.tile,
            { borderColor: focus === 'reps' ? theme.colors.accent : 'transparent' },
          ]}
          accessibilityRole='button'
        >
          <SectionLabel>Reps</SectionLabel>
          <Text style={styles.tileValue}>{reps || '—'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFocus('weight')}
          activeOpacity={0.9}
          style={[
            styles.tile,
            { borderColor: focus === 'weight' ? theme.colors.accent : 'transparent' },
          ]}
          accessibilityRole='button'
        >
          <SectionLabel>Weight · {unit}</SectionLabel>
          <Text style={styles.tileValue}>{weight || '—'}</Text>
        </TouchableOpacity>
      </View>

      {/* Repeat last session */}
      {!!previous && (
        <TouchableOpacity
          onPress={() => {
            setReps(String(previous.reps));
            setWeight(previous.weight ? String(previous.weight) : '');
            setFocus('weight');
          }}
          style={styles.repeatBar}
          accessibilityRole='button'
        >
          <Text style={styles.repeatIcon}>↺</Text>
          <Text style={styles.repeatText}>
            Last time you did {previous.reps} × {previous.weight || 'body'}
          </Text>
          <Text style={styles.repeatAction}>Fill</Text>
        </TouchableOpacity>
      )}

      {/* Sets logged for this exercise */}
      <View style={styles.setList}>
        <View style={styles.setListHead}>
          <SectionLabel>This exercise</SectionLabel>
          <Text style={styles.setCount}>{loggedSets.length} logged</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.setRows}>
          {loggedSets.map((row, index) => (
            <View key={row.id} style={styles.setRow}>
              <Text style={styles.setIndex}>{index + 1}</Text>
              <Text style={styles.setValue}>
                {row.reps} × {row.weight ? `${row.weight} ${unit}` : 'body'}
              </Text>
              <TouchableOpacity
                onPress={() => removeSet(row)}
                hitSlop={10}
                accessibilityRole='button'
                accessibilityLabel={`Delete set ${index + 1}`}
              >
                <Text style={styles.setRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Log */}
      <View style={styles.logWrap}>
        <TouchableOpacity
          onPress={logSet}
          disabled={saving}
          activeOpacity={0.9}
          style={[styles.logButton, saving && { opacity: 0.6 }]}
          accessibilityRole='button'
        >
          <Text style={styles.logButtonText}>
            {saving ? 'Logging…' : `Log set ${loggedSets.length + 1}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Number pad — always up, so a set is three taps */}
      <View style={[styles.pad, { paddingBottom: padBottom }]}>
        {KEYS.map(key => (
          <View key={key} style={styles.keyCell}>
            <TouchableOpacity
              onPress={() => typeDigit(key)}
              style={styles.key}
              accessibilityRole='button'
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.keyCell}>
          <TouchableOpacity
            onPress={backspace}
            style={[styles.key, { backgroundColor: theme.colors.iconBackground }]}
            accessibilityRole='button'
            accessibilityLabel='Delete last digit'
          >
            <Text style={[styles.keyText, { fontSize: 18, color: theme.colors.secondary }]}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exercise picker */}
      <Modal
        visible={pickerOpen}
        animationType='slide'
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_PAD) }]}
          >
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Add exercise</Text>
              <TouchableOpacity
                onPress={() => setPickerOpen(false)}
                hitSlop={10}
                accessibilityRole='button'
                accessibilityLabel='Close'
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={pickerQuery}
              onChangeText={setPickerQuery}
              placeholder='Search exercises…'
              placeholderTextColor={theme.colors.placeholder}
              style={styles.modalSearch}
              autoCorrect={false}
            />
            <FlatList
              data={filteredActivities}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps='handled'
              style={styles.modalList}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>
                  {activitiesLoading ? 'Loading exercises…' : 'No exercises found.'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => pickExercise(item)}
                  style={styles.modalRow}
                  accessibilityRole='button'
                >
                  <Text style={styles.modalRowText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerBrand: { flex: 1 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 11,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 12.5,
      color: theme.colors.text,
    },
    chipCaret: { fontSize: 10, color: theme.colors.secondary },
    finishText: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 12.5,
      color: theme.colors.secondary,
    },
    strip: { flexDirection: 'row', gap: 9, paddingHorizontal: 20, paddingBottom: 14 },
    stripScroll: { gap: 9, paddingRight: 9 },
    exerciseCard: {
      minWidth: 150,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 13,
      borderWidth: 1,
      gap: 2,
    },
    exerciseName: {
      fontFamily: theme.font.family.display,
      fontSize: 13.5,
      color: theme.colors.text,
    },
    exerciseMeta: {
      fontFamily: theme.font.family.body,
      fontSize: 11,
      color: theme.colors.subtext,
    },
    addExercise: {
      width: 44,
      borderRadius: 13,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addExerciseText: {
      fontFamily: theme.font.family.display,
      fontSize: 20,
      color: theme.colors.secondary,
    },
    tiles: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
    tile: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderRadius: theme.radius.xl,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 6,
    },
    tileValue: {
      fontFamily: theme.font.family.monoBold,
      fontSize: 40,
      lineHeight: 44,
      color: theme.colors.text,
    },
    repeatBar: {
      marginTop: 12,
      marginHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentSoftBorder,
    },
    repeatIcon: { fontSize: 14, color: theme.colors.text },
    repeatText: {
      flex: 1,
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 13,
      color: theme.colors.text,
    },
    repeatAction: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 12,
      color: theme.colors.accent,
    },
    setList: { flex: 1, marginTop: 14, marginHorizontal: 20, gap: 7 },
    setListHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    setCount: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 11.5,
      color: theme.colors.subtext,
    },
    setRows: { gap: 7, paddingBottom: 4 },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 11,
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    setIndex: {
      width: 18,
      fontFamily: theme.font.family.monoBold,
      fontSize: 13,
      color: theme.colors.secondary,
    },
    setValue: {
      flex: 1,
      fontFamily: theme.font.family.mono,
      fontSize: 14,
      color: theme.colors.text,
    },
    setRemove: { fontSize: 12, color: theme.colors.subtext },
    logWrap: { paddingHorizontal: 20, paddingTop: 12 },
    logButton: {
      paddingVertical: 17,
      borderRadius: 15,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
    },
    logButtonText: {
      fontFamily: theme.font.family.displayBold,
      fontSize: 16.5,
      color: theme.colors.onAccent,
    },
    pad: {
      marginTop: 12,
      paddingHorizontal: 8,
      paddingTop: 9,
      backgroundColor: theme.colors.surfaceSunken,
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    // Cell owns the gutter so the three columns stay exactly equal.
    keyCell: { width: '33.3333%', paddingHorizontal: 3.5, paddingBottom: 7 },
    key: {
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: theme.colors.key,
    },
    keyText: {
      fontFamily: theme.font.family.mono,
      fontSize: 24,
      color: theme.colors.text,
    },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    modalSheet: {
      maxHeight: '78%',
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 14,
    },
    modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: {
      fontFamily: theme.font.family.display,
      fontSize: 20,
      color: theme.colors.text,
    },
    modalClose: { fontSize: 15, color: theme.colors.subtext },
    modalSearch: {
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: 13,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontFamily: theme.font.family.body,
      fontSize: 15,
    },
    modalList: { flexGrow: 0 },
    modalRow: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.hairline,
    },
    modalRowText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 15,
      color: theme.colors.text,
    },
    modalEmpty: {
      paddingVertical: 20,
      fontFamily: theme.font.family.body,
      fontSize: 13,
      color: theme.colors.subtext,
    },
  });
