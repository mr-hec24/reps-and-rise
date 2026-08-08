import { Screen } from '@/components/Screen';
import { SectionLabel, StatTile } from '@/components/ui-ember';
import { useUser } from '@/context/user-provider';
import { useWorkoutStore } from '@/store/globalStore';
import { useThemeMode } from '@/theme/ThemeContext';
import { groupSessions, formatNumber, weeklyMetrics, workoutStreak } from '@/utils/workoutStats';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function describeDaysAgo(date: Date) {
  const days = dayjs().startOf('day').diff(dayjs(date).startOf('day'), 'day');
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return dayjs(date).format('MMM D');
}

export default function HomeScreen() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const fetchWorkouts = useWorkoutStore(state => state.fetchWorkouts);
  const workouts = useWorkoutStore(state => state.workouts);
  const { profile } = useUser();

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'home_tab', section: 'tab' });
      fetchWorkouts();
    }, [posthog, fetchWorkouts])
  );

  const firstName = profile?.first_name?.trim() || 'there';
  const initials = useMemo(() => {
    const first = profile?.first_name?.trim()?.[0] || '';
    const last = profile?.last_name?.trim()?.[0] || '';
    return (first + last).toUpperCase() || 'ME';
  }, [profile?.first_name, profile?.last_name]);

  const streak = workoutStreak(workouts);
  const { sessions, reps } = weeklyMetrics(workouts);
  const allSessions = useMemo(() => groupSessions(workouts), [workouts]);
  const recent = allSessions.slice(0, 3);
  const lastSession = allSessions[0];

  const lastSummary = lastSession
    ? `Last: ${lastSession.exerciseNames[0]} · ${describeDaysAgo(lastSession.date)}`
    : 'Your first session starts here';

  const openSession = (index: number) => {
    const session = allSessions[index];
    posthog.capture('button_click', { screen: 'home_tab', button: 'open_recent_session' });
    router.push({
      pathname: '/day-workout-view',
      params: {
        date: dayjs(session.date).format('MMMM D, YYYY'),
        workouts: JSON.stringify(session.rows),
      },
    });
  };

  return (
    <Screen edges={['top']} pad={20} extraBottom={20} scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.today}>{dayjs().format('dddd, MMMM D')}</Text>
          <Text style={styles.hey}>Hey {firstName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            posthog.capture('button_click', { screen: 'home_tab', button: 'avatar_settings' });
            router.push('/settings');
          }}
          accessibilityRole='button'
          accessibilityLabel='Open settings'
        >
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          posthog.capture('button_click', { screen: 'home_tab', button: 'start_exercise' });
          posthog.capture('workout_session_started', { source: 'home_tab' });
          router.push({ pathname: '/exercise-input' });
        }}
        accessibilityRole='button'
      >
        <LinearGradient
          colors={['#F2762E', '#C2551C', '#8B4A1E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startCard}
        >
          <Text style={styles.startTitle}>Start workout</Text>
          <Text style={styles.startSubtitle}>{lastSummary}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.stats}>
        <StatTile value={sessions} label='Sessions this week' />
        <StatTile value={streak} label='Day streak' />
        <StatTile value={formatNumber(reps)} label='Reps this week' />
      </View>

      <View style={styles.sectionHead}>
        <SectionLabel>Recent sessions</SectionLabel>
        <TouchableOpacity onPress={() => router.push('/calendar')} accessibilityRole='button'>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nothing logged yet. Tap Start workout and the first set goes here.
          </Text>
        </View>
      ) : (
        <View style={styles.sessionList}>
          {recent.map((session, index) => (
            <TouchableOpacity
              key={session.key}
              activeOpacity={0.8}
              onPress={() => openSession(index)}
              style={styles.sessionRow}
              accessibilityRole='button'
            >
              <View style={styles.sessionBar} />
              <View style={styles.sessionBody}>
                <Text style={styles.sessionDate}>{dayjs(session.date).format('ddd, MMM D')}</Text>
                <Text style={styles.sessionSummary} numberOfLines={1}>
                  {session.exerciseNames.join(' · ')}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    content: { paddingTop: 16, gap: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    greeting: { gap: 3 },
    today: {
      fontFamily: theme.font.family.body,
      fontSize: 12.5,
      color: theme.colors.subtext,
    },
    hey: {
      fontFamily: theme.font.family.display,
      fontSize: 25,
      lineHeight: 28,
      letterSpacing: -0.75,
      color: theme.colors.text,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: theme.font.family.displayBold,
      fontSize: 14,
      color: '#141210',
    },
    startCard: {
      marginTop: 20,
      padding: 24,
      borderRadius: theme.radius.xxl,
      gap: 6,
    },
    startTitle: {
      fontFamily: theme.font.family.displayBold,
      fontSize: 22,
      lineHeight: 25,
      letterSpacing: -0.44,
      color: '#1B1310',
    },
    startSubtitle: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 13,
      color: 'rgba(27,19,16,0.72)',
    },
    stats: { flexDirection: 'row', gap: 10, marginTop: 16 },
    sectionHead: {
      marginTop: 24,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    seeAll: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 12,
      color: theme.colors.secondary,
    },
    sessionList: { marginTop: 10, gap: 9 },
    sessionRow: {
      padding: 14,
      borderRadius: 15,
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
    },
    sessionBar: {
      width: 4,
      alignSelf: 'stretch',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
    },
    sessionBody: { flex: 1, gap: 3 },
    sessionDate: {
      fontFamily: theme.font.family.display,
      fontSize: 14.5,
      color: theme.colors.text,
    },
    sessionSummary: {
      fontFamily: theme.font.family.body,
      fontSize: 12,
      color: theme.colors.subtext,
    },
    chevron: {
      fontFamily: theme.font.family.display,
      fontSize: 15,
      color: theme.colors.muted,
    },
    empty: {
      marginTop: 10,
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
  });
