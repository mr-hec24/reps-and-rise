import { MIN_BOTTOM_PAD } from '@/components/Screen';
import { useThemeMode } from '@/theme/ThemeContext';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DateFieldProps {
  value: Date;
  onChange: (_next: Date) => void;
  /** `chip` is the compact header pill; `row` is the labelled settings row. */
  variant?: 'chip' | 'row';
  /** Label shown to the left of the value in the `row` variant. */
  label?: string;
  /** dayjs format for the button text. */
  format?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * One tap opens a calendar, on every platform.
 *
 * iOS needs its own path. With `display='default'` the iOS 14+ picker is the
 * *compact* widget: it stays mounted and fires `onChange` while the user is
 * still interacting, so unmounting it on the first event throws the selection
 * away and the field snaps back to its old value. Instead iOS gets a sheet
 * holding the full inline calendar, writing to a draft that only lands on Done.
 *
 * Android's `display='calendar'` is a real modal dialog that fires once with a
 * final value, so it commits directly — and reports `dismissed` on cancel.
 */
export function DateField({
  value,
  onChange,
  variant = 'chip',
  label = 'Date',
  format,
  accessibilityLabel,
  style,
}: DateFieldProps) {
  const { theme, mode } = useThemeMode();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const shown = dayjs(value).format(format ?? (variant === 'chip' ? 'ddd MMM D' : 'MMMM D, YYYY'));

  const openPicker = () => {
    setDraft(value);
    setOpen(true);
  };

  // Android + web: the platform control owns the interaction, so commit here.
  const handleDirectChange = (event: DateTimePickerEvent, next?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event?.type === 'dismissed' || !next) return;
      onChange(next);
      return;
    }
    if (next) onChange(next);
  };

  const button = (
    <TouchableOpacity
      onPress={openPicker}
      activeOpacity={0.8}
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel ?? `${label}: ${shown}. Tap to change.`}
      style={[variant === 'chip' ? styles.chip : styles.rowButton, style]}
    >
      <Text style={variant === 'chip' ? styles.chipText : styles.rowValue}>{shown}</Text>
      <Text style={styles.caret}>▾</Text>
    </TouchableOpacity>
  );

  return (
    <>
      {variant === 'row' ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{label}</Text>
          {button}
        </View>
      ) : (
        button
      )}

      {open && Platform.OS !== 'ios' && (
        <DateTimePicker
          value={value}
          mode='date'
          display={Platform.OS === 'android' ? 'calendar' : 'default'}
          onChange={handleDirectChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          visible={open}
          transparent
          animationType='slide'
          onRequestClose={() => setOpen(false)}
        >
          <View style={styles.backdrop}>
            <View
              style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_PAD) }]}
            >
              <View style={styles.sheetHead}>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  hitSlop={10}
                  accessibilityRole='button'
                >
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{label}</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(draft);
                    setOpen(false);
                  }}
                  hitSlop={10}
                  accessibilityRole='button'
                >
                  <Text style={styles.done}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={draft}
                mode='date'
                display='inline'
                themeVariant={mode === 'dark' ? 'dark' : 'light'}
                accentColor={theme.colors.accent}
                onChange={(_event, next) => {
                  // Draft only — committing here is what made the old picker
                  // appear to revert.
                  if (next) setDraft(next);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 11,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 12.5,
      color: theme.colors.text,
    },
    caret: { fontSize: 10, color: theme.colors.secondary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    rowLabel: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.subtext,
    },
    rowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    rowValue: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 14,
      color: theme.colors.text,
    },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 12,
      paddingTop: 16,
    },
    sheetHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingBottom: 8,
    },
    sheetTitle: {
      fontFamily: theme.font.family.display,
      fontSize: 16,
      color: theme.colors.text,
    },
    cancel: {
      fontFamily: theme.font.family.bodyMedium,
      fontSize: 15,
      color: theme.colors.subtext,
    },
    done: {
      fontFamily: theme.font.family.bodySemibold,
      fontSize: 15,
      color: theme.colors.accent,
    },
  });
