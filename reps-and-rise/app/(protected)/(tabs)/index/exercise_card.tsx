import { StyleSheet, Text, View } from 'react-native';

export default function ExerciseCard() {
    return (
        <View style={styles.container}>
            <Text>Exercise Card Modal</Text>
            <Text>I need to come up with some sort of UI for this part of the project.</Text>
        </View>
    );
}   

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
        margin: 30
    },
});