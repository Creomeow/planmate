import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  description?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  calendarId?: string;
}

export interface EventConflict {
  eventId: string;
  conflictingEventId: string;
  conflictType: 'overlap' | 'adjacent';
  severity: 'warning' | 'error';
}

class CalendarService {
  private appEvents: Map<string, CalendarEvent> = new Map();
  private addedEventIds: Set<string> = new Set();
  private eventIdMapping: Map<string, string> = new Map(); // Maps original event ID to calendar event ID
  private currentUserId: string | null = null;

  async initialize(userId: string) {
    this.currentUserId = userId;
    this.appEvents.clear();
    this.addedEventIds.clear();
    this.eventIdMapping.clear();
    console.log('[CalendarService] Initializing for userId:', userId);
    try {
      await this.loadAppEvents(userId);
      await this.loadAddedEventIds(userId);
      await this.loadEventIdMapping(userId);
      console.log('[CalendarService] In-memory appEvents after load:', Array.from(this.appEvents.values()));
      console.log('[CalendarService] In-memory addedEventIds after load:', Array.from(this.addedEventIds));
      console.log('[CalendarService] In-memory eventIdMapping after load:', Array.from(this.eventIdMapping.entries()));
      return true;
    } catch (error) {
      console.error('Calendar initialization error:', error);
      return false;
    }
  }

  private getKey(base: string, userId: string) {
    const key = `${base}_${userId}`;
    console.log(`[CalendarService] Using key: ${key}`);
    return key;
  }

  private async loadAppEvents(userId: string) {
    try {
      const key = this.getKey('appCalendarEvents', userId);
      const storedEvents = await AsyncStorage.getItem(key);
      console.log(`[CalendarService] Loaded app events for key: ${key}`, storedEvents);
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        this.appEvents.clear();
        events.forEach((event: any) => {
          this.appEvents.set(event.id, {
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          });
        });
      }
    } catch (error) {
      console.error('Error loading app events:', error);
    }
  }

  private async loadAddedEventIds(userId: string) {
    try {
      const key = this.getKey('addedEventIds', userId);
      const storedIds = await AsyncStorage.getItem(key);
      console.log(`[CalendarService] Loaded added event IDs for key: ${key}`, storedIds);
      if (storedIds) {
        this.addedEventIds = new Set(JSON.parse(storedIds));
      }
    } catch (error) {
      console.error('Error loading added event IDs:', error);
    }
  }

  private async loadEventIdMapping(userId: string) {
    try {
      const key = this.getKey('eventIdMapping', userId);
      const storedMapping = await AsyncStorage.getItem(key);
      console.log(`[CalendarService] Loaded event ID mapping for key: ${key}`, storedMapping);
      if (storedMapping) {
        this.eventIdMapping = new Map(JSON.parse(storedMapping));
      }
    } catch (error) {
      console.error('Error loading event ID mapping:', error);
    }
  }

  private async saveAppEvents(userId: string) {
    try {
      const key = this.getKey('appCalendarEvents', userId);
      const events = Array.from(this.appEvents.values());
      await AsyncStorage.setItem(key, JSON.stringify(events));
      console.log(`[CalendarService] Saved app events for key: ${key}`, events);
    } catch (error) {
      console.error('Error saving app events:', error);
    }
  }

  private async saveAddedEventIds(userId: string) {
    try {
      const key = this.getKey('addedEventIds', userId);
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(this.addedEventIds)));
      console.log(`[CalendarService] Saved added event IDs for key: ${key}`, Array.from(this.addedEventIds));
    } catch (error) {
      console.error('Error saving added event IDs:', error);
    }
  }

  private async saveEventIdMapping(userId: string) {
    try {
      const key = this.getKey('eventIdMapping', userId);
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(this.eventIdMapping.entries())));
      console.log(`[CalendarService] Saved event ID mapping for key: ${key}`, Array.from(this.eventIdMapping.entries()));
    } catch (error) {
      console.error('Error saving event ID mapping:', error);
    }
  }

  async addEventToCalendar(event: any, userId: string): Promise<string | null | 'already_added' | 'conflict'> {
    try {
      // Check if event is already added to calendar (by ID)
      if (this.addedEventIds.has(event.id)) {
        return 'already_added';
      }

      // Check for scheduling conflict (same date and time, different event)
      let hasConflict = false;
      this.appEvents.forEach((appEvent) => {
        const eventDateStr = appEvent.startDate.toISOString().split('T')[0];
        const eventTimeStr = appEvent.startDate.toTimeString().slice(0,5);
        if (eventDateStr === event.date && eventTimeStr === event.time && appEvent.title !== event.title) {
          hasConflict = true;
        }
      });

      // Parse event date and time
      const eventDate = new Date(event.date);
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2);
      const calendarEventId = `app_${Date.now()}`;
      const calendarEvent: CalendarEvent = {
        id: calendarEventId,
        title: event.title,
        startDate: eventDate,
        endDate: endDate,
        location: event.location,
        description: event.description,
        isRecurring: false,
        calendarId: 'app',
      };
      this.appEvents.set(calendarEventId, calendarEvent);
      this.addedEventIds.add(event.id);
      this.eventIdMapping.set(event.id, calendarEventId);
      await this.saveAppEvents(userId);
      await this.saveAddedEventIds(userId);
      await this.saveEventIdMapping(userId);
      console.log('[CalendarService] Event added and saved:', calendarEvent, 'for userId:', userId);
      if (hasConflict) {
        return 'conflict';
      }
      return calendarEventId;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      return null;
    }
  }

  async removeEventFromCalendar(event: any, userId: string): Promise<boolean> {
    try {
      // Remove all events for the given date
      const toRemove: string[] = [];
      const toRemoveOriginalIds: string[] = [];
      this.appEvents.forEach((calEvent, calEventId) => {
        const eventDateStr = calEvent.startDate.toISOString().split('T')[0];
        if (eventDateStr === event.date) {
          toRemove.push(calEventId);
        }
      });
      this.eventIdMapping.forEach((calEventId, originalEventId) => {
        const calEvent = this.appEvents.get(calEventId);
        if (calEvent) {
          const eventDateStr = calEvent.startDate.toISOString().split('T')[0];
          if (eventDateStr === event.date) {
            toRemoveOriginalIds.push(originalEventId);
          }
        }
      });
      let success = false;
      toRemove.forEach(calEventId => {
        if (this.appEvents.delete(calEventId)) {
          success = true;
        }
      });
      toRemoveOriginalIds.forEach(originalEventId => {
        this.addedEventIds.delete(originalEventId);
        this.eventIdMapping.delete(originalEventId);
      });
      if (success) {
        await this.saveAppEvents(userId);
        await this.saveAddedEventIds(userId);
        await this.saveEventIdMapping(userId);
      }
      return success;
    } catch (error) {
      console.error('Error removing event from calendar:', error);
      return false;
    }
  }

  async checkForConflicts(event: any, userId: string): Promise<EventConflict[]> {
    try {
      const eventDate = new Date(event.date);
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2);
      const conflicts: EventConflict[] = [];
      this.appEvents.forEach((appEvent, appEventId) => {
        if (appEvent.title === event.title && appEvent.startDate.toISOString().split('T')[0] === event.date) {
          return;
        }
        if (eventDate < appEvent.endDate && endDate > appEvent.startDate) {
          conflicts.push({
            eventId: event.id,
            conflictingEventId: appEventId,
            conflictType: 'overlap',
            severity: 'error',
          });
        }
      });
      return conflicts;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return [];
    }
  }

  async getCalendarEvents(startDate: Date, endDate: Date, userId: string): Promise<CalendarEvent[]> {
    try {
      const events: CalendarEvent[] = [];
      this.appEvents.forEach((event) => {
        if (event.startDate >= startDate && event.startDate <= endDate) {
          events.push(event);
        }
      });
      return events;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      return [];
    }
  }

  isEventAddedToCalendar(eventId: string): boolean {
    return this.addedEventIds.has(eventId);
  }
}

export const calendarService = new CalendarService(); 