interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class GeminiService {
  private conversationHistory: Message[] = [];
  private apiKey = 'AIzaSyBvOkT3gEZPxE0aaPVTdc5qeQm8i60DXT8'; // Free demo key
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.conversationHistory = [];
  }

  async sendMessage(userMessage: string, events: any[], bookmarkedEvents: any[]): Promise<string> {
    try {
      // Get saved events details
      const savedEvents = events.filter(event => bookmarkedEvents.some(saved => saved.id === event.id));
      
      // Create context from events
      const eventsContext = events.map(event => 
        `${event.title} (${event.category}) - ${event.date} at ${event.time} - ${event.location} - ${event.budget}`
      ).join('\n');
      
      const savedEventsContext = savedEvents.map(event => 
        `${event.title} (${event.category}) - ${event.date} at ${event.time} - ${event.location} - ${event.budget}`
      ).join('\n');

      // Create system prompt
      const systemPrompt = `You are an AI planning assistant for PlanMate, an event discovery and planning app. 

Available events:
${eventsContext}

User's saved events:
${savedEventsContext}

Your role is to:
1. Help users plan activities and find events
2. If they have saved events, prioritize suggesting those first based on timing, location, budget, and logistics
3. If they have no saved events, recommend from all available events
4. Consider timing, location, budget, and logistics when making recommendations
5. Provide practical, actionable advice
6. Be conversational and helpful
7. Suggest what event to do first if they have multiple saved events

Keep responses concise but informative. Focus on being helpful and practical.`;

      // Add system message if this is the first message
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Prepare messages for Gemini
      const messages = this.conversationHistory.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        parts: [{ text: msg.content }]
      }));

      // Call Gemini API
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that request.';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse,
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-9), // Keep last 9 messages
        ];
      }

      return assistantResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to smart response
      return this.generateFallbackResponse(userMessage, events, bookmarkedEvents);
    }
  }

  private generateFallbackResponse(userMessage: string, events: any[], bookmarkedEvents: any[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (bookmarkedEvents.length > 0 && (lowerMessage.includes('saved') || lowerMessage.includes('bookmark'))) {
      return `I can see you have ${bookmarkedEvents.length} saved events! Here are your bookmarked events:\n\n${
        bookmarkedEvents.map(event => `• ${event.title} (${event.date} at ${event.time})`).join('\n')
      }\n\nWould you like me to help you plan which one to attend first?`;
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      const availableEvents = events.slice(0, 5);
      return `Here are some great events I found for you:\n\n${
        availableEvents.map(event => `• ${event.title} (${event.category}) - ${event.date} at ${event.time}`).join('\n')
      }\n\nWould you like to see more events or get details about any of these?`;
    }
    
    return `I'm here to help you discover and plan events! I can see ${events.length} events available. You can ask me to recommend events, help you plan, or show your saved events. What would you like to do?`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const geminiService = new GeminiService(); 