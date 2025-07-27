interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class HuggingFaceService {
  private conversationHistory: Message[] = [];
  private apiUrl = 'https://api-inference.huggingface.co/models/gpt2';

  constructor() {
    this.conversationHistory = [];
  }

  async sendMessage(userMessage: string, events: any[], bookmarkedEvents: any[]): Promise<string> {
    try {
      // Get saved events details
      const savedEvents = events.filter(event => bookmarkedEvents.some(saved => saved.id === event.id));
      
      // Create context from events
      const eventsContext = events.map(event => 
        `${event.title} (${event.category}) - ${event.date} at ${event.time}`
      ).join(', ');
      
      const savedEventsContext = savedEvents.map(event => 
        `${event.title} (${event.category}) - ${event.date} at ${event.time}`
      ).join(', ');

      // Create a comprehensive prompt
      const fullPrompt = `You are an AI planning assistant for PlanMate, an event discovery and planning app.

Available events: ${eventsContext}
User's saved events: ${savedEventsContext}

User question: ${userMessage}

Please help the user with event planning. If they have saved events, suggest those first. If not, recommend from available events. Be helpful and practical.`;

      // Use Hugging Face Inference API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true,
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let assistantResponse = '';

      if (Array.isArray(data) && data.length > 0) {
        assistantResponse = data[0].generated_text || '';
      } else if (typeof data === 'string') {
        assistantResponse = data;
      } else {
        // Fallback to smart response based on user input
        assistantResponse = this.generateSmartResponse(userMessage, events, bookmarkedEvents);
      }

      // Clean up the response
      assistantResponse = assistantResponse.replace(fullPrompt, '').trim();
      if (!assistantResponse) {
        assistantResponse = this.generateSmartResponse(userMessage, events, bookmarkedEvents);
      }

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse,
      });

      // Keep history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return assistantResponse;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      // Return a smart fallback response
      return this.generateSmartResponse(userMessage, events, bookmarkedEvents);
    }
  }

  private generateSmartResponse(userMessage: string, events: any[], bookmarkedEvents: any[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for saved events
    if (bookmarkedEvents.length > 0) {
      if (lowerMessage.includes('saved') || lowerMessage.includes('bookmark')) {
        return `I can see you have ${bookmarkedEvents.length} saved events! Here are your bookmarked events:\n\n${
          bookmarkedEvents.map(event => `• ${event.title} (${event.date} at ${event.time})`).join('\n')
        }\n\nWould you like me to help you plan which one to attend first?`;
      }
    }
    
    // Check for event recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('find')) {
      const availableEvents = events.slice(0, 5);
      return `Here are some great events I found for you:\n\n${
        availableEvents.map(event => `• ${event.title} (${event.category}) - ${event.date} at ${event.time}`).join('\n')
      }\n\nWould you like to see more events or get details about any of these?`;
    }
    
    // Check for planning help
    if (lowerMessage.includes('plan') || lowerMessage.includes('help')) {
      return `I'd be happy to help you plan! I can see ${events.length} events available. What type of events are you interested in? You can filter by category (Tech, Music, Food, Art, Outdoor) or ask me for specific recommendations.`;
    }
    
    // Default helpful response
    return `I'm here to help you discover and plan events! I can see ${events.length} events available. You can:\n\n• Ask me to recommend events\n• Get help planning from your ${bookmarkedEvents.length} saved events\n• Filter events by category or date\n• Get details about specific events\n\nWhat would you like to do?`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const huggingFaceService = new HuggingFaceService(); 