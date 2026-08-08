import { Screen } from '@/components/Screen';
import { BackButton, SectionLabel } from '@/components/ui-ember';
import { useThemeMode } from '@/theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SendFeedback() {
  const posthog = usePostHog();
  const router = useRouter();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'send_feedback_modal', section: 'modal' });
    }, [posthog])
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <Text style={styles.headerTitle}>Send feedback</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>We&apos;d love to hear from you</Text>
        <Text style={styles.copy}>
          A proper feedback form is on the way. Until then, anything you want to tell us can go
          through the support link in the app listing.
        </Text>
        <View style={styles.badge}>
          <SectionLabel>Coming soon</SectionLabel>
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
    body: { paddingHorizontal: 20, gap: 12 },
    title: {
      fontFamily: theme.font.family.display,
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.44,
      color: theme.colors.text,
    },
    copy: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.subtext,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
