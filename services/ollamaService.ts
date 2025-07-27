interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OllamaService {
  private conversationHistory: Message[] = [];
  private baseUrl: string = 'http://192.168.18.74:11434'; // Use computer's IP address instead of localhost

  constructor() {
    this.conversationHistory = [];
  }

  async sendMessage(userMessage: string, events: any[], bookmarkedEvents: any[]): Promise<string> {
    try {
      // Get saved events details
      const savedEvents = events.filter(event => bookmarkedEvents.some(saved => saved.id === event.id));
      
      // Create system prompt
      const systemPrompt = `You are an AI planning assistant for PlanMate, an event discovery and planning app. 

Available events: ${JSON.stringify(events)}
User's saved events: ${JSON.stringify(savedEvents)}

Your role is to:
1. Help users plan activities and find events
2. If they have saved events, prioritize suggesting those first based on timing, location, budget, and logistics
3. If they have no saved events, recommend from all available events
4. Consider timing, location, budget, and logistics when making recommendations
5. Provide practical, actionable advice
6. Be conversational and helpful
7. Suggest what event to do first if they have multiple saved events

Keep responses concise but informative. Focus on being helpful and practical. If the user asks about planning from saved events, prioritize those. If they have no saved events, suggest from all available events.`;

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

      // Prepare messages for Ollama (convert to Ollama format)
      const ollamaMessages = this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get response from Ollama
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2',
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 500,
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.message?.content || 'Sorry, I couldn\'t process that request.';

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
      console.error('Ollama API error:', error);
      
      // Provide a helpful fallback response based on the user's message
      const fallbackResponse = this.generateFallbackResponse(userMessage, events, bookmarkedEvents);
      
      // Add fallback response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackResponse,
      });

      return fallbackResponse;
    }
  }

  // Generate a helpful fallback response when Ollama is not available
  private generateFallbackResponse(userMessage: string, events: any[], bookmarkedEvents: any[]): string {
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
      const availableEvents = events.slice(0, 5); // Show first 5 events
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

  // Method to check if Ollama is running
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const ollamaService = new OllamaService(); 