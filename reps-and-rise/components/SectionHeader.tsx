import { Text, StyleSheet } from 'react-native';
import { useThemeMode } from '@/theme/ThemeContext';

export function SectionHeader({ title, style }: { title: string; style?: object }) {
    const { theme } = useThemeMode();
    const dynamicStyles = styles(theme);

    return <Text style={[dynamicStyles.title, style]}>{title}</Text>;
}

const styles = (theme: any) => StyleSheet.create({
    title: {
        fontSize: theme.font.title,
        fontWeight: '600',
        marginBottom: theme.spacing.sm,
        color: theme.colors.text,
    },
});