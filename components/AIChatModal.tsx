import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { realAIService } from '../services/realAIService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
  events: any[];
  bookmarkedEvents: any[];
}

export default function AIChatModal({ visible, onClose, events, bookmarkedEvents }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
      const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('AIzaSyD7BssDDN5kORTy4xR5NxxrIY3f512ZXnI');
    const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic' | 'cohere' | 'gemini'>('gemini');
    const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Configure AI service with Gemini API key
    realAIService.setAPIKey(apiKey);
    realAIService.setProvider(selectedProvider);
  }, [apiKey, selectedProvider]);

  useEffect(() => {
    if (visible && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: `Hi! I'm your AI planning assistant powered by Google Gemini. I can help you plan activities and find events. ${
          bookmarkedEvents.length > 0 
            ? `I see you have ${bookmarkedEvents.length} saved events. I can help you plan what to do first based on your preferences!`
            : "I can suggest events from all available options and help you plan your activities."
        } What would you like to do?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [visible, bookmarkedEvents.length]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '🤔 AI is thinking...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await realAIService.sendMessage(inputText.trim(), events, bookmarkedEvents);
      
      // Remove loading message and add real response
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message and add error response
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const configureAI = () => {
    setShowSettings(true);
  };

  const saveAPIKey = () => {
    if (apiKey.trim()) {
      realAIService.setAPIKey(apiKey.trim());
      realAIService.setProvider(selectedProvider);
      setShowSettings(false);
      Alert.alert('Success', 'AI service configured!');
    } else {
      Alert.alert('Error', 'Please enter a valid API key');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#007AFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>AI Planning Assistant</Text>
              <Text style={styles.headerSubtitle}>
                {isLoading ? 'Typing...' : 'Ask me anything about events!'}
              </Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={configureAI} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about events, planning, or recommendations..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={(!inputText.trim() || isLoading) ? '#ccc' : 'white'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View style={styles.settingsContainer}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Configure AI Service</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsContent}>
            <Text style={styles.settingsLabel}>Select AI Provider:</Text>
            <View style={styles.providerButtons}>
              {(['openai', 'anthropic', 'cohere', 'gemini'] as const).map((provider) => (
                <TouchableOpacity
                  key={provider}
                  style={[
                    styles.providerButton,
                    selectedProvider === provider && styles.providerButtonActive
                  ]}
                  onPress={() => setSelectedProvider(provider)}
                >
                  <Text style={[
                    styles.providerButtonText,
                    selectedProvider === provider && styles.providerButtonTextActive
                  ]}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.settingsLabel}>API Key:</Text>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Enter your API key here..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              multiline
            />

            <TouchableOpacity
              style={[styles.saveButton, !apiKey.trim() && styles.saveButtonDisabled]}
              onPress={saveAPIKey}
              disabled={!apiKey.trim()}
            >
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>

            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>✅ Pre-configured with Google Gemini!</Text>
              <Text style={styles.helpBody}>
                Your AI is ready to use with Google Gemini (15 free requests/minute).{'\n\n'}
                Other free options:{'\n'}
                • Cohere: dashboard.cohere.ai{'\n'}
                • Hugging Face: huggingface.co{'\n'}
                • Replicate: replicate.com
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  // Settings Modal Styles
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  settingsContent: {
    flex: 1,
    padding: 16,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  providerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  providerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  providerButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  providerButtonText: {
    fontSize: 14,
    color: '#666',
  },
  providerButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  apiKeyInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  helpBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 