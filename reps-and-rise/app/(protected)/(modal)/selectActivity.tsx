import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { usePostHog } from 'posthog-react-native';
import { useFocusEffect } from '@react-navigation/native';

// const ACTIVITIES = [
//   "Bench Press",
//   "Squat",
//   "Deadlift",
//   "Overhead Press",
//   "Barbell Row",
//   "Pull-Up",
//   "Lat Pulldown",
//   "RDL",
//   "Hip Thrust",
//   "Leg Press",
//   "Bicep Curl",
//   "Tricep Extension",
// ];

export default function SelectActivity() {
  const posthog = usePostHog();
  const [activities, setActivities] = useState([]);
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'select_activity_modal', section: 'modal' });
    }, [posthog])
  );

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from("exercises").select("id, name");
      if (!error) setActivities(data);
    };
    fetchActivities();  
  }, []);

  const filtered = activities.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

//   const filtered = ACTIVITIES.filter((a) =>
//     a.toLowerCase().includes(query.toLowerCase())
//   );

  const handleSelect = (activity) => {
    posthog.capture('exercise_selected', {
      source: 'select_activity_modal',
      exercise_id: activity.id,
      exercise_name: activity.name,
    });
    router.back(); // go back to the modal
    setTimeout(() => {
        router.setParams(
            {
                activity_id: activity.id, 
                activity_name: activity.name
            }); // send the selected activity back
    }, 0); // slight delay to ensure we're back before sending data
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Select Activity</Text>

      <TextInput
        placeholder="Search..."
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          posthog.capture('button_click', { screen: 'select_activity_modal', button: 'search_input_change', query_length: text.length });
        }}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}