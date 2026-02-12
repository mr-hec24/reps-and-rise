import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/context/auth-provider';
import { UserProvider } from '@/context/user-provider';

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

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode='light'>
      <AuthProvider>
        <UserProvider>
          <RootLayoutNav />
        </UserProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode='light'>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
