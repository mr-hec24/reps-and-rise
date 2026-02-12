import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import WorkoutForm from '@/components/WorkoutForm';
import { useWorkoutStore } from '@/store/globalStore';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

export default function EditWorkout() {
    const { workout } = useLocalSearchParams();
    const parsedWorkout = JSON.parse(workout);
    const updateWorkout = useWorkoutStore((state) => state.updateWorkout);
    const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout);

    function deleteWorkoutAlert(id) {
        Alert.alert(
            "Delete workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => { deleteWorkout(id); router.back(); } }
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
                        activity: parsedWorkout.activities?.activity_name || '',
                        weight: parsedWorkout.weight || 0,
                        reps: parsedWorkout.reps || 0,
                        sets: parsedWorkout.set || 0,
                    }}
                    onSubmit={(form) => {
                        updateWorkout(parsedWorkout.id, {
                            activity_xid: form.activity_id,
                            weight: form.weight,
                            reps: form.reps,
                            set: form.sets,
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