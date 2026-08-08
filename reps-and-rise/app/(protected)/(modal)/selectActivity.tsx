import { Screen } from '@/components/Screen';
import { BackButton } from '@/components/ui-ember';
import { supabase } from '@/lib/supabase';
import { useThemeMode } from '@/theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ActivityItem {
  id: string;
  name: string;
}

export default function SelectActivity() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'select_activity_modal', section: 'modal' });
    }, [posthog])
  );

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from('exercises').select('id, name');
      if (!error && data) setActivities(data as ActivityItem[]);
    };
    fetchActivities();
  }, []);

  const filtered = activities.filter(activity =>
    activity.name.toLowerCase().includes(query.toLowerCase())
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleSelect = (activity: ActivityItem) => {
    posthog.capture('exercise_selected', {
      source: 'select_activity_modal',
      exercise_id: activity.id,
      exercise_name: activity.name,
    });
    router.back(); // go back to the caller
    setTimeout(() => {
      // send the selected activity back
      router.setParams({ activity_id: activity.id, activity_name: activity.name });
    }, 0); // slight delay to ensure we're back before sending data
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <Text style={styles.headerTitle}>Select exercise</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <TextInput
          placeholder='Search exercises…'
          placeholderTextColor={theme.colors.placeholder}
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          autoCorrect={false}
        />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No exercises found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={styles.row}
              accessibilityRole='button'
            >
              <Text style={styles.rowText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerTitle: {
      flex: 1,
      fontFamily: theme.font.family.display,
      fontSize: 18,
      letterSpacing: -0.36,
      color: theme.colors.text,
    },
    headerSpacer: { width: 38 },
    body: { flex: 1, paddingHorizontal: 20, gap: 12 },
    search: {
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: 13,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontFamily: theme.font.family.body,
      fontSize: 15,
    },
    row: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.hairline,
    },
    rowText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 15,
      color: theme.colors.text,
    },
    empty: {
      paddingVertical: 20,
      fontFamily: theme.font.family.body,
      fontSize: 13,
      color: theme.colors.subtext,
    },
  });
