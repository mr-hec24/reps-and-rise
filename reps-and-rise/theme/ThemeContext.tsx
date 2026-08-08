import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, type Theme } from './DarkTheme';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'themePreference';

type ThemeContextType = {
  /** The resolved scheme currently on screen. */
  mode: 'light' | 'dark';
  /** What the user asked for — 'system' until they override it. */
  preference: ThemePreference;
  /** Flips between light and dark, moving off 'system' on first use. */
  toggleTheme: () => void;
  setPreference: (_preference: ThemePreference) => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Restore a previously chosen override. Until it loads we follow the OS.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .catch(error => console.warn('Could not read theme preference', error));
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(error =>
      console.warn('Could not save theme preference', error)
    );
  };

  const mode: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const toggleTheme = () => setPreference(mode === 'light' ? 'dark' : 'light');

  const theme = mode === 'light' ? DefaultTheme : DarkTheme;

  return (
    <ThemeContext.Provider value={{ mode, preference, toggleTheme, setPreference, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};
