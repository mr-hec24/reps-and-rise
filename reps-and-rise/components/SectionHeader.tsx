import { Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export function SectionHeader({ title }) {
    return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
    title: {
        fontSize: theme.font.title,
        fontWeight: 600,
        marginBottom: theme.spacing.sm
    },
});