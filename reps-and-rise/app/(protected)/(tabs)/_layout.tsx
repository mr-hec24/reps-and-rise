import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { useThemeMode } from '@/theme/ThemeContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { theme } = useThemeMode();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name='calendar'
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name='calendar' color={color} />,
        }}
      />
      <Tabs.Screen
        name='metrics'
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color }) => <TabBarIcon name='bar-chart' color={color} />,
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name='home' color={color} />,
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name='gear' color={color} />,
        }}
      />
      {/* Hide everything that is NOT a tab */}
    </Tabs>
  );
}
