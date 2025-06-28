import Constants from 'expo-constants';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.openaiApiKey,
  dangerouslyAllowBrowser: true,
});

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private conversationHistory: Message[] = [];

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

      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantResponse = response.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.';

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
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const openaiService = new OpenAIService(); 