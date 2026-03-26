import * as Notifications from "expo-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_REMINDER_SETTINGS_KEY = 'daily_reminder_settings_v1';

export type DailyReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId: string | null;
};

const defaultDailyReminderSettings: DailyReminderSettings = {
  enabled: false,
  hour: 20,
  minute: 0,
  notificationId: null,
};

export async function getNotificationPermissionStatus() {
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status;
}

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function loadDailyReminderSettings(): Promise<DailyReminderSettings> {
  const raw = await AsyncStorage.getItem(DAILY_REMINDER_SETTINGS_KEY);
  if (!raw) {
    return defaultDailyReminderSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DailyReminderSettings>;
    return {
      ...defaultDailyReminderSettings,
      ...parsed,
    };
  } catch {
    return defaultDailyReminderSettings;
  }
}

export async function saveDailyReminderSettings(settings: DailyReminderSettings) {
  await AsyncStorage.setItem(DAILY_REMINDER_SETTINGS_KEY, JSON.stringify(settings));
}

export async function clearDailyReminderSettings() {
  await AsyncStorage.removeItem(DAILY_REMINDER_SETTINGS_KEY);
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Workout Reminder",
      body: "Log your workout for today",
    },
    trigger: {
      type: "daily",
      hour,
      minute,
      channelId: "default" // required on Android
    },
  });
}

export async function cancelNotificationById(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleStreakReminder(streak: number) {
  if (streak < 3) return; // only remind if streak is meaningful

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Keep the streak alive!",
      body: `You're on a ${streak}-day streak. Don't stop now.`,
    },
    trigger: {
      type: "daily",
      hour: 20,
      minute: 0,
      channelId: "default",
    },
  });
}

export async function scheduleWeeklyReminders(days: number[], hour: number, minute: number) {
    // days = [1, 2,...,6, 7] for Sunday, Monday, ..., Friday, Saturday
    for (const weekday of days) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Workout Reminder",
                body: "Log your workout for today",
            },
            trigger: {
                type: "daily",
                weekday,
                hour,
                minute,
                channelId: "default" // required on Android
            },
        });
    }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}