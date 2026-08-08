import { MIN_BOTTOM_PAD, TAB_BAR_CONTENT_HEIGHT } from '@/components/Screen';
import { useThemeMode } from '@/theme/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

/**
 * Icon plus label, rather than the design doc's bare ember pill: an icon is a
 * far better landmark for anyone scanning the bar, and it gives assistive tech
 * something to sit on. The active tab is marked with the ember tint instead.
 */
const TABS: { name: string; title: string; icon: IconName; a11y: string }[] = [
  { name: 'index', title: 'Home', icon: 'home', a11y: 'Home tab' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar', a11y: 'Calendar tab, workout history' },
  { name: 'metrics', title: 'Metrics', icon: 'bar-chart', a11y: 'Metrics tab' },
  { name: 'settings', title: 'Settings', icon: 'gear', a11y: 'Settings tab' },
];

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
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          backgroundColor: theme.colors.surfaceSunken,
          borderTopWidth: 1,
          borderTopColor: theme.colors.hairline,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: theme.font.family.bodySemibold,
          fontSize: 11,
          // Explicit lineHeight: without it the label's box is shorter than the
          // glyphs and descenders get clipped.
          lineHeight: 14,
        },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.a11y,
            tabBarIcon: ({ color }) => <FontAwesome name={tab.icon} size={21} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
