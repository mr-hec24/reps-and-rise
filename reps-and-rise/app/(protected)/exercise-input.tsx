import { useWorkoutStore } from '@/store/globalStore';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import WorkoutForm, { WorkoutFormValues } from '@/components/WorkoutForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const insets = useSafeAreaInsets();
    const parsedRouteDate = React.useMemo(() => {
        if (!date) return null;
        const dateValue = Array.isArray(date) ? date[0] : date;
        const parsed = dayjs(dateValue, ['YYYY-MM-DD', 'MMMM D, YYYY', 'MMMM DD, YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'], true);
        return parsed.isValid() ? parsed.toDate() : null;
    }, [date]);
    const [selectedDate, setSelectedDate] = useState<Date>(parsedRouteDate ?? new Date());
    const { theme } = useThemeMode();
    const styles = getStyles(theme);

    useFocusEffect(
        useCallback(() => {
            posthog.capture('screen_view', { screen: 'exercise_input', section: 'protected' });
            posthog.capture('workout_session_started', { source: 'exercise_input_screen' });
        }, [posthog])
    );

    const resolvePerformedOn = () => {
        if (!selectedDate) return null;
        return selectedDate.toISOString().slice(0, 10);
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
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Workout date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateValue}>{dayjs(selectedDate).format('MMMM D, YYYY')}</Text>
                    <FontAwesome name="calendar" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (Platform.OS !== 'web' ? (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(_, newDate) => {
                      setShowDatePicker(false);
                      if (newDate) setSelectedDate(newDate);
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(_, newDate) => {
                      if (newDate) setSelectedDate(newDate);
                    }}
                  />
                ))}

                <WorkoutForm
                    initialValues={[
                        {
                            activity_id: '',
                            activity_name: '',
                            sets: [{ sets: '1', reps: '', weight: '' }],
                        },
                    ]}
                    editable={true}
                    onSubmit={async (form: WorkoutFormValues | WorkoutFormValues[]) => {
                        const forms = Array.isArray(form) ? form : [form];
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

                <TouchableOpacity
                  onPress={() => {
                    try {
                      router.back();
                    } catch {
                      router.push('/');
                    }
                  }}
                  style={[styles.backButton, { bottom: insets.bottom + 20 }]}
                >
                  <FontAwesome name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
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