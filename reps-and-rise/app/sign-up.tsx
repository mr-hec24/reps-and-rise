import { Screen } from '@/components/Screen';
import { BackButton, ErrorBanner, Field, PrimaryButton } from '@/components/ui-ember';
import { useAuth } from '@/context/auth-provider';
import { useThemeMode } from '@/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const { signUp, isGuest } = useAuth();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!firstName.trim()) {
      setErrorMessage('First name is required');
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage('Last name is required');
      return false;
    }
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setErrorMessage('Password is required');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
      // On successful signup (including cases where email verification is required),
      // flag sign-in to show a verification notice and send the user to the
      // confirm-email screen.
      try {
        await AsyncStorage.setItem('signupShowVerify', '1');
      } catch (e) {
        console.warn('Unable to set signup flag in storage', e);
      }
      router.push({ pathname: '/verify-email', params: { email } });
    } catch (error) {
      console.error('Error signing up:', error);

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          setErrorMessage(
            'Unable to connect to the authentication service. Please check your internet connection and try again. If the problem persists, the app may need to be configured with valid credentials.'
          );
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please try again.');
        } else if (error.message.includes('User already registered')) {
          setErrorMessage(
            'An account with this email already exists. Please try signing in instead.'
          );
        } else if (error.message.includes('Password should be at least')) {
          setErrorMessage('Password is too weak. Please choose a stronger password.');
        } else {
          setErrorMessage(error.message || 'An error occurred during sign up. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen pad={0}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => router.push('/welcome')} />

        <View style={styles.heading}>
          <Text style={styles.title}>
            {isGuest ? 'Register your account' : 'Start your first session'}
          </Text>
          <Text style={styles.subtitle}>
            {isGuest
              ? 'Finish registering your guest account with an email and password.'
              : 'Takes under a minute. No plan to pick, no quiz.'}
          </Text>
        </View>

        <View style={styles.fields}>
          <View style={styles.nameRow}>
            <View style={styles.nameCell}>
              <Field
                label='First name'
                placeholder='Alex'
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
            </View>
            <View style={styles.nameCell}>
              <Field
                label='Last name'
                placeholder='Rivera'
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
            </View>
          </View>

          <Field
            label='Email'
            placeholder='you@example.com'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            editable={!isLoading}
          />
          <Field
            label='Password'
            placeholder='Enter your password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          <Field
            label='Confirm password'
            placeholder='Confirm your password'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
            hint='Password must be at least 6 characters long.'
          />

          {!!errorMessage && <ErrorBanner message={errorMessage} />}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={isLoading ? 'Creating account…' : 'Create account'}
            onPress={handleSignUp}
            loading={isLoading}
          />
          <Text style={styles.legal}>
            By continuing you agree to Phoenix Soteria&apos;s terms and privacy policy.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    body: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    heading: { marginTop: 22, gap: 6 },
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
    fields: { marginTop: 24, gap: 14 },
    nameRow: { flexDirection: 'row', gap: 12 },
    nameCell: { flex: 1 },
    actions: { marginTop: 22, gap: 10 },
    legal: {
      textAlign: 'center',
      fontFamily: theme.font.family.body,
      fontSize: 11,
      lineHeight: 17,
      color: theme.colors.muted,
    },
  });
