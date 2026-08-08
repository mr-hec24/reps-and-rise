import { EmberMark } from '@/components/EmberMark';
import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui-ember';
import { useThemeMode } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Confirm-email state as its own screen.
 *
 * sign-up.tsx still sets the `signupShowVerify` flag, so the banner on sign-in
 * keeps working for anyone who lands there another way — this just makes the
 * state impossible to miss right after registering.
 */
export default function VerifyEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const shown = (Array.isArray(email) ? email[0] : email) || 'your inbox';

  return (
    <Screen pad={34}>
      <View style={styles.body}>
        <View style={styles.markFrame}>
          <EmberMark size={36} />
        </View>

        <Text style={styles.title}>Confirm your email</Text>
        <Text style={styles.copy}>
          Confirm your email to be able to log in. We sent the link to{' '}
          <Text style={styles.emphasis}>{shown}</Text>.
        </Text>

        <PrimaryButton
          label='Back to sign in'
          onPress={() => router.push('/sign-in')}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    body: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 22,
      paddingBottom: 60,
    },
    markFrame: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: theme.font.family.display,
      fontSize: 26,
      lineHeight: 30,
      letterSpacing: -0.65,
      color: theme.colors.text,
      textAlign: 'center',
    },
    copy: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.subtext,
      textAlign: 'center',
      maxWidth: 280,
    },
    emphasis: { color: theme.colors.text },
    action: { marginTop: 6, paddingHorizontal: 30 },
  });
