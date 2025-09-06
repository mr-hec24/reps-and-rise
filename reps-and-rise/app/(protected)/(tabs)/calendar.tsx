import { StyleSheet } from 'react-native';

import DayView from '@/components/DayView';
import { Text, View } from '@/components/Themed';
import { List } from 'immutable';


const exercises_temp = List([
        {exercise: 'Push Ups', reps: 10, sets: 3},
        {exercise: 'Sit Ups', reps: 15, sets: 3},
        {exercise: 'Pull Ups', reps: 5, sets: 3},
        {exercise: 'Squats', reps: 20, sets: 3},

    ]);

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar View</Text>
      <View style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
      <DayView month={2} day={24} year={2003} exercises = {exercises_temp}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
