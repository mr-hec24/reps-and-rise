import { MIN_BOTTOM_PAD, TAB_BAR_CONTENT_HEIGHT } from '@/components/Screen';
import { useThemeMode } from '@/theme/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The design's tab indicator: a short ember pill above the label, no icon.
 */
function TabIndicator({ focused }: { focused: boolean }) {
  const { theme } = useThemeMode();

  return (
    <View
      style={{
        width: 26,
        height: 3,
        borderRadius: theme.radius.pill,
        backgroundColor: focused ? theme.colors.accent : 'transparent',
      }}
    />
  );
}

export default function TabLayout() {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();

  // Pad for the Android navigation bar / iOS home indicator. The Math.max floor
  // keeps the labels off the very edge on devices reporting a zero inset.
  const bottomInset = Math.max(insets.bottom, MIN_BOTTOM_PAD);

  return (
    <Tabs
      initialRouteName='index'
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: 10,
          paddingBottom: bottomInset,
          backgroundColor: theme.colors.surfaceSunken,
          borderTopWidth: 1,
          borderTopColor: theme.colors.hairline,
          elevation: 0,
        },
        tabBarItemStyle: { gap: 6 },
        tabBarLabelStyle: {
          fontFamily: theme.font.family.bodySemibold,
          fontSize: 11.5,
          // Explicit lineHeight: without it the label's box is shorter than the
          // glyphs and descenders get clipped.
          lineHeight: 15,
        },
        tabBarIcon: ({ focused }) => <TabIndicator focused={focused} />,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name='index' options={{ title: 'Home' }} />
      <Tabs.Screen name='calendar' options={{ title: 'Calendar' }} />
      <Tabs.Screen name='metrics' options={{ title: 'Metrics' }} />
      <Tabs.Screen name='settings' options={{ title: 'Settings' }} />
    </Tabs>
  );
}
