import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" />
        <Text style={styles.name}>John Does</Text>
        <Text style={styles.email}>john.does@example.com</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Upcoming Events</Text>
          <Text variant="bodyMedium" style={styles.eventCount}>3 events this week</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Interests</Text>
          <View style={styles.interestContainer}>
            <Text style={styles.interest}>🎵 Music</Text>
            <Text style={styles.interest}>💻 Technology</Text>
            <Text style={styles.interest}>🎨 Art</Text>
            <Text style={styles.interest}>🏃‍♂️ Sports</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Preferences</Text>
          <Text style={styles.preference}>🌍 Location: New York</Text>
          <Text style={styles.preference}>💰 Max Budget: $100</Text>
          <Text style={styles.preference}>📅 Preferred Days: Weekends</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  eventCount: {
    marginTop: 8,
    color: '#666',
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interest: {
    fontSize: 16,
    marginRight: 16,
    marginTop: 4,
  },
  preference: {
    fontSize: 16,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 24,
  },
}); 