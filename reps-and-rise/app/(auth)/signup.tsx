import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthForm from '../../components/auth/AuthForm';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>
      <Text style={styles.subheader}>Join the community</Text>
      <AuthForm />
       <Link href="/(auth)/login" style={styles.link}>
         Already have an account? Sign In
       </Link>
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
    },
    link: {
      textAlign: 'center',
      marginTop: 16,
      color: 'blue',
    }
});
