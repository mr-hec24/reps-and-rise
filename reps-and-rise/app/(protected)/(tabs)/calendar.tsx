import { StyleSheet, View, Text, SectionList, TouchableOpacity} from 'react-native';
import { theme } from '@/theme';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';

import { useWorkoutStore } from '@/store/globalStore';
import { useEffect , useState} from 'react';
import dayjs from 'dayjs';
import { Link, router } from 'expo-router';

export default function TabTwoScreen() {

    const [openSections, setOpenSections] = useState({});
    const loading = useWorkoutStore((state) => state.loading);
    const fetchWorkouts = useWorkoutStore((state) => state.fetchWorkouts);
    const workouts = useWorkoutStore((state) => state.workouts);
    
    // Fetches workouts on component mount and whenever the store updates
    useEffect(() => {
        fetchWorkouts();
    }, []);
    
    if (loading) return <Text>Loading...</Text>;
    // Group workouts by date for display
    const grouped = workouts.reduce((acc, workout) => {
        const date = dayjs(workout.created_at).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(workout);
        return acc;
    }, {});
    // Convert grouped object into an array of sections for SectionList
    const sections = Object.entries(grouped)
      .sort((a, b) => new Date(b[0]) - new Date(a[0])) // sort by date key
      .map(([date, items]) => ({
        title: dayjs(date).format("MM-DD-YYYY"),
        data: items,
      }));

    const toggle = (title) => {
      setOpenSections((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    }

  return (
    <View style={styles.container}>
      <SectionHeader title="Exercise History"/>
      
      <SectionList 
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <TouchableOpacity onPress={() => toggle(section.title)}>
              {/* <Text style={{ fontSize: 18, fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: 10 }}>
                {section.title}
              </Text> */}
              <SectionHeader title={section.title} />
            </TouchableOpacity>
          )}
          renderItem={({ item, section }) => 
            openSections[section.title] ? (
              <Card style={styles.card} key={item.date}>
                <Text style={styles.exercise}>{item.activities?.activity_name || 'Unknown Activity'} - Set: {item.set || 0} | Reps: {item.reps || 0} </Text>
                <TouchableOpacity onPress={() => 
                  router.push({
                    pathname: '/editWorkout',
                    params: { workout: JSON.stringify(item) }
                  })
                }>
                  <Text style={{ color: 'blue' }}>Edit</Text>
                </TouchableOpacity> 
              </Card>
            ) : null
          }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    marginTop: 50,
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
  listSection: {
    padding: 20
  },
  card: {

  },
  exercise: {
    color: theme.colors.subtext,
    marginBottom: theme.spacing.xs
  }
});
