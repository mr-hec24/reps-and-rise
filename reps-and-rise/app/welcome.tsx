import { EmberMark } from '@/components/EmberMark';
import { Screen } from '@/components/Screen';
import { GhostButton, PrimaryButton, SecondaryButton } from '@/components/ui-ember';
import { useAuth } from '@/context/auth-provider';
import { useThemeMode } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  const router = useRouter();
  const { signInAsGuest } = useAuth();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign in failed:', error);
    }
  };

  return (
    <Screen pad={28}>
      <View style={styles.body}>
        <View style={styles.brand}>
          <EmberMark size={116} glow />
          <View style={styles.brandText}>
            <Text style={styles.wordmark}>ember</Text>
            <Text style={styles.tagline}>
              The heat is still there. Log the work, keep it burning.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label='Create account' onPress={() => router.push('/sign-up')} />
          <SecondaryButton label='Sign in' onPress={() => router.push('/sign-in')} />
          <GhostButton label='Continue as guest' onPress={handleGuestSignIn} />
        </View>

        <Text style={styles.footnote}>
          Guest sessions stay on this device until you make an account.
        </Text>
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    body: {
      flex: 1,
      justifyContent: 'center',
      gap: 34,
      paddingBottom: 24,
    },
    brand: {
      alignItems: 'center',
      gap: 20,
    },
    brandText: {
      alignItems: 'center',
      gap: 8,
    },
    wordmark: {
      fontFamily: theme.font.family.display,
      fontSize: 40,
      lineHeight: 44,
      letterSpacing: -1.4,
      color: theme.colors.text,
    },
    tagline: {
      fontFamily: theme.font.family.body,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.subtext,
      textAlign: 'center',
      maxWidth: 250,
    },
    actions: {
      gap: 11,
    },
    footnote: {
      textAlign: 'center',
      fontFamily: theme.font.family.body,
      fontSize: 11.5,
      lineHeight: 18,
      color: theme.colors.muted,
    },
  });
