import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export function Row({ children, style }) {
    return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});