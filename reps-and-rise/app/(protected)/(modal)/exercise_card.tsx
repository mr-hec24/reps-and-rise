import { useWorkoutStore } from '@/store/globalStore';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import WorkoutForm from '@/components/WorkoutForm';
import { supabase } from '@/lib/supabase';


export default function ExerciseCard() {
    const addWorkout = useWorkoutStore((state) => state.addWorkout);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    Adding New Workout Record
                </Text>
                <Text>
                    Umm...
                </Text>
                <WorkoutForm
                    initialValues={{
                        activity: '',
                        weight: 0,
                        reps: 0,
                        sets: 0,
                    }}
                    onSubmit={(form) => {
                        addWorkout({
                            activity_xid: form.activity_id,
                            weight: form.weight,
                            reps: form.reps,
                            set: form.sets,
                        });
                    }}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}   

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
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