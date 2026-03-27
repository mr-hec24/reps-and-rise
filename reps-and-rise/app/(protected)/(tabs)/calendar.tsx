import { StyleSheet, SafeAreaView, View, Text, SectionList, TouchableOpacity} from 'react-native';
import { useThemeMode } from '@/theme/ThemeContext';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';

import { useWorkoutStore } from '@/store/globalStore';
import { useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { Link, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Row } from '@/components/Row';
import { formatDate } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';

function Icon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  const { theme } = useThemeMode();
  const dynamicStyles = styles(theme);
  return <FontAwesome size={28} style={dynamicStyles.icon} {...props} />;
}

export default function TabTwoScreen() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();

    const loading = useWorkoutStore((state) => state.loading);
    const fetchWorkouts = useWorkoutStore((state) => state.fetchWorkouts);
    const workouts = useWorkoutStore((state) => state.workouts);
    
    // Fetches workouts on component mount and whenever the store updates
    useEffect(() => {
        fetchWorkouts();
    }, []);

    useFocusEffect(
      useCallback(() => {
        posthog.capture('screen_view', { screen: 'calendar_tab', section: 'tab' });
      }, [posthog])
    );
    
    if (loading) return <Text>Loading...</Text>;
    // Group workouts by date for display
    const grouped = workouts.reduce((acc, workout) => {
        const sourceDate = workout.performed_on || workout.created_at;
        const date = dayjs(sourceDate).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(workout);
        return acc;
    }, {});
    // Convert grouped object into an array of sections for SectionList
    const sections = Object.entries(grouped)
      .sort((a, b) => new Date(b[0]) - new Date(a[0])) // sort by date key
      .map(([date, items]) => ({
         title: formatDate(date),
        data: items,
      }));

  const dynamicStyles = styles(theme);

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.container}>
      <Row style={dynamicStyles.header}>
        <SectionHeader title="Exercise History"/>

        <TouchableOpacity
          style={dynamicStyles.addWorkoutButton}
          onPress={() => {
            posthog.capture('button_click', { screen: 'calendar_tab', button: 'add_workout' });
            posthog.capture('workout_session_started', { source: 'calendar_tab' });
            router.push('/exercise-input');
          }}
        >
          <FontAwesome name="plus" size={24} color="white" />

        </TouchableOpacity>
      </Row>
      
      <SectionList 
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => {
            const exerciseNames = Array.from(
              new Set(
                (section.data as any[])
                  .map((workout) =>
                    workout.exercises?.name || workout.activities?.activity_name || workout.activity_name
                  )
                  .filter(Boolean)
              )
            );

            return (
            <Card style={dynamicStyles.card}>
              <TouchableOpacity onPress={() => {
                posthog.capture('button_click', {
                  screen: 'calendar_tab',
                  button: 'open_day_workout',
                  date: section.title,
                  row_count: section.data.length,
                });
                router.push({
                  pathname: '/day-workout-view',
                  params: {
                    date: section.title,
                    workouts: JSON.stringify(section.data)
                  }
                });
              }}>
                <Row style={dynamicStyles.row}>
                  <Icon name='calendar' color={theme.colors.primary} />
                  <Text style={dynamicStyles.sectionTitle} >{section.title}</Text>
                </Row>

                {exerciseNames.length > 0 && (
                  <View style={dynamicStyles.tagsContainer}>
                    {exerciseNames.map((exerciseName) => (
                      <View key={`${section.title}-${exerciseName}`} style={dynamicStyles.tag}>
                        <Text style={dynamicStyles.tagText}>{exerciseName}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            </Card>
            
          )}}
          renderItem={({ item, section }) => null}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingTop: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingBottom: theme.spacing.xs,
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
  
  card: {

  },
  link: {
    color: theme.colors.primary
  },
  sectionTitle: {
    fontSize: theme.font.title,
    fontWeight: 600,
    color: theme.colors.text
  },
  sectionInfo: {
    paddingTop: theme.spacing.lg,
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,

  },
  exerciseCard: {
    margin: theme.spacing.xs,
    backgroundColor: '#FAFAF8'
  },
  row: {
    alignContent: 'center',
    justifyContent: 'flex-start',
    columnGap: theme.spacing.sm
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    columnGap: theme.spacing.xs,
    rowGap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.iconBackground,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    color: theme.colors.subtext,
    fontSize: theme.font.small,
    fontWeight: '600',
  },
  exercise: {
    color: theme.colors.subtext,
    marginBottom: theme.spacing.xs
  },
  icon: {
    backgroundColor: theme.colors.iconBackground,
    color: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: theme.radius.xs,
    borderColor: theme.colors.border
  },
  addWorkoutButton: {
    width: 42,
    height: 42,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  }
});
