import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Row } from './Row';
import { useThemeMode } from '@/theme/ThemeContext';
import { Card } from './Card';
import { FontAwesome } from '@expo/vector-icons';
import { useActivities } from '@/context/activity-provider';
import { usePostHog } from 'posthog-react-native';

interface ExerciseSet {
  sets: string;
  reps: string;
  weight: string;
  _rowId?: string;
}

interface ExerciseInput {
  activity_id?: string;
  activity_name?: string;
  sets: ExerciseSet[];
}

interface ExerciseInputCardProps {
  exercise: ExerciseInput;
  onUpdate?: (exercise: ExerciseInput) => void;
  onRemove?: () => void;
  index: number;
  allExercises: ExerciseInput[];
  editable?: boolean;
}

export default function ExerciseInputCard({
  exercise,
  onUpdate,
  onRemove,
  index,
  allExercises = [],
  editable = true,
}: ExerciseInputCardProps) {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const [localExercise, setLocalExercise] = useState(exercise);
  const [activityInput, setActivityInput] = useState(exercise?.activity_name || '');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const { activities, loading } = useActivities();

  useEffect(() => {
    setLocalExercise(exercise);
    setActivityInput(exercise?.activity_name || '');
  }, [exercise]);

  const totalReps = localExercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
  const totalWeight = localExercise.sets.reduce(
    (sum, set) => sum + (parseFloat(set.weight) || 0),
    0
  );
  const averageWeight =
    localExercise.sets.length > 0 ? (totalWeight / localExercise.sets.length).toFixed(1) : '0';

  const updateExercise = (updated: ExerciseInput) => {
    setLocalExercise(updated);
    onUpdate?.(updated);
  };

  const addSet = () => {
    const newSetNumber = (localExercise.sets.length + 1).toString();
    const newSets = [...localExercise.sets, { sets: newSetNumber, reps: '', weight: '' }];
    posthog.capture('set_added', {
      exercise_id: localExercise.activity_id || null,
      set_count_after: newSets.length,
    });
    updateExercise({ ...localExercise, sets: newSets });
  };

  const removeSet = (index: number) => {
    if (localExercise.sets.length > 1) {
      const newSets = localExercise.sets.filter((_, i) => i !== index);
      posthog.capture('set_deleted', {
        exercise_id: localExercise.activity_id || null,
        removed_set_index: index,
        set_count_after: newSets.length,
      });
      updateExercise({ ...localExercise, sets: newSets });
    }
  };

  const updateSet = (index: number, key: keyof ExerciseSet, value: string) => {
    const newSets = localExercise.sets.map((set, i) =>
      i === index ? { ...set, [key]: value } : set
    );
    updateExercise({ ...localExercise, sets: newSets });
  };

  const handleActivitySearch = (text: string) => {
    setActivityInput(text);
    if (text.length > 0) {
      const filtered = activities
        .filter(activity => activity.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 3);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectActivity = (activityId: string, activityName: string) => {
    // Check if this exercise is already in the workout (excluding current card)
    const isDuplicate = allExercises.some(
      (ex, idx) => ex.activity_id === activityId && idx !== index
    );

    if (isDuplicate) {
      posthog.capture('duplicate_exercise_blocked', {
        attempted_exercise_id: activityId,
        attempted_exercise_name: activityName,
      });
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
    posthog.capture('exercise_selected', {
      exercise_id: activityId,
      exercise_name: activityName,
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.activityContainer}>
        <Row style={styles.cardHeader}>
          {editable ? (
            <TextInput
              placeholder='Search activity...'
              value={activityInput}
              onChangeText={handleActivitySearch}
              onFocus={() => activityInput.length > 0 && setShowSuggestions(true)}
              editable={!loading}
              style={styles.activityInput}
              placeholderTextColor={theme.colors.placeholder}
              textContentType='none'
              autoComplete='off'
            />
          ) : (
            <Text style={styles.readOnlyActivity}>
              {localExercise.activity_name || 'No activity selected'}
            </Text>
          )}
          {editable && (
            <TouchableOpacity
              onPress={() => {
                posthog.capture('exercise_deleted', {
                  exercise_id: localExercise.activity_id || null,
                  exercise_name: localExercise.activity_name || null,
                });
                onRemove?.();
              }}
              style={styles.removeButton}
            >
              <FontAwesome name='trash' size={18} color={theme.colors.subtext} />
            </TouchableOpacity>
          )}
        </Row>

        {editable && showSuggestions && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={item => item.id}
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
                  placeholder='Reps'
                  value={set.reps}
                  onChangeText={v => updateSet(index, 'reps', v)}
                  keyboardType='numeric'
                  style={styles.inputBox}
                  placeholderTextColor={theme.colors.placeholder}
                  textContentType='none'
                  autoComplete='off'
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                  placeholder='Weight'
                  value={set.weight}
                  onChangeText={v => updateSet(index, 'weight', v)}
                  keyboardType='numeric'
                  style={styles.inputBox}
                  placeholderTextColor={theme.colors.placeholder}
                  textContentType='none'
                  autoComplete='off'
                />
              </View>

              <TouchableOpacity
                onPress={() => removeSet(index)}
                activeOpacity={1}
                style={styles.removeButton}
              >
                <FontAwesome name='trash' size={18} color={theme.colors.subtext} />
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

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.card,
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
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      marginRight: theme.spacing.sm,
      fontFamily: theme.font.family.body,
      fontSize: 15,
      color: theme.colors.text,
    },
    readOnlyActivity: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSunken,
      borderRadius: theme.radius.md,
      marginRight: theme.spacing.sm,
      fontFamily: theme.font.family.display,
      fontSize: 15,
      color: theme.colors.text,
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
      borderBottomColor: theme.colors.hairline,
      backgroundColor: theme.colors.surfaceSunken,
    },
    suggestionText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 14,
      color: theme.colors.text,
    },
    noResults: {
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    noResultsText: {
      fontFamily: theme.font.family.body,
      color: theme.colors.subtext,
      fontSize: 12,
    },
    errorMessage: {
      backgroundColor: theme.colors.dangerSoft,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.danger,
    },
    errorText: {
      fontFamily: theme.font.family.bodySemibold,
      color: theme.colors.danger,
      fontSize: 12,
    },
    setRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
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
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 10.5,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.colors.subtext,
    },
    inputBox: {
      borderWidth: 1,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceSunken,
      fontFamily: theme.font.family.mono,
      fontSize: 15,
      color: theme.colors.text,
      borderColor: theme.colors.border,
    },
    setNumber: {
      fontFamily: theme.font.family.monoBold,
      fontSize: 15,
      textAlign: 'center',
      color: theme.colors.secondary,
      padding: theme.spacing.sm,
    },
    removeButton: {
      backgroundColor: theme.colors.iconBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xs,
      borderRadius: theme.radius.md,
      justifyContent: 'center',
    },
    removeText: {
      color: 'white',
      fontSize: 12,
    },
    addButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      padding: 12,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    addText: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 14,
      color: theme.colors.secondary,
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
      backgroundColor: theme.colors.surfaceSunken,
      paddingVertical: theme.spacing.sm,
      marginBottom: 0,
    },
    cell: {
      textAlign: 'center',
      fontFamily: theme.font.family.mono,
      fontSize: 14,
      color: theme.colors.text,
    },
    headerCell: {
      fontFamily: theme.font.family.bodySemibold,
      color: '#FFFFFF',
    },
    setCell: { width: 40 },
    repCell: { width: 100 },
    weightCell: { width: 100 },
    statsContainer: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      borderRadius: theme.radius.md,
    },
    statsText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 13,
      color: theme.colors.subtext,
      marginBottom: theme.spacing.xs,
    },
  });
