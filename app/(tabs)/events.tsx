import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AIChatModal from '../../components/AIChatModal';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/auth';
import { useTheme } from '../../context/theme';
import { authService } from '../../services/authService';
import { fetchEventbriteEvents } from '../../services/eventsService';

const { width } = Dimensions.get('window');

type ViewMode = 'list' | 'map';

export default function EventsScreen() {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();
  
  console.log('Events screen - User:', user);
  console.log('Events screen - User ID:', user?.id);
  console.log('Events screen - Is loading:', isLoading);
  
  const colors = Colors[theme];
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    budget: '',
    startDate: '',
    endDate: '',
  });
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetchEvents();
    // Clear any old global bookmarks data to ensure clean user-specific bookmarks
    clearOldGlobalBookmarks();
  }, []);

  useEffect(() => {
    if (user?.id && events.length > 0) {
      console.log('Events: Loading bookmarks for user:', user.id);
      loadBookmarkedEvents();
    } else if (user?.id) {
      console.log('Events: User logged in but events not loaded yet:', user.id);
    } else {
      console.log('Events: No user or user has no ID');
    }
  }, [user, events]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedFilters]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const fetched = await fetchEventbriteEvents();
      setEvents(fetched);
      setFilteredEvents(fetched);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadBookmarkedEvents = async () => {
    if (!user?.id || events.length === 0) {
      return;
    }
    
    try {
      // Load user-specific bookmarks from auth service
      const savedEventIds = await authService.getBookmarkedEvents(user.id);
      console.log('Loaded bookmarked event IDs:', savedEventIds);
      const savedEvents = events.filter(event => savedEventIds.includes(event.id));
      console.log('Filtered bookmarked events:', savedEvents.length);
      setBookmarkedEvents(savedEvents);
    } catch (error) {
      console.error('Error loading bookmarked events:', error);
      // If auth service fails, just set empty array instead of falling back to global storage
      setBookmarkedEvents([]);
    }
  };

  const toggleBookmark = async (event: any) => {
    console.log('Bookmark attempt - User:', user);
    console.log('Bookmark attempt - User ID:', user?.id);
    console.log('Bookmark attempt - Is loading:', isLoading);
    console.log('Bookmark attempt - Event:', event.title, 'ID:', event.id);
    console.log('Current bookmarked events count:', bookmarkedEvents.length);
    
    if (isLoading) {
      console.log('Auth is loading, skipping bookmark');
      return;
    }
    
    if (!user) {
      console.log('No user, showing login alert');
      Alert.alert('Error', 'Please login to bookmark events');
      return;
    }
    
    if (!user.id) {
      console.log('User has no ID, showing invalid session alert');
      Alert.alert('Error', 'User session is invalid. Please login again.');
      return;
    }
    
    console.log('Bookmarking event:', event.title);
    
    try {
      const isCurrentlyBookmarked = bookmarkedEvents.some(e => e.id === event.id);
      console.log('Is currently bookmarked:', isCurrentlyBookmarked);
      
      const newBookmarked = isCurrentlyBookmarked
        ? bookmarkedEvents.filter(e => e.id !== event.id)
        : [...bookmarkedEvents, event];
      
      console.log('New bookmarked events count:', newBookmarked.length);
      setBookmarkedEvents(newBookmarked);
      
      // Save to user-specific auth service only
      const eventIds = newBookmarked.map(e => e.id);
      console.log('Saving event IDs to auth service:', eventIds);
      const success = await authService.updateBookmarkedEvents(user.id, eventIds);
      console.log('Auth service update success:', success);
      
      console.log('Bookmark saved successfully');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to save bookmark. Please try again.');
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedFilters.category) {
      filtered = filtered.filter(event => event.category === selectedFilters.category);
    }

    // Budget filter
    if (selectedFilters.budget) {
      filtered = filtered.filter(event => event.budget === selectedFilters.budget);
    }

    // Date filter
    if (selectedFilters.startDate && selectedFilters.endDate) {
      filtered = filtered.filter(event =>
        event.date >= selectedFilters.startDate && event.date <= selectedFilters.endDate
      );
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setSelectedFilters({ category: '', budget: '', startDate: '', endDate: '' });
    setSearchQuery('');
  };

  const clearOldGlobalBookmarks = async () => {
    try {
      // Remove old global bookmarks storage to prevent conflicts
      await AsyncStorage.removeItem('bookmarkedEvents');
    } catch (error) {
      console.log('No old global bookmarks to clear');
    }
  };

  const renderEventCard = ({ item }: { item: any }) => {
    const isBookmarked = bookmarkedEvents.some(e => e.id === item.id);
    
    return (
      <View style={[styles.card, { 
        backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white',
        borderLeftColor: item.color, 
        borderLeftWidth: 4 
      }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardImage}>
            <Image
              source={{ uri: item.image }}
              style={styles.imagePlaceholder}
              onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
              onLoad={() => console.log('Image loaded successfully for:', item.title)}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardLocation, { color: colors.icon }]}>
              <Ionicons name="location" size={14} color={colors.icon} />
              {' '}{item.location}
            </Text>
            <Text style={[styles.cardDate, { color: colors.icon }]}>
              <Ionicons name="calendar" size={14} color={colors.icon} />
              {' '}{item.date} at {item.time}
            </Text>
            <View style={styles.cardTags}>
              <View style={[styles.tag, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.tagText, { color: item.color }]}>{item.category}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.tagText, { color: item.color }]}>{item.budget}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => toggleBookmark(item)}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isBookmarked ? '#007AFF' : colors.icon}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.cardDescription, { color: colors.icon }]}>{item.description}</Text>
      </View>
    );
  };

  const renderEventList = ({ item }: { item: any }) => {
    const isBookmarked = bookmarkedEvents.some(e => e.id === item.id);
    
    return (
      <View style={[styles.listItem, { 
        backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white',
        borderLeftColor: item.color, 
        borderLeftWidth: 4 
      }]}>
        <View style={styles.listImage}>
          <Image
            source={{ uri: item.image }}
            style={styles.listImagePlaceholder}
            onError={(error) => console.log('List image loading error:', error.nativeEvent.error)}
            onLoad={() => console.log('List image loaded successfully for:', item.title)}
          />
        </View>
        <View style={styles.listContent}>
          <Text style={[styles.listTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.listLocation, { color: colors.icon }]}>
            <Ionicons name="location" size={14} color={colors.icon} />
            {' '}{item.location}
          </Text>
          <Text style={[styles.listDate, { color: colors.icon }]}>
            <Ionicons name="calendar" size={14} color={colors.icon} />
            {' '}{item.date} at {item.time}
          </Text>
          <View style={styles.listTags}>
            <View style={[styles.tag, { backgroundColor: item.color + '20' }]}>
              <Text style={[styles.tagText, { color: item.color }]}>{item.category}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: item.color + '20' }]}>
              <Text style={[styles.tagText, { color: item.color }]}>{item.budget}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.listBookmarkButton}
          onPress={() => toggleBookmark(item)}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? '#007AFF' : colors.icon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMapView = () => {
    // Get unique categories and their colors
    const uniqueCategories = Array.from(new Set(filteredEvents.map(event => event.category)));
    const categoryColors = uniqueCategories.map(category => {
      const event = filteredEvents.find(e => e.category === category);
      return { category, color: event?.color || '#007AFF' };
    });

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 1.3521, // Singapore coordinates
            longitude: 103.8198,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {filteredEvents.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              title={event.title}
              description={`${event.date} • ${event.location}`}
            >
              <View style={[styles.customMarker, { backgroundColor: event.color }]}>
                <Ionicons name="location" size={16} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>
        
        {/* Color Legend */}
        {categoryColors.length > 0 && (
          <View style={[styles.mapLegend, { backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white' }]}>
            <Text style={[styles.legendTitle, { color: colors.text }]}>Event Categories</Text>
            {categoryColors.map(({ category, color }) => (
              <View key={category} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: color }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>{category}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.icon} />
      <Text style={[styles.emptyTitle, { color: colors.icon }]}>No events found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white', borderBottomColor: theme === 'dark' ? '#48484a' : '#f0f0f0' }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color={colors.tint} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#2c2c2e' : 'white' }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme === 'dark' ? '#3a3a3c' : '#f8f9fa',
            color: colors.text,
            borderColor: theme === 'dark' ? '#48484a' : 'transparent'
          }]}
          placeholder="Search events..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* View Toggle */}
      <View style={[styles.viewToggle, { backgroundColor: theme === 'dark' ? '#3a3a3c' : 'white' }]}>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons 
            name="list-outline" 
            size={20} 
            color={viewMode === 'list' ? 'white' : colors.icon} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'map' && styles.viewButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons 
            name="map-outline" 
            size={20} 
            color={viewMode === 'map' ? 'white' : colors.icon} 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loadingEvents ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.icon }]}>Loading events...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        renderEmptyState()
      ) : viewMode === 'list' ? (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderMapView()
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#007AFF' }]}
        onPress={() => setShowAIChat(true)}
      >
        <Ionicons name="sparkles" size={24} color="white" />
      </TouchableOpacity>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.chipContainer}>
                {['Technology', 'Music', 'Food', 'Art', 'Outdoor'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.chip,
                      selectedFilters.category === category && styles.chipActive
                    ]}
                    onPress={() => setSelectedFilters(prev => ({
                      ...prev,
                      category: prev.category === category ? '' : category
                    }))}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedFilters.category === category && styles.chipTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Budget</Text>
              <View style={styles.chipContainer}>
                {['Low', 'Medium', 'High'].map((budget) => (
                  <TouchableOpacity
                    key={budget}
                    style={[
                      styles.chip,
                      selectedFilters.budget === budget && styles.chipActive
                    ]}
                    onPress={() => setSelectedFilters(prev => ({
                      ...prev,
                      budget: prev.budget === budget ? '' : budget
                    }))}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedFilters.budget === budget && styles.chipTextActive
                    ]}>
                      {budget}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Start Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={selectedFilters.startDate}
                    onChangeText={(text) => setSelectedFilters(prev => ({
                      ...prev,
                      startDate: text
                    }))}
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>End Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={selectedFilters.endDate}
                    onChangeText={(text) => setSelectedFilters(prev => ({
                      ...prev,
                      endDate: text
                    }))}
                  />
                </View>
              </View>
              <Text style={styles.dateHelpText}>
                Enter dates in YYYY-MM-DD format (e.g., 2024-07-15)
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Chat Modal */}
      <AIChatModal
        visible={showAIChat}
        onClose={() => setShowAIChat(false)}
        events={events}
        bookmarkedEvents={bookmarkedEvents}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#007AFF',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardImage: {
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookmarkButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  listItem: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listImage: {
    marginRight: 12,
  },
  listImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  listDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  listTags: {
    flexDirection: 'row',
    gap: 8,
  },
  listBookmarkButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  dateHelpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  filterButton: {
    padding: 8,
  },
}); 