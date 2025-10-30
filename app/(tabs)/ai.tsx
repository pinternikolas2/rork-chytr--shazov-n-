import { useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brain, Send, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { generateText } from '@rork/toolkit-sdk';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIScreen() {
  const { t, profile, getUpcomingFight } = useApp();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const upcomingFight = getUpcomingFight();

  const suggestions = [
    t.ai.waterIntake,
    t.ai.sodiumBalance,
    t.ai.cuttingTips,
    t.ai.recovery,
  ];

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const context = `You are an expert AI weight-cutting coach for combat sports athletes. You provide safe, science-based advice on weight cutting, hydration, nutrition, and recovery.

Current fighter profile:
- Name: ${profile?.fullName || 'Unknown'}
- Current weight: ${profile && profile.role === 'fighter' ? profile.currentWeight : 'Unknown'} kg
- Target weight: ${profile && profile.role === 'fighter' ? profile.targetWeight : 'Unknown'} kg
- Discipline: ${profile?.discipline || 'Unknown'}
${upcomingFight ? `- Next fight: ${upcomingFight.name} on ${upcomingFight.date.toLocaleDateString()}` : '- No upcoming fight scheduled'}

Provide clear, actionable, and safe advice. Always prioritize fighter safety and health.`;

      const aiResponse = await generateText({
        messages: [
          { role: 'user', content: context },
          ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ],
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Brain size={28} color={Colors.gold} />
            <Text style={styles.title}>{t.ai.title}</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={64} color={Colors.gold} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>{t.ai.askMeAnything}</Text>
              <Text style={styles.emptySubtitle}>
                {t.ai.helpText}
              </Text>

              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>{t.ai.suggestions}</Text>
                <View style={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <Pressable
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => handleSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.messagesContainer}>
              {chatMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBox,
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              ))}
              {isGenerating && (
                <View style={[styles.messageBox, styles.assistantMessage]}>
                  <ActivityIndicator size="small" color={Colors.gold} />
                  <Text style={styles.generatingText}>{t.ai.generating}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t.ai.askQuestion}
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
            editable={!isGenerating}
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || isGenerating) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage(input)}
            disabled={!input.trim() || isGenerating}
          >
            <Send size={20} color={Colors.black} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 32,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  suggestions: {
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  messagesContainer: {
    gap: 12,
  },
  messageBox: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.gold,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.black,
  },
  assistantMessageText: {
    color: Colors.textPrimary,
  },
  generatingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
