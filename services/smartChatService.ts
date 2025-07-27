interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class SmartChatService {
  private conversationHistory: Message[] = [];

  constructor() {
    this.conversationHistory = [];
  }

  async sendMessage(userMessage: string, events: any[], bookmarkedEvents: any[]): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Generate intelligent response based on user input and events
      const response = this.generateIntelligentResponse(userMessage, events, bookmarkedEvents);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return response;
    } catch (error) {
      console.error('Smart chat error:', error);
      return this.generateFallbackResponse(userMessage, events, bookmarkedEvents);
    }
  }

  private generateIntelligentResponse(userMessage: string, events: any[], bookmarkedEvents: any[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Get event categories for better responses
    const categories = [...new Set(events.map(e => e.category))];
    const techEvents = events.filter(e => e.category === 'Tech');
    const musicEvents = events.filter(e => e.category === 'Music');
    const foodEvents = events.filter(e => e.category === 'Food');
    const artEvents = events.filter(e => e.category === 'Art');
    const outdoorEvents = events.filter(e => e.category === 'Outdoor');

    // Handle saved/bookmarked events
    if (lowerMessage.includes('saved') || lowerMessage.includes('bookmark') || lowerMessage.includes('my events')) {
      if (bookmarkedEvents.length === 0) {
        return "You don't have any saved events yet. Would you like me to recommend some events for you to bookmark?";
      }
      
      const eventList = bookmarkedEvents.map(event => 
        `• **${event.title}** (${event.category})\n  📅 ${event.date} at ${event.time}\n  📍 ${event.location}`
      ).join('\n\n');
      
      return `Here are your ${bookmarkedEvents.length} saved events:\n\n${eventList}\n\nWould you like me to help you plan which one to attend first?`;
    }

    // Handle event recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('find events')) {
      if (lowerMessage.includes('tech') || lowerMessage.includes('technology')) {
        return this.formatEventRecommendations(techEvents, 'Tech');
      } else if (lowerMessage.includes('music')) {
        return this.formatEventRecommendations(musicEvents, 'Music');
      } else if (lowerMessage.includes('food')) {
        return this.formatEventRecommendations(foodEvents, 'Food');
      } else if (lowerMessage.includes('art')) {
        return this.formatEventRecommendations(artEvents, 'Art');
      } else if (lowerMessage.includes('outdoor')) {
        return this.formatEventRecommendations(outdoorEvents, 'Outdoor');
      } else {
        // General recommendations
        const recentEvents = events
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        return this.formatEventRecommendations(recentEvents, 'recent');
      }
    }

    // Handle planning help
    if (lowerMessage.includes('plan') || lowerMessage.includes('help me')) {
      return `I'd be happy to help you plan! Here's what I can do:\n\n` +
        `🎯 **Event Discovery**: I can recommend events by category (${categories.join(', ')})\n` +
        `📅 **Date Planning**: Help you find events on specific dates\n` +
        `📍 **Location-based**: Find events near you\n` +
        `💰 **Budget-friendly**: Filter by free or paid events\n\n` +
        `What type of events interest you most?`;
    }

    // Handle specific category requests
    if (lowerMessage.includes('tech') || lowerMessage.includes('technology')) {
      return this.formatEventRecommendations(techEvents, 'Tech');
    } else if (lowerMessage.includes('music')) {
      return this.formatEventRecommendations(musicEvents, 'Music');
    } else if (lowerMessage.includes('food')) {
      return this.formatEventRecommendations(foodEvents, 'Food');
    } else if (lowerMessage.includes('art')) {
      return this.formatEventRecommendations(artEvents, 'Art');
    } else if (lowerMessage.includes('outdoor')) {
      return this.formatEventRecommendations(outdoorEvents, 'Outdoor');
    }

    // Handle date-specific requests
    if (lowerMessage.includes('today') || lowerMessage.includes('tonight')) {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter(e => e.date === today);
      if (todayEvents.length === 0) {
        return "I don't see any events happening today. Would you like to see events happening this week instead?";
      }
      return this.formatEventRecommendations(todayEvents, 'today');
    }

    if (lowerMessage.includes('weekend') || lowerMessage.includes('this week')) {
      const weekendEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        const dayOfWeek = eventDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Saturday or Sunday
      }).slice(0, 5);
      return this.formatEventRecommendations(weekendEvents, 'this weekend');
    }

    // Handle free/paid events
    if (lowerMessage.includes('free')) {
      const freeEvents = events.filter(e => e.budget === 'Free').slice(0, 5);
      return this.formatEventRecommendations(freeEvents, 'free');
    }

    if (lowerMessage.includes('paid') || lowerMessage.includes('ticket')) {
      const paidEvents = events.filter(e => e.budget === 'Paid').slice(0, 5);
      return this.formatEventRecommendations(paidEvents, 'paid');
    }

    // Default helpful response
    return `I'm your AI planning assistant! I can see ${events.length} events available. Here's what I can help you with:\n\n` +
      `🎯 **Recommendations**: "Recommend tech events" or "Show me music events"\n` +
      `📅 **Date Planning**: "What's happening this weekend?" or "Events today"\n` +
      `💰 **Budget**: "Show me free events" or "Paid events"\n` +
      `📚 **Saved Events**: "Show my saved events"\n` +
      `❓ **General Help**: "Help me plan" or "What can you do?"\n\n` +
      `What would you like to know about?`;
  }

  private formatEventRecommendations(events: any[], category: string): string {
    if (events.length === 0) {
      return `I don't see any ${category.toLowerCase()} events available right now. Would you like me to show you other types of events?`;
    }

    const eventList = events.map(event => 
      `• **${event.title}**\n  📅 ${event.date} at ${event.time}\n  📍 ${event.location}\n  💰 ${event.budget}`
    ).join('\n\n');

    return `Here are some great ${category.toLowerCase()} events:\n\n${eventList}\n\nWould you like more details about any of these events?`;
  }

  private generateFallbackResponse(userMessage: string, events: any[], bookmarkedEvents: any[]): string {
    return `I'm here to help you discover and plan events! I can see ${events.length} events available. You can ask me to recommend events, help you plan, or show your saved events. What would you like to do?`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const smartChatService = new SmartChatService(); 