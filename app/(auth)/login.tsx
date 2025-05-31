import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Test accounts
const TEST_ACCOUNTS = [
  { email: 'user1@test.com', password: 'password123', name: 'John Doe' },
  { email: 'user2@test.com', password: 'password456', name: 'Jane Smith' }
];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Find matching test account
      const user = TEST_ACCOUNTS.find(
        account => account.email === email && account.password === password
      );

      if (user) {
        // Store user data
        await AsyncStorage.setItem('userToken', 'dummy-auth-token');
        await AsyncStorage.setItem('userData', JSON.stringify({
          name: user.name,
          email: user.email,
        }));
        router.replace('/(tabs)');
      } else {
        setError('Incorrect email or password');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>PlanMate</Text>
        <Text style={styles.subtitle}>Your Event Planning Assistant</Text>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          error={!!error}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          error={!!error}
        />
        
        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
        >
          Login
        </Button>
        
        <Button
          mode="text"
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkButton}
        >
          Don't have an account? Register
        </Button>

        <View style={styles.testAccountsContainer}>
          <Text style={styles.testAccountsTitle}>Test Accounts:</Text>
          <Text style={styles.testAccount}>1. Email: user1@test.com / Password: password123</Text>
          <Text style={styles.testAccount}>2. Email: user2@test.com / Password: password456</Text>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6200ee',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 8,
  },
  testAccountsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  testAccountsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  testAccount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
}); 