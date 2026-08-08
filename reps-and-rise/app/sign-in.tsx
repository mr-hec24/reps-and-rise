import { Screen } from '@/components/Screen';
import {
  BackButton,
  ErrorBanner,
  Field,
  GhostButton,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui-ember';
import { useAuth } from '@/context/auth-provider';
import { useThemeMode } from '@/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const { signIn, signInAsGuest } = useAuth();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setErrorMessage('');
    if (!email.includes('@') || password.length < 6) {
      setErrorMessage('Enter an email and a password of 6+ characters.');
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Error signing in as guest:', error);
    }
  };

  useEffect(() => {
    const checkSignupFlag = async () => {
      try {
        const flag = await AsyncStorage.getItem('signupShowVerify');
        if (flag) {
          setSuccessMessage('Confirm your email to be able to login!');
          await AsyncStorage.removeItem('signupShowVerify');
        }
      } catch (e) {
        console.warn('Error reading signup flag', e);
      }
    };
    checkSignupFlag();
  }, []);

  return (
    <Screen pad={24}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.body}>
          <BackButton onPress={() => router.push('/welcome')} />

          <View style={styles.heading}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Pick up where the last session left off.</Text>
          </View>

          {!!successMessage && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{successMessage}</Text>
            </View>
          )}

          <View style={styles.fields}>
            <Field
              label='Email'
              placeholder='you@example.com'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
            />
            <Field
              label='Password'
              placeholder='At least 6 characters'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {!!errorMessage && <ErrorBanner message={errorMessage} />}
          </View>

          <View style={styles.actions}>
            <PrimaryButton label='Sign in' onPress={handleSignIn} loading={isLoading} />
            <GhostButton label='Forgot password?' onPress={() => router.push('/forgot-password')} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <SecondaryButton label='Continue as guest' onPress={handleGuestSignIn} />
        </View>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    body: { flex: 1 },
    heading: { marginTop: 26, gap: 6 },
    title: {
      fontFamily: theme.font.family.display,
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.9,
      color: theme.colors.text,
    },
    subtitle: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.subtext,
    },
    notice: {
      marginTop: 20,
      padding: 14,
      borderRadius: 13,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentSoftBorder,
    },
    noticeText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.text,
    },
    fields: { marginTop: 28, gap: 16 },
    actions: { marginTop: 24, gap: 4 },
    spacer: { flex: 1, minHeight: 24 },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
    dividerText: {
      fontFamily: theme.font.family.body,
      fontSize: 11,
      color: theme.colors.muted,
    },
  });
