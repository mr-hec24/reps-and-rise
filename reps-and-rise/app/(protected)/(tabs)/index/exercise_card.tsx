import { useWorkoutStore } from '@/store/globalStore';
import { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

export default function ExerciseCard() {
    const {workouts, loading, fetchWorkouts} = useWorkoutStore();

    useEffect(() => {
        fetchWorkouts();
    }, []);

    if (loading) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Text>Exercise Card Modal</Text>
            <FlatList 
                data={workouts} 
                renderItem = { ({item}) => 
                <Text>{item.activities?.activity_name || 'Unknown Activity'} - Set: {item.set || 0} Reps: {item.reps || 0}</Text>} 
            />
        </View>
    );
}   

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
        margin: 30
    },
});