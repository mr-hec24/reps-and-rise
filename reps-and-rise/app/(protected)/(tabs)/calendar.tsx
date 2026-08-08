import { Screen, useFloatingBottomOffset } from '@/components/Screen';
import { Chip, ScreenTitle } from '@/components/ui-ember';
import { useWorkoutStore } from '@/store/globalStore';
import { useThemeMode } from '@/theme/ThemeContext';
import { currentWeek, groupSessions, type WorkoutSession } from '@/utils/workoutStats';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const floatingBottom = useFloatingBottomOffset(false);

  const loading = useWorkoutStore(state => state.loading);
  const fetchWorkouts = useWorkoutStore(state => state.fetchWorkouts);
  const workouts = useWorkoutStore(state => state.workouts);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'calendar_tab', section: 'tab' });
    }, [posthog])
  );

  const sessions = useMemo(() => groupSessions(workouts), [workouts]);
  const week = useMemo(() => currentWeek(workouts), [workouts]);

  const openSession = (session: WorkoutSession) => {
    posthog.capture('button_click', {
      screen: 'calendar_tab',
      button: 'open_day_workout',
      date: session.key,
      row_count: session.rows.length,
    });
    router.push({
      pathname: '/day-workout-view',
      params: {
        date: dayjs(session.date).format('MMMM D, YYYY'),
        workouts: JSON.stringify(session.rows),
      },
    });
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.head}>
        <ScreenTitle>History</ScreenTitle>
        <View style={styles.weekStrip}>
          {week.map(day => (
            <View
              key={day.key}
              style={[
                styles.weekDay,
                day.isToday && {
                  backgroundColor: theme.colors.selectedCard,
                  borderColor: theme.colors.accent,
                },
              ]}
            >
              <Text style={styles.weekDow}>{day.dow}</Text>
              <Text
                style={[
                  styles.weekNumber,
                  { color: day.volume ? theme.colors.text : theme.colors.muted },
                ]}
              >
                {day.day}
              </Text>
              <View
                style={[
                  styles.weekDot,
                  { backgroundColor: day.volume ? theme.colors.accent : theme.colors.border },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={session => session.key}
        contentContainerStyle={[styles.list, { paddingBottom: floatingBottom + 56 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading your sessions…' : 'No sessions logged yet. Tap + to start one.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openSession(item)}
            style={styles.card}
            accessibilityRole='button'
          >
            <View style={styles.cardHead}>
              <Text style={styles.cardDate}>{dayjs(item.date).format('ddd, MMM D')}</Text>
              <Text style={styles.cardMeta}>
                {item.setCount} {item.setCount === 1 ? 'set' : 'sets'}
              </Text>
            </View>
            <View style={styles.tags}>
              {item.exerciseNames.map(name => (
                <Chip key={`${item.key}-${name}`} label={name} tone='amber' />
              ))}
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: floatingBottom }]}
        onPress={() => {
          posthog.capture('button_click', { screen: 'calendar_tab', button: 'add_workout' });
          posthog.capture('workout_session_started', { source: 'calendar_tab' });
          router.push('/exercise-input');
        }}
        accessibilityRole='button'
        accessibilityLabel='Log a workout'
      >
        <FontAwesome name='plus' size={22} color={theme.colors.onAccent} />
      </TouchableOpacity>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    head: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 14 },
    weekStrip: { flexDirection: 'row', gap: 5 },
    weekDay: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      alignItems: 'center',
      gap: 5,
    },
    weekDow: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 10,
      color: theme.colors.subtext,
    },
    weekNumber: { fontFamily: theme.font.family.monoBold, fontSize: 13 },
    weekDot: { width: 5, height: 5, borderRadius: theme.radius.pill },
    list: { paddingHorizontal: 20, paddingTop: 4, gap: 11 },
    card: {
      padding: 15,
      borderRadius: 17,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 11,
    },
    cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardDate: {
      fontFamily: theme.font.family.display,
      fontSize: 15.5,
      color: theme.colors.text,
    },
    cardMeta: {
      fontFamily: theme.font.family.mono,
      fontSize: 11.5,
      color: theme.colors.subtext,
    },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    empty: {
      padding: 18,
      borderRadius: 15,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
    },
    emptyText: {
      fontFamily: theme.font.family.body,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.subtext,
    },
    fab: {
      position: 'absolute',
      right: 22,
      width: 56,
      height: 56,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
  });
