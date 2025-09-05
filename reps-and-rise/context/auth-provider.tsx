import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// Platform-specific storage helper
const getPlatformStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getAllKeys: () => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(Object.keys(window.localStorage));
        }
        return Promise.resolve([]);
      },
      multiRemove: (keys: string[]) => {
        if (typeof window !== 'undefined') {
          keys.forEach(key => window.localStorage.removeItem(key));
        }
        return Promise.resolve();
      },
    };
  }
  return AsyncStorage;
};

type AuthState = {
  initialized: boolean;
  session: Session | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
  initialized: false,
  session: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Attempting to sign up with email:', email);

      // Add timeout to prevent hanging
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Sign up timeout - please check your network connection')),
          10000
        )
      );

      const { data, error } = (await Promise.race([signUpPromise, timeoutPromise])) as any;

      if (error) {
        console.error('Error signing up:', error);

        // Provide more user-friendly error messages
        if (error.message?.includes('Network request failed')) {
          throw new Error(
            'Network connection failed. Please check your internet connection and try again.'
          );
        } else if (error.message?.includes('User already registered')) {
          throw new Error(
            'An account with this email already exists. Please try signing in instead.'
          );
        } else if (error.message?.includes('Password should be at least')) {
          throw new Error('Password is too weak. Please choose a stronger password.');
        } else if (error.message?.includes('Invalid email')) {
          throw new Error('Invalid email address. Please enter a valid email.');
        } else {
          throw new Error(error.message || 'An error occurred during sign up. Please try again.');
        }
      }

      if (data.session) {
        setSession(data.session);
        console.log('User signed up successfully:', data.user);
      } else {
        console.log('No session returned from sign up - user may need to verify email');
        // Some Supabase configurations require email verification
        if (data.user && !data.session) {
          throw new Error(
            'Account created successfully. Please check your email to verify your account before signing in.'
          );
        }
      }
    } catch (error) {
      console.error('Network or authentication error during sign up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in...');

      // Add timeout to prevent hanging
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Sign in timeout - please check your network connection')),
          10000
        )
      );

      const { data, error } = (await Promise.race([signInPromise, timeoutPromise])) as any;

      if (error) {
        console.error('Error signing in:', error);

        // Provide more user-friendly error messages
        if (error.message?.includes('Network request failed')) {
          throw new Error(
            'Network connection failed. Please check your internet connection and try again.'
          );
        } else if (error.message?.includes('Invalid login credentials')) {
          throw new Error(
            'Invalid email or password. Please check your credentials and try again.'
          );
        } else {
          throw new Error(error.message || 'An error occurred during sign in. Please try again.');
        }
      }

      if (data.session) {
        setSession(data.session);
        console.log('User signed in successfully');
      } else {
        console.log('No session returned from sign in');
        throw new Error('Sign in failed - no session created. Please try again.');
      }
    } catch (error) {
      console.error('Network or authentication error during sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');

      // Always clear the session locally first to ensure the user is logged out
      setSession(null);

      // Manually clear all Supabase-related storage to prevent restoration on refresh
      try {
        const allKeys = await getPlatformStorage().getAllKeys();
        const supabaseKeys = allKeys.filter(key => key.startsWith('sb-'));

        console.log('All AsyncStorage keys:', allKeys);
        console.log('Supabase keys found:', supabaseKeys);

        if (supabaseKeys.length > 0) {
          await getPlatformStorage().multiRemove(supabaseKeys);
          console.log('Successfully cleared Supabase auth data from AsyncStorage');
        } else {
          console.log('No Supabase keys found in AsyncStorage');
        }
      } catch (storageError) {
        console.warn('Error clearing AsyncStorage:', storageError);
      }

      // Attempt to sign out from Supabase (with timeout)
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );

      try {
        const { error } = (await Promise.race([signOutPromise, timeoutPromise])) as any;

        if (error) {
          console.warn(
            'Network error during Supabase sign out (user still logged out locally):',
            error.message
          );
        } else {
          console.log('Successfully signed out from Supabase');
        }
      } catch (timeoutError) {
        console.warn('Supabase sign out timed out (user still logged out locally)');
      }

      console.log('Sign out process completed');
    } catch (error) {
      console.warn('Error during sign out process (user still logged out locally):', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');

        // Try to get current session (with timeout)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        try {
          const {
            data: { session },
            error,
          } = (await Promise.race([sessionPromise, timeoutPromise])) as any;
          if (error) {
            console.warn('Error getting session (will continue without):', error.message);
          } else if (session) {
            console.log('Found existing session');
            setSession(session);
          } else {
            console.log('No existing session found');
          }
        } catch (timeoutError) {
          console.warn('Session check timed out, continuing without session');
        }

        // Set up auth state listener (but don't block on it)
        try {
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log(
              'Auth state changed:',
              _event,
              session ? 'User logged in' : 'User logged out'
            );
            setSession(session);
          });

          // Cleanup function (but don't block on this either)
          return () => {
            try {
              subscription?.unsubscribe();
            } catch (error) {
              console.warn('Error cleaning up auth subscription:', error);
            }
          };
        } catch (error) {
          console.warn('Error setting up auth listener:', error);
        }
      } catch (error) {
        console.warn('Error initializing auth:', error);
      } finally {
        // Always mark as initialized so the app can continue
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (initialized) {
      if (session) {
        router.replace('/');
      } else {
        router.replace('/welcome');
      }
    }
    // eslint-disable-next-line
  }, [initialized, session]);

  return (
    <AuthContext.Provider
      value={{
        initialized,
        session,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
