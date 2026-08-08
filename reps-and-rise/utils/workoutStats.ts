import type { WorkoutItem } from '@/store/globalStore';
import dayjs from 'dayjs';

/** Every screen reads the session date the same way. */
export const workoutDate = (workout: WorkoutItem) =>
  workout.performed_on || workout.created_at || new Date().toISOString();

export const workoutDayKey = (workout: WorkoutItem) =>
  dayjs(workoutDate(workout)).format('YYYY-MM-DD');

export const exerciseName = (workout: any) =>
  workout.exercises?.name ||
  workout.activities?.activity_name ||
  workout.activity_name ||
  'Exercise';

/** reps × weight, the only volume figure the app claims. */
export const setVolume = (workout: WorkoutItem) =>
  (Number(workout.reps) || 0) * (Number(workout.weight) || 0);

export const formatNumber = (value: number) => Math.round(value).toLocaleString('en-US');

export interface WorkoutSession {
  /** YYYY-MM-DD */
  key: string;
  date: Date;
  rows: WorkoutItem[];
  exerciseNames: string[];
  setCount: number;
  volume: number;
}

/** Group flat workout rows into dated sessions, newest first. */
export function groupSessions(workouts: WorkoutItem[]): WorkoutSession[] {
  const grouped = new Map<string, WorkoutItem[]>();

  for (const workout of workouts) {
    const key = workoutDayKey(workout);
    const bucket = grouped.get(key);
    if (bucket) bucket.push(workout);
    else grouped.set(key, [workout]);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, rows]) => ({
      key,
      date: dayjs(key).toDate(),
      rows,
      exerciseNames: Array.from(new Set(rows.map(exerciseName))),
      setCount: rows.length,
      volume: rows.reduce((total, row) => total + setVolume(row), 0),
    }));
}

export interface WeekDay {
  key: string;
  date: Date;
  /** Single-letter day-of-week label. */
  dow: string;
  day: number;
  volume: number;
  isToday: boolean;
}

/** The current week, Sunday first, with each day's volume. */
export function currentWeek(workouts: WorkoutItem[]): WeekDay[] {
  const start = dayjs().startOf('week');
  const today = dayjs().format('YYYY-MM-DD');

  const volumeByDay = new Map<string, number>();
  for (const workout of workouts) {
    const key = workoutDayKey(workout);
    volumeByDay.set(key, (volumeByDay.get(key) || 0) + setVolume(workout));
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = start.add(index, 'day');
    const key = date.format('YYYY-MM-DD');
    return {
      key,
      date: date.toDate(),
      dow: date.format('dd').charAt(0),
      day: date.date(),
      volume: volumeByDay.get(key) || 0,
      isToday: key === today,
    };
  });
}

/** Consecutive days worked out, allowing the streak to continue from yesterday. */
export function workoutStreak(workouts: WorkoutItem[]): number {
  if (!Array.isArray(workouts) || workouts.length === 0) return 0;

  const days = new Set(workouts.map(workoutDayKey));
  let cursor = dayjs().startOf('day');

  if (!days.has(cursor.format('YYYY-MM-DD'))) {
    const yesterday = cursor.subtract(1, 'day');
    if (!days.has(yesterday.format('YYYY-MM-DD'))) return 0;
    cursor = yesterday;
  }

  let streak = 0;
  while (days.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1;
    cursor = cursor.subtract(1, 'day');
  }
  return streak;
}

export interface WeeklyMetrics {
  sessions: number;
  reps: number;
  volume: number;
}

export function weeklyMetrics(workouts: WorkoutItem[]): WeeklyMetrics {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return { sessions: 0, reps: 0, volume: 0 };
  }

  const start = dayjs().startOf('week');
  const end = dayjs().endOf('week');

  const thisWeek = workouts.filter(workout => {
    const date = dayjs(workoutDate(workout));
    return (
      date.isAfter(start.subtract(1, 'millisecond')) && date.isBefore(end.add(1, 'millisecond'))
    );
  });

  return {
    sessions: new Set(thisWeek.map(workoutDayKey)).size,
    reps: thisWeek.reduce((sum, workout) => sum + (Number(workout.reps) || 0), 0),
    volume: thisWeek.reduce((sum, workout) => sum + setVolume(workout), 0),
  };
}

/** The most recent logged set for an exercise, for the repeat-last-session prompt. */
export function lastSetFor(workouts: WorkoutItem[], exerciseId?: string) {
  if (!exerciseId) return null;

  const matches = workouts
    .filter(workout => (workout.exercise_xid || workout.exercises?.id) === exerciseId)
    .filter(workout => workout.reps != null)
    .sort((a, b) => (workoutDayKey(a) < workoutDayKey(b) ? 1 : -1));

  const latest = matches[0];
  if (!latest) return null;

  return { reps: Number(latest.reps) || 0, weight: Number(latest.weight) || 0 };
}
