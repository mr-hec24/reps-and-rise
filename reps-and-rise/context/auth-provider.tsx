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
  isGuest: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
  initialized: false,
  session: null,
  isGuest: false,
  signUp: async () => {},
  signIn: async () => {},
  signInAsGuest: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Attempting to sign up with email:', email);

      const sessionResult = await supabase.auth.getSession();
      const currentSession = sessionResult?.data?.session;
      const isUpgradingGuest = Boolean(
        isGuest ||
        (currentSession && !currentSession.user?.email)
      );

      let data: any;
      let error: any;

      if (isUpgradingGuest) {
        console.log('Upgrading anonymous guest to a registered account');

        const updatePromise = supabase.auth.updateUser({
          email,
          password,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Sign up timeout - please check your network connection')),
            10000
          )
        );

        ({ data, error } = (await Promise.race([updatePromise, timeoutPromise])) as any);
      } else {
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

        ({ data, error } = (await Promise.race([signUpPromise, timeoutPromise])) as any);
      }

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
        } else if (error.message?.includes('email rate limit exceeded')) {
          throw new Error(
            'You have made too many registration attempts for this email. Please wait a few minutes and try again.'
          );
        } else {
          throw new Error(error.message || 'An error occurred during sign up. Please try again.');
        }
      }

      if (isUpgradingGuest) {
        if (error) {
          throw error;
        }

        setIsGuest(false);

        const sessionResult = await supabase.auth.getSession();
        if ('data' in sessionResult && sessionResult.data?.session) {
          setSession(sessionResult.data.session);
        }

        console.log('Guest upgraded to registered account successfully');
        return;
      }

      if (data.session) {
        setSession(data.session);
        setIsGuest(false);
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
        setIsGuest(false);
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

  const signInAsGuest = async () => {
    try {
      console.log('Attempting anonymous sign in...');

      // Use Supabase's built-in anonymous authentication
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Error signing in anonymously:', error);
        if (error.message?.includes('Network request failed')) {
          throw new Error(
            'Network connection failed. Please check your internet connection and try again.'
          );
        }
        throw new Error(error.message || 'Unable to create guest session. Please try again.');
      }

      if (data.session) {
        setSession(data.session);
        // Anonymous users have no email, so we detect guest status this way
        setIsGuest(!data.session.user?.email);
        console.log('Anonymous session created successfully');
        return;
      }

      throw new Error('Anonymous sign in failed - no session created.');
    } catch (error) {
      console.error('Error during anonymous sign in:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Requesting password reset for:', email);

      const redirectTo = process.env.EXPO_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || undefined,
      });

      if (redirectTo) {
        console.log('Password reset redirectTo:', redirectTo);
      }
      if (error) {
        console.error('Error sending password reset email:', error);
        if (error.message?.includes('Network request failed')) {
          throw new Error(
            'Network connection failed. Please check your internet connection and try again.'
          );
        }
        throw new Error(error.message || 'Unable to send password reset instructions. Please try again.');
      }

      console.log('Password reset email sent successfully', data);
    } catch (error) {
      console.error('Error during reset password request:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');

      // Always clear the session locally first to ensure the user is logged out
      setSession(null);
      setIsGuest(false);

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
            // Anonymous users in Supabase have no email
            setIsGuest(!session.user?.email);
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
            // Anonymous users in Supabase have no email
            setIsGuest(!session?.user?.email);
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
        router.replace('/(protected)/(tabs)');
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
        isGuest,
        signUp,
        signIn,
        signInAsGuest,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
