import React from 'react';
import { StyleSheet } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';
import { List } from 'immutable';
import ExerciseList from './ExerciseList';

import Colors from '@/constants/Colors';
import FlatList from 'flatlist-react';



export default function DayView({month, day, year, exercises} : {month: number, day: number, year: number, exercises: List<{exercise:string, reps:number, sets:number}>}) {
    return (
        <View>
            <View style={styles.getStartedContainer}>
                <Text
                    style={styles.getStartedText}
                    lightColor='rgba(0,0,0,0.8)'
                    darkColor='rgba(255,255,255,0.8)'
                >
                    This is the date: {month}/{day}/{year}
                </Text>
                <Text>
                    Here is a list of the exercises done that day:
                </Text>
                <ExerciseList exercises={exercises}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
    }
});