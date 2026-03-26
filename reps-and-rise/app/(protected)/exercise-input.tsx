import { useWorkoutStore } from '@/store/globalStore';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList, TextInput, Button, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import WorkoutForm from '@/components/WorkoutForm';
import { SectionHeader } from '@/components/SectionHeader';
import { useThemeMode } from '@/theme/ThemeContext';

export default function ExerciseCard() {
    const router = useRouter();
    const addWorkout = useWorkoutStore((state: any) => state.addWorkout);
    const { theme } = useThemeMode();
    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <SectionHeader title="Input Workout" />
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="times" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <WorkoutForm
                    initialValues={{
                        activity: 'Pushup',
                        weight: 15,
                        reps: 10,
                        sets: 1,
                    }}
                    editable={true}
                    onSubmit={(form: any) => {
                        addWorkout({
                            activity_xid: form.activity_id,
                            weight: form.weight,
                            reps: form.reps,
                            set: form.sets,
                        });
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