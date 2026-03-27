import { useWorkoutStore } from '@/store/globalStore';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, View, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import WorkoutForm from '@/components/WorkoutForm';
import { SectionHeader } from '@/components/SectionHeader';
import { useThemeMode } from '@/theme/ThemeContext';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function ExerciseCard() {
    const posthog = usePostHog();
    const router = useRouter();
    const addWorkout = useWorkoutStore((state: any) => state.addWorkout);
    const { date } = useLocalSearchParams<{ date?: string }>();
    const { theme } = useThemeMode();
    const styles = getStyles(theme);

    useFocusEffect(
        useCallback(() => {
            posthog.capture('screen_view', { screen: 'exercise_input', section: 'protected' });
            posthog.capture('workout_session_started', { source: 'exercise_input_screen' });
        }, [posthog])
    );

    const resolvePerformedOn = () => {
        if (!date || Array.isArray(date)) return null;
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return null;
        return parsedDate.toISOString().slice(0, 10);
    };

    const toNullableInt = (value: unknown) => {
        if (value === '' || value === null || value === undefined) return null;
        const parsed = Number.parseInt(String(value), 10);
        return Number.isNaN(parsed) ? null : parsed;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <SectionHeader title="Input Workout" />
                    <TouchableOpacity
                        onPress={() => {
                            posthog.capture('button_click', { screen: 'exercise_input', button: 'close' });
                            router.back();
                        }}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="times" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <WorkoutForm
                    initialValues={[
                        {
                            activity_id: '',
                            activity_name: '',
                            sets: [{ sets: '1', reps: '', weight: '' }],
                        },
                    ]}
                    editable={true}
                    onSubmit={async (forms: any[]) => {
                        const performedOn = resolvePerformedOn();

                        const inserts = forms.flatMap((form) => {
                            const activityId = form.activity_id;
                            const sets = Array.isArray(form.sets) ? form.sets : [];

                            if (!activityId) {
                                return [];
                            }

                            return sets
                                .map((s: any, index: number) => {
                                    const reps = toNullableInt(s.reps);
                                    const weight = toNullableInt(s.weight);
                                    const setNum = toNullableInt(s.sets) ?? index + 1;

                                    if (reps === null && weight === null) {
                                        return null;
                                    }

                                    const row: any = {
                                        exercise_xid: activityId,
                                        weight,
                                        reps,
                                        set_num: setNum,
                                    };

                                    if (performedOn) {
                                        row.performed_on = performedOn;
                                    }

                                    return row;
                                })
                                .filter(Boolean);
                        });

                        if (inserts.length === 0) {
                            Alert.alert(
                                'Nothing to save',
                                'Select an exercise and add reps or weight before saving your workout.'
                            );
                            return;
                        }

                        posthog.capture('workout_created', {
                            source: 'exercise_input',
                            rows_to_insert: inserts.length,
                            performed_on: performedOn,
                        });

                        for (const row of inserts) {
                            await addWorkout(row);
                        }

                        router.back();
                    }}
                />
            </View>
        </TouchableWithoutFeedback>
        </SafeAreaView>
    );
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    closeButton: {
        padding: 8,
    },
    listSection: {
        flex: 1,
        marginBottom: 20
    },
    formSection: {
        width: '100%',
        zIndex: 1000
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 15
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20
    }
});