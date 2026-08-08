import { Screen } from '@/components/Screen';
import { ScreenTitle, SectionLabel } from '@/components/ui-ember';
import { useWorkoutStore } from '@/store/globalStore';
import { useThemeMode } from '@/theme/ThemeContext';
import { currentWeek, formatNumber, weeklyMetrics, workoutStreak } from '@/utils/workoutStats';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Speculative analytics are marked, not hidden behind an overlay. */
const IN_THE_WORKS = [
  { title: 'Strength trend', note: 'Estimated 1RM per lift, month over month' },
  { title: 'Muscle balance', note: 'Which groups you are under-training' },
  { title: 'Consistency score', note: 'Sessions against your own baseline' },
];

export default function MetricsScreen() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const fetchWorkouts = useWorkoutStore(state => state.fetchWorkouts);
  const workouts = useWorkoutStore(state => state.workouts);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'metrics_tab', section: 'tab' });
      fetchWorkouts();
    }, [posthog, fetchWorkouts])
  );

  const week = useMemo(() => currentWeek(workouts), [workouts]);
  const { sessions, volume } = weeklyMetrics(workouts);
  const streak = workoutStreak(workouts);
  const peak = Math.max(...week.map(day => day.volume), 0);

  return (
    <Screen edges={['top']} pad={20} extraBottom={20} scroll contentStyle={styles.content}>
      <ScreenTitle>Metrics</ScreenTitle>

      <View style={styles.volumeCard}>
        <View style={styles.volumeHead}>
          <SectionLabel>Volume this week</SectionLabel>
          <Text style={styles.volumeUnit}>lb lifted</Text>
        </View>
        <Text style={styles.volumeValue}>{formatNumber(volume)}</Text>

        <View style={styles.chart}>
          {week.map(day => (
            <View key={day.key} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: day.volume && peak ? Math.max(9, (day.volume / peak) * 58) : 4,
                    backgroundColor: day.volume
                      ? day.isToday
                        ? theme.colors.accent
                        : theme.colors.primary
                      : theme.colors.hairline,
                  },
                ]}
              />
              <Text style={styles.barLabel}>{day.dow}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <Text style={styles.tileValue}>{streak}</Text>
          <Text style={styles.tileLabel}>Day streak</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileValue}>{sessions}</Text>
          <Text style={styles.tileLabel}>Sessions this week</Text>
        </View>
      </View>

      <View style={styles.divider}>
        <SectionLabel>In the works</SectionLabel>
        <View style={styles.dividerLine} />
      </View>

      {IN_THE_WORKS.map(item => (
        <View key={item.title} style={styles.soonRow}>
          <View style={styles.soonThumb} />
          <View style={styles.soonBody}>
            <Text style={styles.soonTitle}>{item.title}</Text>
            <Text style={styles.soonNote}>{item.note}</Text>
          </View>
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>Soon</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    content: { paddingTop: 16, gap: 14 },
    volumeCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 14,
    },
    volumeHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    volumeUnit: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 11.5,
      color: theme.colors.secondary,
    },
    volumeValue: {
      fontFamily: theme.font.family.monoBold,
      fontSize: 40,
      lineHeight: 44,
      color: theme.colors.text,
    },
    chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 74 },
    barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    bar: { width: '100%', borderRadius: 5 },
    barLabel: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 9.5,
      color: theme.colors.muted,
    },
    tileRow: { flexDirection: 'row', gap: 11 },
    tile: {
      flex: 1,
      padding: 16,
      borderRadius: 17,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 5,
    },
    tileValue: {
      fontFamily: theme.font.family.monoBold,
      fontSize: 26,
      lineHeight: 28,
      color: theme.colors.secondary,
    },
    tileLabel: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 11.5,
      color: theme.colors.subtext,
    },
    divider: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
    soonRow: {
      padding: 16,
      borderRadius: 17,
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    soonThumb: {
      width: 56,
      height: 44,
      borderRadius: 9,
      backgroundColor: theme.colors.iconBackground,
    },
    soonBody: { flex: 1, gap: 3 },
    soonTitle: {
      fontFamily: theme.font.family.display,
      fontSize: 14,
      color: theme.colors.text,
    },
    soonNote: {
      fontFamily: theme.font.family.body,
      fontSize: 11.5,
      lineHeight: 16,
      color: theme.colors.muted,
    },
    soonBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    soonBadgeText: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 9.5,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: theme.colors.subtext,
    },
  });
