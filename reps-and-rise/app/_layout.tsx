import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && !inAuthGroup) {
      // User is signed in and not in the auth group.
      // We want to make sure they are in the main app group.
      router.replace('/(app)');
    } else if (!session) {
      // User is not signed in.
      // Redirect to the login page.
      router.replace('/(auth)/login');
    }
  }, [session, loading, segments]);

  // Show a loading indicator while we check for a session
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
