import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/theme';
import { CalendarEvent, calendarService } from '../services/calendarService';

interface CalendarViewProps {
  events: any[];
  onEventPress: (event: any) => void;
  userId: string;
}

export default function CalendarView({ events, onEventPress, userId }: CalendarViewProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    loadCalendarEvents();
  }, [userId]);

  useEffect(() => {
    updateMarkedDates();
  }, [events, calendarEvents, theme]);

  useEffect(() => {
    // Force re-render when theme changes
    updateMarkedDates();
  }, [theme]);

  const loadCalendarEvents = async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);
      
      const events = await calendarService.getCalendarEvents(startDate, endDate, userId);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  };

  const updateMarkedDates = () => {
    const marked: any = {};

    // Mark today's date in blue using customStyles
    const today = new Date().toISOString().split('T')[0];
    marked[today] = {
      customStyles: {
        container: {
          backgroundColor: '#007AFF',
          borderRadius: 16,
        },
        text: {
          color: '#fff',
          fontWeight: 'bold',
        },
      },
      marked: true,
      dotColor: '#007AFF',
    };

    // Only mark events that have been added by the user (with a small green dot)
    events.forEach(event => {
      const dateKey = event.date;
      const isAddedToCalendar = calendarService.isEventAddedToCalendar(event.id);
      if (isAddedToCalendar) {
        if (!marked[dateKey]) {
          marked[dateKey] = {
            marked: true,
            dotColor: '#34C759',
          };
        } else {
          marked[dateKey].marked = true;
          marked[dateKey].dotColor = '#34C759';
        }
      }
    });

    setMarkedDates(marked);
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    
    // Find events for the selected date
    const dayEvents = events.filter(event => event.date === day.dateString);
    const dayCalendarEvents = calendarEvents.filter(event => 
      event.startDate.toISOString().split('T')[0] === day.dateString
    );

    if (dayEvents.length > 0 || dayCalendarEvents.length > 0) {
      showDayEvents(dayEvents, dayCalendarEvents, day.dateString);
    }
  };

  const showDayEvents = (dayEvents: any[], dayCalendarEvents: CalendarEvent[], date: string) => {
    // Helper to normalize time to 12-hour format
    const to12Hour = (dateObj: Date) => {
      return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Only show events that are in the calendar (added by the user)
    const allEvents = dayCalendarEvents.map(event => ({
      title: event.title,
      time: to12Hour(event.startDate),
    }));

    // Remove duplicates (same title and normalized time)
    const uniqueEvents = allEvents.filter((event, idx, arr) =>
      arr.findIndex(e => e.title === event.title && e.time === event.time) === idx
    );

    if (uniqueEvents.length === 0) {
      // Do not show any alert/modal if there are no calendar events for this date
      return;
    }

    let message = `Events on ${date}:\n\n`;
    uniqueEvents.forEach(event => {
      message += `• ${event.title} at ${event.time}\n`;
    });

    let buttons: Array<{ text: string; onPress?: () => void }> = [{ text: 'OK' }];

    // Check if any of the day events are added to calendar
    const addedEvents = dayEvents.filter(event => calendarService.isEventAddedToCalendar(event.id));
    if (addedEvents.length > 0) {
      buttons.push({ 
        text: 'Remove Event', 
        onPress: () => removeEventFromCalendar(addedEvents[0]) 
      });
    } else if (dayEvents.length > 0) {
      buttons.push({ 
        text: 'View Details', 
        onPress: () => onEventPress(dayEvents[0]) 
      });
    }

    Alert.alert('Events', message, buttons);
  };

  const removeEventFromCalendar = async (event: any) => {
    try {
      const success = await calendarService.removeEventFromCalendar(event, userId);
      if (success) {
        Alert.alert('Success', 'Event removed from calendar!');
        // Refresh the calendar view
        loadCalendarEvents();
        updateMarkedDates();
      } else {
        Alert.alert('Error', 'Failed to remove event from calendar');
      }
    } catch (error) {
      console.error('Error removing event from calendar:', error);
      Alert.alert('Error', 'Failed to remove event from calendar');
    }
  };

  const addToCalendar = async (event: any) => {
    try {
      // Check for conflicts and already added events
      const result = await calendarService.addEventToCalendar(event, userId);
      if (result === 'already_added') {
        Alert.alert('Already Added', 'This event is already in your calendar.');
        return;
      }
      if (result === 'conflict') {
        Alert.alert(
          'Scheduling Conflict',
          'This event conflicts with another event in your calendar. Do you want to add it anyway?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Anyway', onPress: async () => {
                // Add anyway, but only if not already present
                const addAnywayResult = await calendarService.addEventToCalendar(event, userId);
                if (addAnywayResult === 'already_added') {
                  Alert.alert('Already Added', 'This event is already in your calendar.');
                } else if (addAnywayResult) {
                  Alert.alert('Success', 'Event added to calendar!');
                  loadCalendarEvents();
                } else {
                  Alert.alert('Error', 'Failed to add event to calendar');
                }
              }
            }
          ]
        );
        return;
      }
      if (result) {
        Alert.alert('Success', 'Event added to calendar!');
        loadCalendarEvents();
      } else {
        Alert.alert('Error', 'Failed to add event to calendar');
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add event to calendar');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Calendar
        key={theme}
        markingType="custom"
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            customStyles: {
              ...(markedDates[selectedDate]?.customStyles || {}),
              container: {
                ...(markedDates[selectedDate]?.customStyles?.container || {}),
                backgroundColor: '#007AFF',
                borderRadius: 16,
              },
              text: {
                ...(markedDates[selectedDate]?.customStyles?.text || {}),
                color: '#fff',
                fontWeight: 'bold',
              },
            },
          }
        }}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.tint,
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: colors.text,
          textDisabledColor: colors.icon,
          dotColor: colors.tint,
          selectedDotColor: '#ffffff',
          arrowColor: colors.tint,
          monthTextColor: colors.text,
          indicatorColor: colors.tint,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
      />
      
      <View style={[styles.legend, { 
        backgroundColor: colors.background,
        borderTopColor: theme === 'dark' ? '#3a3a3c' : '#e5e5ea'
      }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Added to Calendar</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  legend: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
}); 