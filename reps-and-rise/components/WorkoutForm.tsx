import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";


export default function WorkoutForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState(initialValues);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const params = useLocalSearchParams();
  const handleSubmit = async () => {
    await onSubmit(form);

    setSuccessMessage("Successfully submitted!");

    setTimeout(() => setSuccessMessage(""), 2000);
  };

  useEffect(() => {
    if (params.activity_id && params.activity_name) {
      setForm((prev) => ({ 
        ...prev, 
        activity_id: params.activity_id,
        activity_name: params.activity_name
      }));
    }
  }, [params.activity_id, params.activity_name ]);

  return (
    <View style={{ gap: 12 }}>
      {/* Activity dropdown placeholder */}
    <TouchableOpacity
        onPress={() =>
            router.push({
                pathname:"/(protected)/(modal)/selectActivity",
            })
        }
        style={{
            borderWidth: 1,
            padding: 12,
            borderRadius: 6,
        }}>
            <Text>{form.activity_name || "Select Activity"}</Text>
    </TouchableOpacity>

      {/* <TextInput
        placeholder="Activity"
        value={form.activity}
        onChangeText={(v) => handleChange("activity", v)}
        style={{ borderWidth: 1, padding: 8 }}
      /> */}

      <TextInput
        placeholder="Weight"
        value={String(form.weight)}
        onChangeText={(v) => handleChange("weight", v)}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8 }}
      />

      <TextInput
        placeholder="Reps"
        value={String(form.reps)}
        onChangeText={(v) => handleChange("reps", v)}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8 }}
      />

      <TextInput
        placeholder="Sets"
        value={String(form.sets)}
        onChangeText={(v) => handleChange("sets", v)}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8 }}
      />

      {successMessage !== "" && (
        <Text style={{ color: "green" }}>{successMessage}</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "black",
          padding: 12,
          borderRadius: 6,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}