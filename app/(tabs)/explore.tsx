import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Card, Chip, Text, useTheme } from 'react-native-paper';

// Sample data for Milestone 1
const SAMPLE_EVENTS = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    date: '2024-04-15',
    time: '09:00 AM',
    location: 'Convention Center',
    price: 'Free',
    category: 'Technology',
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    date: '2024-04-20',
    time: '04:00 PM',
    location: 'Central Park',
    price: '$50',
    category: 'Music',
  },
  {
    id: '3',
    title: 'Food & Wine Tasting',
    date: '2024-04-22',
    time: '06:00 PM',
    location: 'Downtown Restaurant',
    price: '$75',
    category: 'Food',
  },
];

const CATEGORIES = ['All', 'Technology', 'Music', 'Food', 'Sports', 'Art'];

export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const theme = useTheme();

  const filteredEvents = SAMPLE_EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderEventCard = ({ item }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleLarge">{item.title}</Text>
        <View style={styles.eventDetails}>
          <Text variant="bodyMedium">📅 {item.date}</Text>
          <Text variant="bodyMedium">⏰ {item.time}</Text>
          <Text variant="bodyMedium">📍 {item.location}</Text>
          <Text variant="bodyMedium">💰 {item.price}</Text>
        </View>
        <Chip style={styles.categoryChip}>{item.category}</Chip>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search events..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Chip
            selected={selectedCategory === item}
            onPress={() => setSelectedCategory(item)}
            style={styles.filterChip}
            selectedColor={theme.colors.primary}
          >
            {item}
          </Chip>
        )}
        style={styles.categoryList}
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.eventsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  categoryList: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  eventsList: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  eventDetails: {
    marginTop: 8,
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
}); 