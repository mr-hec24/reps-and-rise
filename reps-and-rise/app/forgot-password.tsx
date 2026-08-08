import { Screen } from '@/components/Screen';
import {
  BackButton,
  ErrorBanner,
  Field,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui-ember';
import { useAuth } from '@/context/auth-provider';
import { useThemeMode } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function ForgotPassword() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    setMessage('');

    if (!validateForm()) {
      return;
    }
    // Prevent repeat sends from the client too quickly
    if (cooldown > 0) {
      setErrorMessage(`Please wait ${cooldown} seconds before requesting another link.`);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset instructions have been sent to your email.');
      // Start a short client-side cooldown to avoid rapid retries
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen pad={24}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.body}>
          <BackButton onPress={() => router.push('/sign-in')} />

          <View style={styles.heading}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>Enter your email to receive reset instructions.</Text>
          </View>

          <View style={styles.field}>
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
          </View>

          <PrimaryButton
            label={isLoading ? 'Sending…' : 'Send reset link'}
            onPress={handleResetPassword}
            loading={isLoading}
            style={styles.action}
          />

          {!!errorMessage && (
            <View style={styles.feedback}>
              <ErrorBanner message={errorMessage} />
            </View>
          )}

          {!!message && (
            <View style={styles.feedback}>
              <View style={styles.notice}>
                <Text style={styles.noticeText}>{message}</Text>
              </View>
              {cooldown > 0 && (
                <Text style={styles.cooldown}>
                  You can request another link in {cooldown} second{cooldown === 1 ? '' : 's'}.
                </Text>
              )}
            </View>
          )}

          <View style={styles.spacer} />
          <SecondaryButton
            label='Already have an account?'
            onPress={() => router.push('/sign-in')}
          />
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
      lineHeight: 22,
      color: theme.colors.subtext,
    },
    field: { marginTop: 26 },
    action: { marginTop: 22 },
    feedback: { marginTop: 16, gap: 8 },
    notice: {
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
    cooldown: {
      textAlign: 'center',
      fontFamily: theme.font.family.body,
      fontSize: 12,
      color: theme.colors.subtext,
    },
    spacer: { flex: 1, minHeight: 24 },
  });
