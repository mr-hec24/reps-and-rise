import FlatList from 'flatlist-react';

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from './Themed';
import { List } from 'immutable';

export default function ExerciseList({exercises} : {exercises: List<{exercise:string, reps:number, sets:number}>}) {
    const renderExercise = (item: {exercise:string, reps:number, sets:number}, key: string) => {
        return (
            <View key={key}>
                <Text>{item.exercise} - {item.reps} reps x {item.sets} sets</Text>
            </View>
        )
    }
    
    return (
        <FlatList 
            list={exercises.toArray()}
            renderItem={renderExercise}
            renderWhenEmpty={() => <Text>No exercises logged for this day.</Text>}
        />
    );
}