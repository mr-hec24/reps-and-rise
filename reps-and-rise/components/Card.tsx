import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export function Card({children, style}) {
    return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md
    }
});