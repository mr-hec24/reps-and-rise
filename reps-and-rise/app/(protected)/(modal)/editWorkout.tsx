import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import WorkoutForm from '@/components/WorkoutForm';
import { useWorkoutStore } from '@/store/globalStore';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function EditWorkout() {
    const posthog = usePostHog();
    const { workout } = useLocalSearchParams();
    const parsedWorkout = JSON.parse(workout);
    const updateWorkout = useWorkoutStore((state) => state.updateWorkout);
    const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout);

    useFocusEffect(
        useCallback(() => {
            posthog.capture('screen_view', { screen: 'edit_workout_modal', section: 'modal' });
        }, [posthog])
    );

    function deleteWorkoutAlert(id) {
        Alert.alert(
            "Delete workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        posthog.capture('workout_deleted', { source: 'edit_workout_modal', workout_id: id });
                        deleteWorkout(id);
                        router.back();
                    }
                }
            ]
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    Editing Workout
                </Text>
                <Text>
                    Editing: {parsedWorkout.id}
                </Text>
                <WorkoutForm
                    initialValues={{
                        activity_id: parsedWorkout.exercises?.id || parsedWorkout.exercise_xid || parsedWorkout.activities?.id || '',
                        activity_name: parsedWorkout.exercises?.name || parsedWorkout.activities?.activity_name || '',
                        weight: parsedWorkout.weight || 0,
                        reps: parsedWorkout.reps || 0,
                        sets: parsedWorkout.set_num || 0,
                    }}
                    onSubmit={(form) => {
                        const firstExercise = Array.isArray(form) ? form[0] : form;
                        const firstSet = firstExercise?.sets?.[0] || {};

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
                <TouchableOpacity
                    onPress={() => deleteWorkoutAlert(parsedWorkout.id)}
                    style={{ padding: 8 }}
                    >
                    <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}