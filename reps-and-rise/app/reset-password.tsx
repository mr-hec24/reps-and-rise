import { Screen } from '@/components/Screen';
import { ErrorBanner, Field, PrimaryButton } from '@/components/ui-ember';
import { supabase } from '@/lib/supabase';
import { useThemeMode } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Linking, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

function parseParamsFromUrl(url: string) {
  try {
    // Supabase may put tokens in the fragment (#) or query (?); capture both
    const fragmentIndex = url.indexOf('#');
    const queryIndex = url.indexOf('?');
    const paramsString =
      fragmentIndex >= 0
        ? url.substring(fragmentIndex + 1)
        : queryIndex >= 0
          ? url.substring(queryIndex + 1)
          : '';

    const params: Record<string, string> = {};
    paramsString.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
    });
    return params;
  } catch (e) {
    return {} as Record<string, string>;
  }
}

export default function ResetPassword() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [readyToReset, setReadyToReset] = useState(false);

  useEffect(() => {
    const handleUrl = async (url?: string | null) => {
      setErrorMessage('');
      const link = url || (await Linking.getInitialURL());
      if (!link) {
        setErrorMessage('No reset token found in the URL');
        setLoading(false);
        return;
      }

      const params = parseParamsFromUrl(link);

      const accessToken = params['access_token'] || params['accessToken'];
      const refreshToken = params['refresh_token'] || params['refreshToken'];

      if (!accessToken) {
        setErrorMessage('No access token found in the reset link');
        setLoading(false);
        return;
      }

      try {
        // Exchange the token for a session locally so we can call updateUser
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        setReadyToReset(true);
      } catch (e: any) {
        console.error('Error setting session from deep link:', e);
        setErrorMessage(e?.message || 'Failed to initialize password reset session');
      } finally {
        setLoading(false);
      }
    };

    // Check initial URL
    handleUrl();

    // Listen for future incoming links while the screen is active
    const sub = Linking.addEventListener('url', event => {
      handleUrl(event.url);
    });

    return () => sub.remove();
  }, []);

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!password) return setErrorMessage('Password is required');
    if (password.length < 6) return setErrorMessage('Password must be at least 6 characters');
    if (password !== confirmPassword) return setErrorMessage('Passwords do not match');

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error('Error updating password:', error);
        setErrorMessage(error.message || 'Failed to reset password');
        return;
      }

      // Clear session and redirect to sign-in with success banner
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
      // show sign-in banner via AsyncStorage flag used elsewhere
      try {
        // dynamic import to avoid circular issues
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem('signupShowVerify', '1');
      } catch (e) {
        // ignore
      }
      router.push('/sign-in');
    } catch (e: any) {
      setErrorMessage(e?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen pad={24}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.body}>
          <View style={styles.heading}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>Set a new password for your account.</Text>
          </View>

          {loading && <Text style={styles.status}>Initializing…</Text>}
          {!loading && !!errorMessage && (
            <View style={styles.feedback}>
              <ErrorBanner message={errorMessage} />
            </View>
          )}

          {readyToReset && (
            <View style={styles.fields}>
              <Field
                label='New password'
                placeholder='Enter your new password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                hint='Must be at least 6 characters.'
              />
              <Field
                label='Confirm password'
                placeholder='Confirm your new password'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
              <PrimaryButton label='Set new password' onPress={handleSubmit} loading={loading} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    body: { flex: 1, justifyContent: 'center' },
    heading: { gap: 6, marginBottom: 26 },
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
    status: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.subtext,
    },
    feedback: { marginBottom: 16 },
    fields: { gap: 16 },
  });
