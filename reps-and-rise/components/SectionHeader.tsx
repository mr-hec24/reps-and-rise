import { Text, StyleSheet } from 'react-native';
import { useThemeMode } from '@/theme/ThemeContext';

export function SectionHeader({ title, style }: { title: string; style?: object }) {
  const { theme } = useThemeMode();
  const dynamicStyles = styles(theme);

  return <Text style={[dynamicStyles.title, style]}>{title}</Text>;
}

const styles = (theme: any) =>
  StyleSheet.create({
    title: {
      fontFamily: theme.font.family.display,
      fontSize: 25,
      lineHeight: 28,
      letterSpacing: -0.75,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
    },
  });
