import { View, StyleSheet } from 'react-native';
import { useThemeMode } from '@/theme/ThemeContext';

export function Card({children, style}) {
    const { theme } = useThemeMode();
    const styles = getStyles(theme);

    return <View style={[styles.card, style]}>{children}</View>;
}

const getStyles = (theme: any) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
    },
});