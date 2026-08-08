import { Screen } from '@/components/Screen';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import {
  DangerButton,
  ListGroup,
  ListRow,
  PrimaryButton,
  ScreenTitle,
  SectionLabel,
} from '@/components/ui-ember';
import { useAuth } from '@/context/auth-provider';
import { useUser } from '@/context/user-provider';
import { useThemeMode } from '@/theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const posthog = usePostHog();
  const { signOut } = useAuth();
  const { profile, isLoading, error, refreshProfile } = useUser();
  const { theme, mode, toggleTheme } = useThemeMode();
  const styles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'settings_tab', section: 'tab' });
    }, [posthog])
  );

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.email || 'User';
  };

  const getInitials = () =>
    getDisplayName()
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getAvatarSource = () => (profile?.avatar_url ? { uri: profile.avatar_url } : undefined);

  if (isLoading) {
    return (
      <Screen edges={['top']} pad={20}>
        <View style={styles.centered}>
          <Text style={styles.status}>Loading profile…</Text>
        </View>
      </Screen>
    );
  }

  if (error && !profile) {
    return (
      <Screen edges={['top']} pad={20}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <PrimaryButton label='Retry' onPress={refreshProfile} style={styles.retry} />
        </View>
      </Screen>
    );
  }

  const openSelectedSetting = (setting: string) => {
    posthog.capture('button_click', { screen: 'settings_tab', button: setting });
    switch (setting) {
      case 'Profile settings':
        posthog.capture('modal_opened', { modal: 'profile_settings' });
        router.push('/profile_settings');
        break;
      case 'Notifications':
        posthog.capture('modal_opened', { modal: 'notification_settings' });
        router.push('/notification_settings');
        break;
      case 'Privacy & security':
        posthog.capture('modal_opened', { modal: 'privacy_security_setting' });
        router.push('/privacy_security_setting');
        break;
      case 'Appearance':
        posthog.capture('appearance_toggled', { source: 'settings_tab' });
        toggleTheme();
        break;
      case 'Send feedback':
        posthog.capture('modal_opened', { modal: 'send_feedback' });
        router.push('/send_feedback');
        break;
      case 'Buy me a coffee':
        posthog.capture('modal_opened', { modal: 'buy_me_a_coffee' });
        router.push('/buy_me_a_coffee' as never);
        break;
      default:
        break;
    }
  };

  const accountRows = [
    { label: 'Profile settings', value: '' },
    { label: 'Notifications', value: 'Daily reminder' },
    { label: 'Privacy & security', value: '' },
    { label: 'Appearance', value: mode === 'dark' ? 'Dark' : 'Light' },
  ];

  const supportRows = [{ label: 'Buy me a coffee' }, { label: 'Send feedback' }];

  return (
    <Screen edges={['top']} pad={20} extraBottom={20} scroll contentStyle={styles.content}>
      <ScreenTitle>Settings</ScreenTitle>

      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <Avatar size='xl'>
          <AvatarFallbackText>{getInitials()}</AvatarFallbackText>
          {getAvatarSource() && <AvatarImage source={getAvatarSource()} />}
        </Avatar>
        <View style={styles.profileBody}>
          <Text style={styles.profileName} numberOfLines={1}>
            {getDisplayName()}
          </Text>
          <Text style={styles.profileMeta}>Member since 2024</Text>
        </View>
      </LinearGradient>

      <View style={styles.group}>
        <SectionLabel>Account</SectionLabel>
        <ListGroup>
          {accountRows.map((row, index) => (
            <ListRow
              key={row.label}
              label={row.label}
              value={row.value}
              last={index === accountRows.length - 1}
              onPress={() => openSelectedSetting(row.label)}
            />
          ))}
        </ListGroup>
      </View>

      <View style={styles.group}>
        <SectionLabel>Support</SectionLabel>
        <ListGroup>
          {supportRows.map((row, index) => (
            <ListRow
              key={row.label}
              label={row.label}
              last={index === supportRows.length - 1}
              onPress={() => openSelectedSetting(row.label)}
            />
          ))}
        </ListGroup>
      </View>

      <DangerButton label='Sign out' onPress={signOut} style={styles.signOut} />
      <Text style={styles.version}>ember 0.4.0 · Phoenix Soteria LLC</Text>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    content: { paddingTop: 16, gap: 16 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    status: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.subtext,
    },
    errorText: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.danger,
      textAlign: 'center',
    },
    retry: { alignSelf: 'stretch' },
    profileCard: {
      padding: 18,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    profileBody: { flex: 1, gap: 2 },
    profileName: {
      fontFamily: theme.font.family.displayBold,
      fontSize: 17,
      color: '#1B1310',
    },
    profileMeta: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 12.5,
      color: 'rgba(27,19,16,0.7)',
    },
    group: { gap: 8 },
    signOut: { marginTop: 2 },
    version: {
      textAlign: 'center',
      fontFamily: theme.font.family.mono,
      fontSize: 11,
      color: theme.colors.muted,
    },
  });
