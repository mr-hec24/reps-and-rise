import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/context/auth-provider';
import { UserProvider } from '@/context/user-provider';
import { ActivityProvider } from '@/context/activity-provider';
import { ThemeProvider, useThemeMode } from '@/theme/ThemeContext';
import * as Notifications from 'expo-notifications';
import { PostHogProvider } from 'posthog-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'welcome',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Space Grotesk — headings and buttons
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    // Barlow — body copy, labels, helper text
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    // Space Mono — all numbers
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY!}
      options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST }}
    >
      <GluestackUIProvider>
        <ThemeProvider>
          <ActivityProvider>
            <AuthProvider>
              <UserProvider>
                <RootLayoutNav />
              </UserProvider>
            </AuthProvider>
          </ActivityProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </PostHogProvider>
  );
}

function RootLayoutNav() {
  const { theme, mode } = useThemeMode();

  return (
    <GluestackUIProvider>
      {/* No backgroundColor: it is a no-op under Android edge-to-edge and warns. */}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name='(protected)' />
        <Stack.Screen name='welcome' />
        {/* The auth screens carry their own back chevron and heading, so no native header. */}
        <Stack.Screen name='sign-up' options={{ presentation: 'modal', gestureEnabled: true }} />
        <Stack.Screen name='sign-in' options={{ presentation: 'modal', gestureEnabled: true }} />
        <Stack.Screen name='verify-email' options={{ gestureEnabled: true }} />
        <Stack.Screen name='forgot-password' options={{ gestureEnabled: true }} />
      </Stack>
    </GluestackUIProvider>
  );
}
