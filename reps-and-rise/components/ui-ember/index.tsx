/**
 * Shared ember UI primitives.
 *
 * Small, unopinionated pieces that carry the design tokens so screens stop
 * re-declaring the same button/label/field styles.
 */
import { useThemeMode } from '@/theme/ThemeContext';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/* -------------------------------------------------------------- buttons -- */

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** The one ember-filled action on a screen. Never use two on the same view. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useThemeMode();
  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole='button'
      accessibilityState={{ disabled: !!inactive }}
      style={[
        {
          paddingVertical: 17,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: 15,
          backgroundColor: inactive ? theme.colors.iconBackground : theme.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.subtext} />
      ) : (
        <Text
          style={[
            {
              fontFamily: theme.font.family.displayBold,
              fontSize: 16,
              color: inactive ? theme.colors.muted : theme.colors.onAccent,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/** Quiet surface + border button for the secondary path. */
export function SecondaryButton({ label, onPress, disabled, style, textStyle }: ButtonProps) {
  const { theme } = useThemeMode();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole='button'
      style={[
        {
          paddingVertical: 16,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: 15,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontFamily: theme.font.family.display,
            fontSize: 16,
            color: disabled ? theme.colors.muted : theme.colors.text,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Text-only action — the escape hatch, not the pitch. */
export function GhostButton({
  label,
  onPress,
  disabled,
  style,
  textStyle,
  tone = 'amber',
}: ButtonProps & { tone?: 'amber' | 'danger' }) {
  const { theme } = useThemeMode();
  const color = tone === 'danger' ? theme.colors.danger : theme.colors.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole='button'
      style={[{ paddingVertical: 14, alignItems: 'center' }, style]}
    >
      <Text style={[{ fontFamily: theme.font.family.bodyMedium, fontSize: 14, color }, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Outlined destructive action (sign out). */
export function DangerButton({ label, onPress, style }: ButtonProps) {
  const { theme } = useThemeMode();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole='button'
      style={[
        {
          paddingVertical: 15,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: theme.font.family.bodySemibold,
          fontSize: 14.5,
          color: theme.colors.danger,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* --------------------------------------------------------------- labels -- */

/** 10.5px uppercase tracked label that heads every group in the design. */
export function SectionLabel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { theme } = useThemeMode();

  return (
    <Text
      style={[
        {
          fontFamily: theme.font.family.bodySemibold,
          fontSize: 10.5,
          color: theme.colors.subtext,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Screen title in Space Grotesk. */
export function ScreenTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { theme } = useThemeMode();

  return (
    <Text
      style={[
        {
          fontFamily: theme.font.family.display,
          fontSize: 25,
          lineHeight: 28,
          letterSpacing: -0.75,
          color: theme.colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* --------------------------------------------------------------- fields -- */

interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  readOnly?: boolean;
}

/** Labelled text input replacing the gluestack FormControl stacks. */
export function Field({ label, hint, error, readOnly, style, ...inputProps }: FieldProps) {
  const { theme } = useThemeMode();

  return (
    <View style={{ gap: 7 }}>
      <SectionLabel>{label}</SectionLabel>
      <TextInput
        placeholderTextColor={theme.colors.placeholder}
        editable={!readOnly}
        {...inputProps}
        style={[
          {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 14,
            borderRadius: 13,
            backgroundColor: readOnly ? theme.colors.surfaceSunken : theme.colors.card,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            color: readOnly ? theme.colors.subtext : theme.colors.text,
            fontFamily: theme.font.family.body,
            fontSize: 15,
          },
          style,
        ]}
      />
      {!!error && (
        <Text
          style={{
            fontFamily: theme.font.family.bodyMedium,
            fontSize: 12,
            color: theme.colors.danger,
          }}
        >
          {error}
        </Text>
      )}
      {!!hint && !error && (
        <Text
          style={{
            fontFamily: theme.font.family.body,
            fontSize: 11.5,
            color: theme.colors.subtext,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

/** Inline error banner used by the sign-up form. */
export function ErrorBanner({ message }: { message: string }) {
  const { theme } = useThemeMode();

  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.dangerSoft,
        borderWidth: 1,
        borderColor: theme.colors.dangerSoftBorder,
      }}
    >
      <Text
        style={{
          fontFamily: theme.font.family.bodyMedium,
          fontSize: 12.5,
          color: theme.colors.danger,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------------- data --- */

/** Number-forward tile. Numbers are always Space Mono, never ember. */
export function StatTile({
  value,
  label,
  style,
}: {
  value: string | number;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useThemeMode();

  return (
    <View
      style={[
        {
          flex: 1,
          paddingVertical: 14,
          paddingHorizontal: 12,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          gap: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: theme.font.family.monoBold,
          fontSize: 24,
          color: theme.colors.secondary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: theme.font.family.bodyMedium,
          fontSize: 10.5,
          lineHeight: 14,
          color: theme.colors.subtext,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Pill chip — exercise tags, set summaries. */
export function Chip({
  label,
  tone = 'default',
  style,
}: {
  label: string;
  tone?: 'default' | 'amber';
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useThemeMode();

  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.iconBackground,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: theme.font.family.bodySemibold,
          fontSize: 11.5,
          color: tone === 'amber' ? theme.colors.secondary : theme.colors.subtext,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Settings-style row: label, optional value, chevron. */
export function ListRow({
  label,
  value,
  onPress,
  last = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const { theme } = useThemeMode();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole='button'
      style={{
        paddingHorizontal: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.hairline,
      }}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: theme.font.family.bodyMedium,
          fontSize: 14.5,
          color: theme.colors.text,
        }}
      >
        {label}
      </Text>
      {!!value && (
        <Text
          style={{
            fontFamily: theme.font.family.body,
            fontSize: 12,
            color: theme.colors.subtext,
          }}
        >
          {value}
        </Text>
      )}
      <Text
        style={{ fontFamily: theme.font.family.display, fontSize: 14, color: theme.colors.muted }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
}

/** Grouped container for ListRows. */
export function ListGroup({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useThemeMode();

  return (
    <View
      style={[
        {
          borderRadius: 17,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Square back chevron used at the top of pushed screens. */
export function BackButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useThemeMode();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole='button'
      accessibilityLabel='Go back'
      style={[
        {
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: theme.font.family.display,
          fontSize: 18,
          lineHeight: 22,
          color: theme.colors.secondary,
        }}
      >
        ‹
      </Text>
    </TouchableOpacity>
  );
}

export const emberStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
