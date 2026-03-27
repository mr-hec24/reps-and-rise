import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useThemeMode } from '@/theme/ThemeContext';
import { FontAwesome } from "@expo/vector-icons";
import ExerciseInputCard from './ExerciseInputCard';
import { usePostHog } from 'posthog-react-native';


export default function WorkoutForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  editable = true,
}) {
  const posthog = usePostHog();
  const [isEditable, setIsEditable] = useState(editable);
  const [exercises, setExercises] = useState<any[]>(() => {
    if (Array.isArray(initialValues)) {
      return initialValues.length > 0 ? initialValues : [{ activity_id: '', activity_name: '', sets: [{ sets: '', reps: '', weight: '' }] }];
    }
    if (initialValues && typeof initialValues === 'object') {
      // Migrate old single exercise format to array
      return [{
        activity_id: initialValues.activity_id || '',
        activity_name: initialValues.activity_name || '',
        sets: [{
          sets: initialValues.sets || '',
          reps: initialValues.reps || '',
          weight: initialValues.weight || ''
        }]
      }];
    }
    return [{ activity_id: '', activity_name: '', sets: [{ sets: '', reps: '', weight: '' }] }];
  });
  const [successMessage, setSuccessMessage] = useState("");

  const params = useLocalSearchParams();
  const handleSubmit = async () => {
    await onSubmit(exercises);
    posthog.capture('workout_form_saved', {
      exercise_count: exercises.length,
      total_sets: exercises.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0),
    });

    setSuccessMessage("Successfully submitted!");
    setIsEditable(false);

    setTimeout(() => setSuccessMessage(""), 2000);
  };

  useEffect(() => {
    if (params.activity_id && params.activity_name && params.index !== undefined) {
      const idxParam = Array.isArray(params.index) ? params.index[0] : params.index;
      const activityId = Array.isArray(params.activity_id) ? params.activity_id[0] : params.activity_id;
      const activityName = Array.isArray(params.activity_name) ? params.activity_name[0] : params.activity_name;
      const idx = parseInt(String(idxParam), 10);
      setExercises((prev) => {
        const newEx = [...prev];
        if (newEx[idx]) {
          newEx[idx] = { ...newEx[idx], activity_id: activityId, activity_name: activityName };
        }
        return newEx;
      });
    }
  }, [params.activity_id, params.activity_name, params.index]);

  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.md }}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {exercises.map((ex, idx) => (
          <ExerciseInputCard
            key={idx}
            index={idx}
            exercise={ex}
            allExercises={exercises as any}
            editable={isEditable}
            onUpdate={isEditable ? (updated: any) => {
              const newEx = [...exercises];
              newEx[idx] = updated;
              setExercises(newEx);
            } : undefined}
            onRemove={isEditable ? () => setExercises(exercises.filter((_, i) => i !== idx)) : undefined}
          />
        ))}

        {isEditable && (
          <TouchableOpacity
            onPress={() => {
              posthog.capture('exercise_added', { source: 'workout_form' });
              setExercises([...exercises, { activity_id: '', activity_name: '', sets: [{ sets: '', reps: '', weight: '' }] }]);
            }}
            style={styles.addButton}
          >
            <Text style={{ color: "white" }}>Add Exercise</Text>
          </TouchableOpacity>
        )}

        {successMessage !== "" && (
          <Text style={{ color: "green", textAlign: "center", marginTop: theme.spacing.sm }}>{successMessage}</Text>
        )}
      </KeyboardAwareScrollView>

      <View style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            if (isEditable) {
              handleSubmit();
            } else {
              posthog.capture('workout_edit_mode_started', { source: 'workout_form' });
              setIsEditable(true);
            }
          }}
          activeOpacity={1}
          style={[styles.circleButton, { backgroundColor: theme.colors.primary }]}>

          <FontAwesome name={isEditable ? 'save' : 'pencil'} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  addButton: {
            backgroundColor: theme.colors.secondary,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            alignItems: "center",
            marginTop: theme.spacing.xs,
          },
  circleButton: {
            backgroundColor: theme.colors.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
});