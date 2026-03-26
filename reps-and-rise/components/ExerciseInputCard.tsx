import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Row } from "./Row";
import { useThemeMode } from '@/theme/ThemeContext';
import { Card } from "./Card";
import { FontAwesome } from "@expo/vector-icons";
import { useActivities } from "@/context/activity-provider";

export default function ExerciseInputCard({ exercise, onUpdate, onRemove, index, allExercises = [], editable = true }) {
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const [localExercise, setLocalExercise] = useState(exercise);
  const [activityInput, setActivityInput] = useState(exercise?.activity_name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const { activities, loading } = useActivities();

  useEffect(() => {
    setLocalExercise(exercise);
    setActivityInput(exercise?.activity_name || '');
  }, [exercise]);

  const totalReps = localExercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
  const totalWeight = localExercise.sets.reduce((sum, set) => sum + (parseFloat(set.weight) || 0), 0);
  const averageWeight = localExercise.sets.length > 0 ? (totalWeight / localExercise.sets.length).toFixed(1) : '0';

  const updateExercise = (updated) => {
    setLocalExercise(updated);
    onUpdate(updated);
  };

  const addSet = () => {
    const newSetNumber = (localExercise.sets.length + 1).toString();
    const newSets = [...localExercise.sets, { sets: newSetNumber, reps: '', weight: '' }];
    updateExercise({ ...localExercise, sets: newSets });
  };

  const removeSet = (index) => {
    if (localExercise.sets.length > 1) {
      const newSets = localExercise.sets.filter((_, i) => i !== index);
      updateExercise({ ...localExercise, sets: newSets });
    }
  };

  const updateSet = (index, key, value) => {
    const newSets = localExercise.sets.map((set, i) =>
      i === index ? { ...set, [key]: value } : set
    );
    updateExercise({ ...localExercise, sets: newSets });
  };

  const handleActivitySearch = (text) => {
    setActivityInput(text);
    if (text.length > 0) {
      const filtered = activities.filter((activity) =>
        activity.name.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectActivity = (activityId, activityName) => {
    // Check if this exercise is already in the workout (excluding current card)
    const isDuplicate = allExercises.some(
      (ex, idx) => ex.activity_id === activityId && idx !== index
    );

    if (isDuplicate) {
      setDuplicateError(`${activityName} is already in your workout!`);
      setTimeout(() => setDuplicateError(''), 3000); // Clear error after 3 seconds
      return;
    }

    setActivityInput(activityName);
    setSuggestions([]);
    setShowSuggestions(false);
    setDuplicateError(''); // Clear any previous error
    updateExercise({
      ...localExercise,
      activity_id: activityId,
      activity_name: activityName,
    });
  };

  return (
    <Card style={styles.card}>
    <View style={styles.activityContainer}>
      <Row style={styles.cardHeader}>
        {editable ? (
          <TextInput
            placeholder="Search activity..."
            value={activityInput}
            onChangeText={handleActivitySearch}
            onFocus={() => activityInput.length > 0 && setShowSuggestions(true)}
            editable={!loading}
            style={styles.activityInput}
            placeholderTextColor={theme.colors.placeholder}
          />
        ) : (
          <Text style={styles.readOnlyActivity}>{localExercise.activity_name || 'No activity selected'}</Text>
        )}
        {editable && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <FontAwesome name="trash" size={theme.spacing.lg} color={theme.colors.white} />
          </TouchableOpacity>
        )}
      </Row>

      {editable && showSuggestions && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectActivity(item.id, item.name)}
              style={styles.suggestionItem}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      {editable && showSuggestions && suggestions.length === 0 && activityInput.length > 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No activities found</Text>
        </View>
      )}
      
      {duplicateError && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>{duplicateError}</Text>
        </View>
      )}
    </View>

      {editable ? (
        <>
          {localExercise.sets.map((set, index) => (
            <Row key={index} style={styles.setRow}>
              <View style={styles.setGroup}>
                <Text style={styles.inputLabel}>Set</Text>
                <Text style={styles.setNumber}>{index + 1}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  placeholder="Reps"
                  value={set.reps}
                  onChangeText={(v) => updateSet(index, 'reps', v)}
                  keyboardType="numeric"
                  style={styles.inputBox}
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                  placeholder="Weight"
                  value={set.weight}
                  onChangeText={(v) => updateSet(index, 'weight', v)}
                  keyboardType="numeric"
                  style={styles.inputBox}
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <TouchableOpacity onPress={() => removeSet(index)} activeOpacity={1} style={styles.removeButton}>
                <FontAwesome name="trash" size={theme.spacing.lg} color={theme.colors.white} />
              </TouchableOpacity>
            </Row>
          ))}

          <TouchableOpacity onPress={addSet} activeOpacity={1} style={styles.addButton}>
            <Text style={styles.addText}>+ Add Set</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.tableContainer}>
            <Row style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell, styles.setCell]}>Set</Text>
              <Text style={[styles.cell, styles.headerCell, styles.repCell]}>Reps</Text>
              <Text style={[styles.cell, styles.headerCell, styles.weightCell]}>Weight</Text>
            </Row>
            {localExercise.sets.map((set, index) => (
              <Row key={index} style={styles.tableRow}>
                <Text style={[styles.cell, styles.setCell]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.repCell]}>{set.reps || '0'}</Text>
                <Text style={[styles.cell, styles.weightCell]}>{set.weight || '0'}</Text>
              </Row>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Total Sets: {localExercise.sets.length}</Text>
            <Text style={styles.statsText}>Total Reps: {totalReps}</Text>
            <Text style={styles.statsText}>Average Weight: {averageWeight} lbs</Text>
          </View>
        </>
      )}

    </Card>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  activitySelection: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.iconBackground,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.sm,
  },
  activityContainer: {
    marginBottom: theme.spacing.sm,
  },
  activityInput: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.iconBackground,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  readOnlyActivity: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.iconBackground,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  readOnlyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  suggestionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  noResults: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  noResultsText: {
    color: theme.colors.border,
    fontSize: 12,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '600',
  },
  setRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  setNumberContainer: {
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.primary,
  },
  inputGroup: {
    flex: 0,
    width: 100,
  },
  setGroup: {
    flex: 0,
    width: 40,
  },
  inputLabel: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 12,
    color: theme.colors.text,
  },
  inputBox: {
    borderWidth: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    color: theme.colors.text,
    borderColor: theme.colors.border,
  },
  setNumber: {
    fontSize: theme.font.body,
    fontWeight: theme.font.weight.semibold,
    textAlign: "center",
    color: theme.colors.primary,
    padding: theme.spacing.sm,
  },
  removeButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
  },
  removeText: {
    color: "white",
    fontSize: 12,
  },
  addButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  addText: {
    color: theme.colors.primary,
    fontWeight: theme.font.weight.semibold,
  },
  tableContainer: {
    marginTop: theme.spacing.sm,
  },
  tableHeader: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: 0,
  },
  tableRow: {
    backgroundColor: theme.colors.iconBackground,
    paddingVertical: theme.spacing.sm,
    marginBottom: 0,
  },
  cell: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.text,
  },
  headerCell: {
    fontWeight: 'bold',
    color: 'white',
  },
  setCell: { width: 40 },
  repCell: { width: 100 },
  weightCell: { width: 100 },
  statsContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.sm,
  },
  statsText: {
    fontSize: 14,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
});