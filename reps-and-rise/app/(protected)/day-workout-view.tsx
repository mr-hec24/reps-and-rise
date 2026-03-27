import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WorkoutForm from '@/components/WorkoutForm';
import { SectionHeader } from '@/components/SectionHeader';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeMode } from '@/theme/ThemeContext';
import { StyleSheet } from 'react-native';
import { Row } from '@/components/Row';
import { useWorkoutStore } from '@/store/globalStore';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function DayWorkoutView() {
    const posthog = usePostHog();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { date, workouts } = params;
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

    const handleSubmit = async (submittedExercises: any[]) => {
        const originalIdSet = new Set(originalIds);
        const submittedIdSet = new Set<string>();
        const ops: Promise<any>[] = [];
        let addedCount = 0;
        let editedCount = 0;
        let deletedCount = 0;

        for (const exercise of submittedExercises) {
            if (!exercise.activity_id) continue;
            for (const [i, set] of exercise.sets.entries()) {
                const reps = parseInt(set.reps) || null;
                const weight = parseFloat(set.weight) || null;
                if (reps == null && weight == null) continue;

                if (set._rowId) {
                    submittedIdSet.add(set._rowId);
                    editedCount += 1;
                    ops.push(storeUpdateWorkout(set._rowId, {
                        exercise_xid: exercise.activity_id,
                        reps,
                        weight,
                        set_num: i + 1,
                    }));
                } else {
                    // New set — insert it
                    addedCount += 1;
                    ops.push(storeAddWorkout({
                        exercise_xid: exercise.activity_id,
                        reps,
                        weight,
                        set_num: i + 1,
                        performed_on: (date as string) || undefined,
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
                    <TouchableOpacity
                        onPress={() => {
                            posthog.capture('button_click', { screen: 'day_workout_view', button: 'back' });
                            router.back();
                        }}
                        style={styles.backButton}
                    >
                        <FontAwesome name="arrow-left" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <SectionHeader
                        title={`${date || 'Sample Date'}`}
                        style={styles.headerTitle}
                    />
                </Row>

                <WorkoutForm
                    initialValues={displayData}
                    editable={false}
                    onSubmit={handleSubmit}
                />

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
    backButton: {
        padding: 8,
    },
});