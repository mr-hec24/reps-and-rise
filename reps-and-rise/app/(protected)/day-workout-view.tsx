import React, { useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WorkoutForm from '@/components/WorkoutForm';
import { SectionHeader } from '@/components/SectionHeader';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeMode } from '@/theme/ThemeContext';
import { StyleSheet } from 'react-native';
import { Row } from '@/components/Row';

export default function DayWorkoutView() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { date, workouts } = params;
    const { theme } = useThemeMode();
    const styles = getStyles(theme);
    const [isEditable, setIsEditable] = useState(false);

    // Parse the workouts data from params
    const workoutData = typeof workouts === 'string' ? JSON.parse(workouts) : [];

    // For POC, use sample data if no workouts passed
    const sampleData = [
        {
            "activity_id": "1",
            "activity_name": "Bench Press",
            "sets": [
                {
                    "sets": "1",
                    "reps": "10",
                    "weight": "135"
                },
                {
                    "sets": "2",
                    "reps": "8",
                    "weight": "155"
                },
                {
                    "sets": "3",
                    "reps": "6",
                    "weight": "175"
                }
            ]
        },
        {
            "activity_id": "2",
            "activity_name": "Squats",
            "sets": [
                {
                    "sets": "1",
                    "reps": "12",
                    "weight": "185"
                },
                {
                    "sets": "2",
                    "reps": "10",
                    "weight": "205"
                }
            ]
        }
    ];

    // Transform workout data to match WorkoutForm expected format
    const transformedData = workoutData.length > 0 ? transformWorkoutsToExercises(workoutData) : sampleData;

    const displayData = transformedData;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Row style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
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
                    editable={isEditable}
                    onSubmit={() => {}}
                />

            </View>
        </SafeAreaView>
    );
}

// Transform workout data from store format to WorkoutForm format
function transformWorkoutsToExercises(workouts: any[]) {
    // Group workouts by activity
    const groupedByActivity = workouts.reduce((acc: Record<string, any>, workout: any) => {
        const activityId = workout.activities?.id || workout.activity_id;
        const activityName = workout.activities?.activity_name || workout.activity_name;

        if (!acc[activityId]) {
            acc[activityId] = {
                activity_id: activityId,
                activity_name: activityName,
                sets: []
            };
        }

        // Add this workout as a set
        acc[activityId].sets.push({
            sets: workout.set?.toString() || '1',
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
    editButton: {
        position: 'absolute',
        right: theme.spacing.md,
        bottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.full,
        elevation: 3,
    },
    editButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: theme.spacing.xs,
    },
});