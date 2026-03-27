import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { DarkTheme, DefaultTheme } from '@/theme/DarkTheme';
import { StatusBar } from 'expo-status-bar';
import { useThemeMode } from '@/theme/ThemeContext';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/context/auth-provider';
import { UserProvider } from '@/context/user-provider';
import { ActivityProvider } from '@/context/activity-provider';
import { ThemeProvider } from '@/theme/ThemeContext';
import * as Notifications from "expo-notifications"
import { PostHogProvider } from 'posthog-react-native'

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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
  const colorScheme = useColorScheme();
  const { theme, mode } = useThemeMode();

  return (
    <GluestackUIProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name='(protected)' />
          <Stack.Screen name='welcome' />
          <Stack.Screen
            name='sign-up'
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Sign Up',
              headerStyle: {
                backgroundColor:
                  colorScheme === 'dark'
                    ? DarkTheme.colors.background
                    : DefaultTheme.colors.background,
              },
              headerTintColor:
                colorScheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name='sign-in'
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Sign In',
              headerStyle: {
                backgroundColor:
                  colorScheme === 'dark'
                    ? DarkTheme.colors.background
                    : DefaultTheme.colors.background,
              },
              headerTintColor:
                colorScheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text,
              gestureEnabled: true,
            }}
          />
        </Stack>
    </GluestackUIProvider>
  );
}
