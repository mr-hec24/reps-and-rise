import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

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
  const [activities, setActivities] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from("activities").select("id, activity_name");
      if (!error) setActivities(data);
    };
    fetchActivities();  
  }, []);

  const filtered = activities.filter((a) =>
    a.activity_name.toLowerCase().includes(query.toLowerCase())
  );

//   const filtered = ACTIVITIES.filter((a) =>
//     a.toLowerCase().includes(query.toLowerCase())
//   );

  const handleSelect = (activity) => {
    router.back(); // go back to the modal
    setTimeout(() => {
        router.setParams(
            {
                activity_id: activity.id, 
                activity_name: activity.activity_name
            }); // send the selected activity back
    }, 0); // slight delay to ensure we're back before sending data
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Select Activity</Text>

      <TextInput
        placeholder="Search..."
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.activity_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}