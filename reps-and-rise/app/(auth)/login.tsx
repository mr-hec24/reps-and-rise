import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthForm from '../../components/auth/AuthForm';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Rise and Grind</Text>
      <Text style={styles.subheader}>Sign in to continue</Text>
      <AuthForm />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subheader: {
        fontSize: 16,
        textAlign: 'center',
        color: 'gray',
        marginBottom: 24,
    }
});
