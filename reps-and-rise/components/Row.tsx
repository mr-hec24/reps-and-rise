import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

interface RowProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function Row({ children, style }: RowProps) {
    return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});