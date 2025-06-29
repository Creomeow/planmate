import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/theme';

interface RecurringEventModalProps {
  visible: boolean;
  onClose: () => void;
  event: any;
  onSuccess: () => void;
  addEventToCalendar: (event: any) => Promise<boolean>;
}

type RecurrenceType = 'none' | 'weekly' | 'monthly';
type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export default function RecurringEventModal({ 
  visible, 
  onClose, 
  event, 
  onSuccess, 
  addEventToCalendar 
}: RecurringEventModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>('');

  const weekDays: { key: WeekDay; label: string; short: string }[] = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const toggleDay = (day: WeekDay) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const createRecurringEvent = async () => {
    if (recurrenceType === 'none') {
      // Add single event
      const success = await addEventToCalendar(event);
      if (success) {
        Alert.alert('Success', 'Event added to calendar!');
        onSuccess();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to add event to calendar');
      }
      return;
    }

    if (recurrenceType === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day of the week');
      return;
    }

    if (recurrenceType === 'monthly' && (monthlyDay < 1 || monthlyDay > 31)) {
      Alert.alert('Error', 'Please select a valid day of the month (1-31)');
      return;
    }

    try {
      // For recurring events, we'll create multiple events
      const startDate = new Date(event.date);
      const [hours, minutes] = event.time.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);

      let eventsCreated = 0;
      const maxEvents = 52; // Limit to prevent too many events

      if (recurrenceType === 'weekly') {
        // Create weekly recurring events
        for (let i = 0; i < maxEvents; i++) {
          const eventDate = new Date(startDate);
          eventDate.setDate(eventDate.getDate() + (i * 7));
          
          const dayOfWeek = eventDate.getDay();
          const dayName = weekDays[dayOfWeek === 0 ? 6 : dayOfWeek - 1].key;
          
          if (selectedDays.includes(dayName)) {
            const recurringEvent = {
              ...event,
              date: eventDate.toISOString().split('T')[0],
              title: `${event.title} (Recurring)`,
            };
            
            const success = await addEventToCalendar(recurringEvent);
            if (success) eventsCreated++;
          }
        }
      } else if (recurrenceType === 'monthly') {
        // Create monthly recurring events
        for (let i = 0; i < 12; i++) {
          const eventDate = new Date(startDate);
          eventDate.setMonth(eventDate.getMonth() + i);
          eventDate.setDate(monthlyDay);
          
          const recurringEvent = {
            ...event,
            date: eventDate.toISOString().split('T')[0],
            title: `${event.title} (Monthly)`,
          };
          
          const success = await addEventToCalendar(recurringEvent);
          if (success) eventsCreated++;
        }
      }

      Alert.alert('Success', `${eventsCreated} recurring events added to calendar!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating recurring events:', error);
      Alert.alert('Error', 'Failed to create recurring events');
    }
  };

  const resetForm = () => {
    setRecurrenceType('none');
    setSelectedDays([]);
    setMonthlyDay(1);
    setEndDate('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Add to Calendar</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
            <Text style={[styles.eventDetails, { color: colors.icon }]}>
              {event.date} at {event.time}
            </Text>
            <Text style={[styles.eventDetails, { color: colors.icon }]}>
              {event.location}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recurrence</Text>
            
            <View style={styles.recurrenceOptions}>
              <TouchableOpacity
                style={[
                  styles.option,
                  recurrenceType === 'none' && styles.optionActive
                ]}
                onPress={() => setRecurrenceType('none')}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={recurrenceType === 'none' ? 'white' : colors.icon} 
                />
                <Text style={[
                  styles.optionText,
                  { color: recurrenceType === 'none' ? 'white' : colors.text }
                ]}>
                  Single Event
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  recurrenceType === 'weekly' && styles.optionActive
                ]}
                onPress={() => setRecurrenceType('weekly')}
              >
                <Ionicons 
                  name="repeat" 
                  size={20} 
                  color={recurrenceType === 'weekly' ? 'white' : colors.icon} 
                />
                <Text style={[
                  styles.optionText,
                  { color: recurrenceType === 'weekly' ? 'white' : colors.text }
                ]}>
                  Weekly
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  recurrenceType === 'monthly' && styles.optionActive
                ]}
                onPress={() => setRecurrenceType('monthly')}
              >
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={recurrenceType === 'monthly' ? 'white' : colors.icon} 
                />
                <Text style={[
                  styles.optionText,
                  { color: recurrenceType === 'monthly' ? 'white' : colors.text }
                ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {recurrenceType === 'weekly' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Days of the Week</Text>
              <View style={styles.daysContainer}>
                {weekDays.map(({ key, short }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(key) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleDay(key)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      { color: selectedDays.includes(key) ? 'white' : colors.text }
                    ]}>
                      {short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {recurrenceType === 'monthly' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Day of the Month</Text>
              <View style={styles.monthlyContainer}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.monthlyDayButton,
                      monthlyDay === day && styles.monthlyDayButtonActive
                    ]}
                    onPress={() => setMonthlyDay(day)}
                  >
                    <Text style={[
                      styles.monthlyDayButtonText,
                      { color: monthlyDay === day ? 'white' : colors.text }
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              resetForm();
              onClose();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={createRecurringEvent}
          >
            <Text style={styles.addButtonText}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  eventInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  optionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  monthlyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthlyDayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthlyDayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  monthlyDayButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
}); 