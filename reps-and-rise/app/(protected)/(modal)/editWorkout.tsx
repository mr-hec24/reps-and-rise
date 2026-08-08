import { Alert, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import WorkoutForm, { WorkoutFormValues } from '@/components/WorkoutForm';
import { Screen } from '@/components/Screen';
import { BackButton, DangerButton } from '@/components/ui-ember';
import { useWorkoutStore } from '@/store/globalStore';
import { useThemeMode } from '@/theme/ThemeContext';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

interface ParsedWorkout {
  id: string;
  exercises?: { id: string; name: string };
  exercise_xid?: string;
  activities?: { id: string; activity_name: string };
  weight?: number | null;
  reps?: number | null;
  set_num?: number;
}

export default function EditWorkout() {
  const posthog = usePostHog();
  const { workout } = useLocalSearchParams<{ workout?: string | string[] }>();
  const workoutJson = Array.isArray(workout) ? workout[0] : workout;
  const parsedWorkout = workoutJson
    ? (JSON.parse(workoutJson) as ParsedWorkout)
    : ({} as ParsedWorkout);
  const updateWorkout = useWorkoutStore(state => state.updateWorkout);
  const deleteWorkout = useWorkoutStore(state => state.deleteWorkout);
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'edit_workout_modal', section: 'modal' });
    }, [posthog])
  );

  function deleteWorkoutAlert(id: string) {
    Alert.alert('Delete workout', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          posthog.capture('workout_deleted', { source: 'edit_workout_modal', workout_id: id });
          deleteWorkout(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.body}>
          <View style={styles.header}>
            <BackButton onPress={goBack} />
            <Text style={styles.headerTitle}>Edit set</Text>
            <View style={styles.headerSpacer} />
          </View>
          <WorkoutForm
            initialValues={{
              activity_id:
                parsedWorkout.exercises?.id ||
                parsedWorkout.exercise_xid ||
                parsedWorkout.activities?.id ||
                '',
              activity_name:
                parsedWorkout.exercises?.name || parsedWorkout.activities?.activity_name || '',
              sets: [
                {
                  sets: parsedWorkout.set_num?.toString() || '1',
                  reps: parsedWorkout.reps?.toString() || '',
                  weight: parsedWorkout.weight?.toString() || '',
                },
              ],
            }}
            onSubmit={(form: WorkoutFormValues | WorkoutFormValues[]) => {
              const firstExercise = Array.isArray(form) ? form[0] : form;
              const firstSet = firstExercise?.sets?.[0] ?? { sets: '', reps: '', weight: '' };

              posthog.capture('workout_edited', {
                source: 'edit_workout_modal',
                workout_id: parsedWorkout.id,
                exercise_id: firstExercise?.activity_id || null,
              });

              updateWorkout(parsedWorkout.id, {
                exercise_xid: firstExercise?.activity_id,
                weight: firstSet.weight ? parseInt(firstSet.weight, 10) : null,
                reps: firstSet.reps ? parseInt(firstSet.reps, 10) : null,
                set_num: firstSet.sets ? parseInt(firstSet.sets, 10) : 1,
              });
            }}
          />
          <DangerButton
            label='Delete this set'
            onPress={() => deleteWorkoutAlert(parsedWorkout.id)}
            style={styles.delete}
          />
        </View>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    body: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerTitle: {
      flex: 1,
      fontFamily: theme.font.family.display,
      fontSize: 18,
      letterSpacing: -0.36,
      color: theme.colors.text,
    },
    headerSpacer: { width: 38 },
    delete: { marginHorizontal: 20, marginTop: 12 },
  });
