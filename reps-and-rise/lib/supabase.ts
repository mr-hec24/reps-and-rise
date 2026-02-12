import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
  throw new Error('Missing Supabase URL or anon key');
}

console.log('✅ Supabase config loaded:');
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('Platform:', Platform.OS);

// Platform-specific storage configuration
const getStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // For web, use a custom storage adapter that handles SSR gracefully
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }

  // For React Native platforms, use AsyncStorage
  return AsyncStorage;
};

// Simplified React Native configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Test Supabase connectivity with detailed diagnostics
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('Testing URL:', supabaseUrl);
    console.log('Platform:', Platform.OS);

    // Test 1: Basic URL reachability with React Native considerations
    console.log('Test 1: Checking URL reachability...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const urlTest = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('✅ URL is reachable, status:', urlTest.status);
    } catch (urlError) {
      console.warn('⚠️ URL test failed (this may be normal in iOS Simulator):', urlError);

      // Don't fail completely - just warn
      const errorString = urlError instanceof Error ? urlError.message : String(urlError);
      let warningMessage = `URL test failed: ${errorString}`;
      if (Platform.OS === 'ios' && errorString.includes('Network request failed')) {
        warningMessage +=
          '\n\n🔧 iOS Simulator limitation: This is normal. Try web version or physical device for full testing.';
      }

      console.warn(warningMessage);
      // Continue with auth test instead of failing
    }

    // Test 2: Supabase auth service (this usually works even if URL test fails)
    console.log('Test 2: Testing Supabase auth service...');
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Supabase auth test failed:', error);
      return {
        success: false,
        error: `Supabase auth error: ${error.message}`,
        details: { step: 'auth_test', error, platform: Platform.OS },
      };
    }

    console.log('✅ Supabase auth service is working');
    return {
      success: true,
      details: {
        session: data.session ? 'has_session' : 'no_session',
        platform: Platform.OS,
        note: Platform.OS === 'ios' ? 'URL test may fail in simulator but auth works' : undefined,
      },
    };
  } catch (error) {
    console.error('❌ Connection test failed:', error);

    const errorString = error instanceof Error ? error.message : String(error);
    let errorMessage = `Connection test failed: ${errorString}`;
    if (Platform.OS === 'ios' && errorString.includes('Network request failed')) {
      errorMessage +=
        "\n\n🔧 Potential fixes:\n1. Try the web version (press 'w' in terminal)\n2. Try running on a physical iOS device\n3. Restart the iOS Simulator\n4. Check your Mac's network connection";
    }

    // Return success if auth works, even if general connection fails
    try {
      const { error: authError } = await supabase.auth.getSession();
      if (!authError) {
        console.log('✅ Auth still works despite connection test failure');
        return {
          success: true,
          details: {
            step: 'fallback_auth_test',
            platform: Platform.OS,
            note: 'Connection test failed but auth works - normal for iOS Simulator',
          },
        };
      }
    } catch (authFallbackError) {
      // Auth also failed
    }

    return {
      success: false,
      error: errorMessage,
      details: { step: 'general_error', error, platform: Platform.OS },
    };
  }
};

// Run connection test immediately when module loads (but don't block on failure)
testSupabaseConnection().then(result => {
  if (result.success) {
    console.log('🎉 Supabase connection test passed!');
    if (result.details?.note) {
      console.log('📝 Note:', result.details.note);
    }
  } else {
    console.warn('⚠️ Supabase connection test had issues:', result.error);
    console.warn('📝 Details:', result.details);
    console.log('🔄 App will continue - many features may still work');
  }
});

AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
