import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '@/components/Screen';
import { BackButton } from '@/components/ui-ember';
import { useThemeMode } from '@/theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import {
  cancelNotificationById,
  getNotificationPermissionStatus,
  loadDailyReminderSettings,
  requestNotificationPermissions,
  saveDailyReminderSettings,
  scheduleDailyReminder,
} from '@/utils/notifications';

export default function NotificationSettingsCard() {
  const posthog = usePostHog();
  const router = useRouter();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [draftReminderTime, setDraftReminderTime] = useState(new Date());
  const [scheduledNotificationId, setScheduledNotificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined'
  );

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'notification_settings_modal', section: 'modal' });
    }, [posthog])
  );

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      try {
        const [savedSettings, currentPermissionStatus] = await Promise.all([
          loadDailyReminderSettings(),
          getNotificationPermissionStatus(),
        ]);

        const reminderDate = new Date();
        reminderDate.setHours(savedSettings.hour, savedSettings.minute, 0, 0);

        setReminderTime(reminderDate);
        setPermissionStatus(
          currentPermissionStatus === 'granted'
            ? 'granted'
            : currentPermissionStatus === 'denied'
              ? 'denied'
              : 'undetermined'
        );
        setDailyEnabled(savedSettings.enabled && currentPermissionStatus === 'granted');
        setScheduledNotificationId(savedSettings.notificationId);

        if (savedSettings.enabled && currentPermissionStatus !== 'granted') {
          await saveDailyReminderSettings({
            ...savedSettings,
            enabled: false,
          });
        }
      } catch (error) {
        console.error('Failed to load daily reminder settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const persistCurrentSettings = async (
    enabled: boolean,
    hour: number,
    minute: number,
    notificationId: string | null
  ) => {
    await saveDailyReminderSettings({
      enabled,
      hour,
      minute,
      notificationId,
    });
  };

  const handleToggleDaily = async (nextValue: boolean) => {
    if (isUpdating) return;
    posthog.capture('button_click', {
      screen: 'notification_settings_modal',
      button: 'daily_reminder_toggle',
      enabled: nextValue,
    });

    setIsUpdating(true);
    const hour = reminderTime.getHours();
    const minute = reminderTime.getMinutes();

    try {
      if (nextValue) {
        const granted = await requestNotificationPermissions();
        const refreshedStatus = await getNotificationPermissionStatus();
        setPermissionStatus(
          refreshedStatus === 'granted'
            ? 'granted'
            : refreshedStatus === 'denied'
              ? 'denied'
              : 'undetermined'
        );

        if (!granted) {
          Alert.alert(
            'Notifications disabled',
            'Please allow notifications in system settings to enable daily reminders.'
          );
          setDailyEnabled(false);
          await persistCurrentSettings(false, hour, minute, scheduledNotificationId);
          return;
        }

        if (scheduledNotificationId) {
          await cancelNotificationById(scheduledNotificationId);
        }

        const notificationId = await scheduleDailyReminder(hour, minute);
        setScheduledNotificationId(notificationId);
        setDailyEnabled(true);
        await persistCurrentSettings(true, hour, minute, notificationId);
        return;
      }

      if (scheduledNotificationId) {
        await cancelNotificationById(scheduledNotificationId);
      }

      setScheduledNotificationId(null);
      setDailyEnabled(false);
      await persistCurrentSettings(false, hour, minute, null);
    } catch (error) {
      console.error('Failed to update daily reminder:', error);
      Alert.alert('Update failed', 'Could not update your daily reminder. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openTimePicker = () => {
    posthog.capture('button_click', {
      screen: 'notification_settings_modal',
      button: 'open_reminder_time_picker',
    });
    setDraftReminderTime(reminderTime);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);

      if (event?.type === 'dismissed' || !date) {
        return;
      }

      setDraftReminderTime(date);
      void applyReminderTime(date);
      return;
    }

    if (date) {
      setDraftReminderTime(date);
    }
  };

  const applyReminderTime = async (nextTime: Date) => {
    setReminderTime(nextTime);
    const hour = nextTime.getHours();
    const minute = nextTime.getMinutes();

    if (!dailyEnabled) {
      await persistCurrentSettings(false, hour, minute, scheduledNotificationId);
      return;
    }

    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if (scheduledNotificationId) {
        await cancelNotificationById(scheduledNotificationId);
      }

      const newNotificationId = await scheduleDailyReminder(hour, minute);
      setScheduledNotificationId(newNotificationId);
      await persistCurrentSettings(true, hour, minute, newNotificationId);
    } catch (error) {
      console.error('Failed to reschedule daily reminder:', error);
      Alert.alert('Update failed', 'Could not update reminder time. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveTime = async () => {
    posthog.capture('reminder_time_updated', {
      hour: draftReminderTime.getHours(),
      minute: draftReminderTime.getMinutes(),
    });
    await applyReminderTime(draftReminderTime);
    setShowTimePicker(false);
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.header}>
          <BackButton onPress={goBack} />
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.container}>
          <Text style={styles.helperText}>Loading notification preferences…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Daily Reminder</Text>
              <Text style={styles.helperText}>Get a reminder to log your workout each day.</Text>
            </View>
            <Switch
              value={dailyEnabled}
              onValueChange={handleToggleDaily}
              disabled={isUpdating}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.background}
            />
          </View>

          {dailyEnabled && (
            <View style={styles.timeSection}>
              <TouchableOpacity onPress={openTimePicker} style={styles.row} disabled={isUpdating}>
                <Text style={styles.label}>Reminder Time</Text>
                <Text style={styles.timeValue}>
                  {reminderTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <View style={styles.pickerPanel}>
                  <DateTimePicker
                    value={draftReminderTime}
                    mode='time'
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />

                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerActions}>
                      <TouchableOpacity
                        onPress={() => setShowTimePicker(false)}
                        style={styles.secondaryAction}
                      >
                        <Text style={styles.secondaryActionText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSaveTime}
                        style={styles.primaryAction}
                        disabled={isUpdating}
                      >
                        <Text style={styles.primaryActionText}>Save Time</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {permissionStatus === 'denied' && (
            <Text style={styles.warningText}>
              Notification permission is denied on this device. Enable it in system settings.
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerTitle: {
      flex: 1,
      fontFamily: theme.font.family.display,
      fontSize: 18,
      letterSpacing: -0.36,
      color: theme.colors.text,
    },
    headerSpacer: { width: 38 },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    card: {
      marginTop: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      rowGap: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      columnGap: theme.spacing.sm,
    },
    timeSection: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.xs,
    },
    rowContent: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 15,
      color: theme.colors.text,
    },
    helperText: {
      marginTop: theme.spacing.xs,
      fontFamily: theme.font.family.body,
      fontSize: 13,
      color: theme.colors.subtext,
    },
    timeValue: {
      fontFamily: theme.font.family.monoBold,
      fontSize: 15,
      color: theme.colors.secondary,
    },
    warningText: {
      marginTop: theme.spacing.xs,
      fontFamily: theme.font.family.body,
      fontSize: 13,
      color: theme.colors.danger,
    },
    pickerPanel: {
      marginTop: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    pickerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      columnGap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    primaryAction: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    primaryActionText: {
      fontFamily: theme.font.family.bodySemibold,
      color: theme.colors.onAccent,
    },
    secondaryAction: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.card,
    },
    secondaryActionText: {
      fontFamily: theme.font.family.bodyMedium,
      color: theme.colors.text,
    },
  });
