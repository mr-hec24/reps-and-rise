import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';

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
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' });
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
    <SafeAreaView className="flex h-full w-full flex-1 bg-background">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <VStack space="xl" className="h-full w-full justify-center p-6">
          <VStack space="md" className="w-full items-center">
            <Heading size="2xl">Reset Password</Heading>
            <Text className="text-center">Set a new password for your account</Text>
          </VStack>

          {loading ? (
            <Text className="text-center">Initializing...</Text>
          ) : errorMessage ? (
            <Text className="text-error-600 text-center text-sm bg-error-50 p-3 rounded-md">
              {errorMessage}
            </Text>
          ) : null}

          {readyToReset ? (
            <VStack space="lg" className="w-full">
              <FormControl size="md" isDisabled={loading} isReadOnly={false} isRequired className="w-full">
                <FormControlLabel>
                  <FormControlLabelText>New Password</FormControlLabelText>
                </FormControlLabel>
                <Input className="w-full" size="md" variant="outline">
                  <InputField
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    className="w-full"
                    secureTextEntry
                  />
                </Input>
                <FormControlHelper>
                  <FormControlHelperText>Must be at least 6 characters.</FormControlHelperText>
                </FormControlHelper>
              </FormControl>

              <FormControl size="md" isDisabled={loading} isReadOnly={false} isRequired className="w-full">
                <FormControlLabel>
                  <FormControlLabelText>Confirm Password</FormControlLabelText>
                </FormControlLabel>
                <Input className="w-full" size="md" variant="outline">
                  <InputField
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChangeText={text => setConfirmPassword(text)}
                    className="w-full"
                    secureTextEntry
                  />
                </Input>
              </FormControl>

              <Button size="lg" variant="solid" action="primary" className="w-full" onPress={handleSubmit}>
                <ButtonText>Set New Password</ButtonText>
              </Button>
            </VStack>
          ) : null}
        </VStack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
