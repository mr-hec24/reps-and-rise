import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeMode } from '@/theme/ThemeContext';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function Card({children, style}: CardProps) {
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