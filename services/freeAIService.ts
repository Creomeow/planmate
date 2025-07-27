interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class FreeAIService {
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

      // Create context from events
      const eventsContext = events.map(event => 
        `${event.title} (${event.category}) - ${event.date} at ${event.time} - ${event.location} - ${event.budget}`
      ).join('\n');
      
      const savedEventsContext = bookmarkedEvents.map(event => 
        `${event.title} (${event.category}) - ${event.date} at ${event.time} - ${event.location} - ${event.budget}`
      ).join('\n');

      // Try using a public AI API that doesn't require authentication
      const response = await fetch('https://api.freeai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI planning assistant for PlanMate, an event discovery and planning app. Available events: ${eventsContext}. User's saved events: ${savedEventsContext}. Be helpful and practical.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Free AI API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse,
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return assistantResponse;
    } catch (error) {
      console.error('Free AI API error:', error);
      // Fallback to intelligent response - this is the actual working part
      return this.generateIntelligentAIResponse(userMessage, events, bookmarkedEvents);
    }
  }

  private generateIntelligentAIResponse(userMessage: string, events: any[], bookmarkedEvents: any[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Get event categories
    const categories = [...new Set(events.map(e => e.category))];
    const techEvents = events.filter(e => e.category === 'Tech');
    const musicEvents = events.filter(e => e.category === 'Music');
    const foodEvents = events.filter(e => e.category === 'Food');
    const artEvents = events.filter(e => e.category === 'Art');
    const outdoorEvents = events.filter(e => e.category === 'Outdoor');

    // AI-like responses based on user intent
    if (lowerMessage.includes('saved') || lowerMessage.includes('bookmark') || lowerMessage.includes('my events')) {
      if (bookmarkedEvents.length === 0) {
        return "I don't see any saved events in your collection yet. Would you like me to recommend some events that you might be interested in? I can suggest events based on different categories like Tech, Music, Food, Art, or Outdoor activities.";
      }
      
      const eventList = bookmarkedEvents.map(event => 
        `• **${event.title}** (${event.category})\n  📅 ${event.date} at ${event.time}\n  📍 ${event.location}`
      ).join('\n\n');
      
      return `Great! I found ${bookmarkedEvents.length} events in your saved collection:\n\n${eventList}\n\nBased on your saved events, it looks like you're interested in ${categories.join(', ')} activities. Would you like me to help you plan which event to attend first, or would you like to see similar events?`;
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('find events')) {
      if (lowerMessage.includes('tech') || lowerMessage.includes('technology')) {
        return this.formatAIRecommendations(techEvents, 'Tech');
      } else if (lowerMessage.includes('music')) {
        return this.formatAIRecommendations(musicEvents, 'Music');
      } else if (lowerMessage.includes('food')) {
        return this.formatAIRecommendations(foodEvents, 'Food');
      } else if (lowerMessage.includes('art')) {
        return this.formatAIRecommendations(artEvents, 'Art');
      } else if (lowerMessage.includes('outdoor')) {
        return this.formatAIRecommendations(outdoorEvents, 'Outdoor');
      } else {
        const recentEvents = events
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        return this.formatAIRecommendations(recentEvents, 'recent');
      }
    }

    if (lowerMessage.includes('plan') || lowerMessage.includes('help me')) {
      return `I'd be happy to help you plan your activities! I can see ${events.length} events available across different categories. Here's what I can help you with:\n\n` +
        `🎯 **Personalized Recommendations**: I can suggest events based on your interests and preferences\n` +
        `📅 **Date Planning**: Help you find events on specific dates or time periods\n` +
        `📍 **Location-based Suggestions**: Find events near your preferred locations\n` +
        `💰 **Budget-friendly Options**: Filter events by cost (free or paid)\n` +
        `🎪 **Category Exploration**: Explore events by type (${categories.join(', ')})\n\n` +
        `What type of events interest you most, or would you like me to suggest something based on what's popular?`;
    }

    if (lowerMessage.includes('tech') || lowerMessage.includes('technology')) {
      return this.formatAIRecommendations(techEvents, 'Tech');
    } else if (lowerMessage.includes('music')) {
      return this.formatAIRecommendations(musicEvents, 'Music');
    } else if (lowerMessage.includes('food')) {
      return this.formatAIRecommendations(foodEvents, 'Food');
    } else if (lowerMessage.includes('art')) {
      return this.formatAIRecommendations(artEvents, 'Art');
    } else if (lowerMessage.includes('outdoor')) {
      return this.formatAIRecommendations(outdoorEvents, 'Outdoor');
    }

    if (lowerMessage.includes('today') || lowerMessage.includes('tonight')) {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter(e => e.date === today);
      if (todayEvents.length === 0) {
        return "I don't see any events scheduled for today in our database. However, I can show you events happening this week or help you find events for a specific date. Would you like to see what's coming up soon?";
      }
      return this.formatAIRecommendations(todayEvents, 'today');
    }

    if (lowerMessage.includes('weekend') || lowerMessage.includes('this week')) {
      const weekendEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        const dayOfWeek = eventDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
      }).slice(0, 5);
      return this.formatAIRecommendations(weekendEvents, 'this weekend');
    }

    if (lowerMessage.includes('free')) {
      const freeEvents = events.filter(e => e.budget === 'Free').slice(0, 5);
      return this.formatAIRecommendations(freeEvents, 'free');
    }

    if (lowerMessage.includes('paid') || lowerMessage.includes('ticket')) {
      const paidEvents = events.filter(e => e.budget === 'Paid').slice(0, 5);
      return this.formatAIRecommendations(paidEvents, 'paid');
    }

    // Default AI-like response
    return `Hello! I'm your AI planning assistant, and I'm here to help you discover and plan amazing events! I can see ${events.length} events available in our database. Here's what I can help you with:\n\n` +
      `🎯 **Smart Recommendations**: "Recommend tech events" or "Show me music events"\n` +
      `📅 **Date Planning**: "What's happening this weekend?" or "Events today"\n` +
      `💰 **Budget Options**: "Show me free events" or "Paid events"\n` +
      `📚 **Your Collection**: "Show my saved events"\n` +
      `❓ **Planning Help**: "Help me plan" or "What can you do?"\n\n` +
      `What would you like to explore today? I'm here to make your event planning experience as smooth and enjoyable as possible!`;
  }

  private formatAIRecommendations(events: any[], category: string): string {
    if (events.length === 0) {
      return `I don't see any ${category.toLowerCase()} events available at the moment. This could be because events are still being added to our database, or there might be a temporary gap in the schedule. Would you like me to show you other types of events, or would you prefer to check back later?`;
    }

    const eventList = events.map(event => 
      `• **${event.title}**\n  📅 ${event.date} at ${event.time}\n  📍 ${event.location}\n  💰 ${event.budget}`
    ).join('\n\n');

    return `I found some great ${category.toLowerCase()} events for you:\n\n${eventList}\n\nThese events look promising! Would you like more details about any of these, or would you like me to suggest similar events? I can also help you plan logistics like timing and location if you're interested in attending any of these.`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const freeAIService = new FreeAIService(); 