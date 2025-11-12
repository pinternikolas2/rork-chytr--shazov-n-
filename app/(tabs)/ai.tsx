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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brain, Send, Sparkles, Bot, User, Crown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { generateText } from '@rork-ai/toolkit-sdk';
import { useRouter } from 'expo-router';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIScreen() {
  const { t, profile, getUpcomingFight, getTodayHydration, getDailyHydrationGoal, getTodayMeals, getTodayNutrition, getNutritionGoals, weightLogs } = useApp();
  const { hasAccessToFeature, isTrial, trialDaysRemaining } = useSubscription();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const upcomingFight = getUpcomingFight();
  const todayHydration = getTodayHydration();
  const hydrationGoal = getDailyHydrationGoal();
  const todayMeals = getTodayMeals();
  const todayNutrition = getTodayNutrition();
  const nutritionGoals = getNutritionGoals();

  const suggestions = [
    t.ai.waterIntake,
    t.ai.sodiumBalance,
    t.ai.cuttingTips,
    t.ai.recovery,
  ];

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isGenerating) return;

    if (!hasAccessToFeature('ai_advisor')) {
      Alert.alert(
        'Premium Funkce',
        'AI poradce je dostupný pouze v Premium verzi. Získejte neomezený přístup k AI poradci pro personalizované rady.',
        [
          { text: 'Zrušit', style: 'cancel' },
          { text: 'Zobrazit Premium', onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }

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
      const recentWeightLogs = weightLogs.slice(-7).map(log => 
        `${log.date.toLocaleDateString()}: ${log.weight} kg (${log.time})`
      ).join('\n');

      const todayMealsList = todayMeals.map(meal => 
        `${meal.name} - ${meal.calories} kcal (P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g, Na: ${meal.sodiumMg}mg)`
      ).join('\n');

      const isCzech = t.appName === 'Chytré Shazování';
      
      const context = isCzech 
        ? `Jsi expertní AI trenér pro shazování váhy pro bojové sporty. Poskytuj bezpečné, vědecky podložené rady ohledně shazování váhy, hydratace, výživy a regenerace. ODPOVÍDEJ VŽDY V ČEŠTINĚ.

Profil zápasníka:
- Jméno: ${profile?.fullName || 'Neznámé'}
- Aktuální váha: ${profile && profile.role === 'fighter' ? profile.currentWeight : 'Neznámá'} kg
- Cílová váha: ${profile && profile.role === 'fighter' ? profile.targetWeight : 'Neznámá'} kg
- Disciplína: ${profile?.discipline || 'Neznámá'}
- Typ diety: ${profile && profile.role === 'fighter' ? profile.dietType : 'Neznámý'}
- Intenzita tréninku: ${profile && profile.role === 'fighter' ? profile.trainingIntensity : 'Neznámá'}
${upcomingFight ? `- Další zápas: ${upcomingFight.name} dne ${upcomingFight.date.toLocaleDateString('cs-CZ')}` : '- Žádný nadcházející zápas'}

Dnešní sledování:
- Hydratace: ${todayHydration} ml / ${hydrationGoal} ml (${Math.round((todayHydration / hydrationGoal) * 100)}%)
- Kalorie: ${todayNutrition.calories} kcal / ${nutritionGoals.calories} kcal
- Bílkoviny: ${todayNutrition.protein}g / ${nutritionGoals.protein}g
- Sacharidy: ${todayNutrition.carbs}g / ${nutritionGoals.carbs}g
- Tuky: ${todayNutrition.fat}g / ${nutritionGoals.fat}g
- Sodík: ${todayNutrition.sodium}mg / ${nutritionGoals.sodium}mg
- Jídla dnes (${todayMeals.length}):
${todayMealsList || '  Zatím žádná zaznamenaná jídla'}

Poslední záznamy váhy (posledních 7 dní):
${recentWeightLogs || '  Žádné poslední záznamy váhy'}

Poskytuj jasné, praktické a bezpečné rady na základě těchto dat. Vždy upřednostňuj bezpečnost a zdraví zápasníka. Používej skutečná data pro personalizovaná doporučení. ODPOVÍDEJ VŽDY V ČEŠTINĚ.`
        : `You are an expert AI weight-cutting coach for combat sports athletes. You provide safe, science-based advice on weight cutting, hydration, nutrition, and recovery. ALWAYS RESPOND IN ENGLISH.

Current fighter profile:
- Name: ${profile?.fullName || 'Unknown'}
- Current weight: ${profile && profile.role === 'fighter' ? profile.currentWeight : 'Unknown'} kg
- Target weight: ${profile && profile.role === 'fighter' ? profile.targetWeight : 'Unknown'} kg
- Discipline: ${profile?.discipline || 'Unknown'}
- Diet type: ${profile && profile.role === 'fighter' ? profile.dietType : 'Unknown'}
- Training intensity: ${profile && profile.role === 'fighter' ? profile.trainingIntensity : 'Unknown'}
${upcomingFight ? `- Next fight: ${upcomingFight.name} on ${upcomingFight.date.toLocaleDateString('en-US')}` : '- No upcoming fight scheduled'}

Today's tracking data:
- Hydration: ${todayHydration} ml / ${hydrationGoal} ml (${Math.round((todayHydration / hydrationGoal) * 100)}%)
- Calories: ${todayNutrition.calories} kcal / ${nutritionGoals.calories} kcal
- Protein: ${todayNutrition.protein}g / ${nutritionGoals.protein}g
- Carbs: ${todayNutrition.carbs}g / ${nutritionGoals.carbs}g
- Fat: ${todayNutrition.fat}g / ${nutritionGoals.fat}g
- Sodium: ${todayNutrition.sodium}mg / ${nutritionGoals.sodium}mg
- Meals today (${todayMeals.length}):
${todayMealsList || '  No meals logged yet'}

Recent weight logs (last 7 days):
${recentWeightLogs || '  No recent weight logs'}

Provide clear, actionable, and safe advice based on this data. Always prioritize fighter safety and health. Use the actual data to give personalized recommendations. ALWAYS RESPOND IN ENGLISH.`;

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
      const isCzech = t.appName === 'Chytré Shazování';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isCzech ? 'Omlouváme se, došlo k chybě. Zkuste to prosím znovu.' : 'Sorry, I encountered an error. Please try again.',
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
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIconBg}>
              <Brain size={24} color={Colors.gold} strokeWidth={2.5} />
            </View>
          </View>
          <View style={styles.headerTextContent}>
            <Text style={styles.title}>{t.ai.title}</Text>
            <Text style={styles.subtitle}>{t.ai.helpText}</Text>
          </View>
          {isTrial && trialDaysRemaining > 0 && (
            <Pressable style={styles.trialBadge} onPress={() => router.push('/subscription')}>
              <Crown size={14} color={Colors.gold} />
              <Text style={styles.trialBadgeText}>{trialDaysRemaining}d</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <View style={styles.emptyIconBg}>
                  <Sparkles size={40} color={Colors.gold} strokeWidth={2} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>{t.ai.askMeAnything}</Text>

              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>{t.ai.suggestions}</Text>
                <View style={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.suggestionButton,
                        pressed && styles.suggestionButtonPressed,
                      ]}
                      onPress={() => handleSuggestion(suggestion)}
                    >
                      <View style={styles.suggestionContent}>
                        <Sparkles size={18} color={Colors.gold} strokeWidth={2} />
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </View>
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
                    styles.messageRow,
                    message.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
                  ]}
                >
                  {message.role === 'assistant' && (
                    <View style={styles.messageAvatar}>
                      <View style={styles.avatarBg}>
                        <Bot size={18} color={Colors.gold} strokeWidth={2.5} />
                      </View>
                    </View>
                  )}
                  <View
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
                  {message.role === 'user' && (
                    <View style={styles.messageAvatar}>
                      <View style={[styles.avatarBg, styles.userAvatarBg]}>
                        <User size={18} color={Colors.black} strokeWidth={2.5} />
                      </View>
                    </View>
                  )}
                </View>
              ))}
              {isGenerating && (
                <View style={[styles.messageRow, styles.assistantMessageRow]}>
                  <View style={styles.messageAvatar}>
                    <View style={styles.avatarBg}>
                      <Bot size={18} color={Colors.gold} strokeWidth={2.5} />
                    </View>
                  </View>
                  <View style={[styles.messageBox, styles.assistantMessage, styles.generatingBox]}>
                    <View style={styles.generatingContent}>
                      <ActivityIndicator size="small" color={Colors.gold} />
                      <Text style={styles.generatingText}>{t.ai.generating}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
          <View style={styles.inputWrapper}>
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
              style={({ pressed }) => [
                styles.sendButton,
                (!input.trim() || isGenerating) && styles.sendButtonDisabled,
                pressed && input.trim() && !isGenerating && styles.sendButtonPressed,
              ]}
              onPress={() => handleSendMessage(input)}
              disabled={!input.trim() || isGenerating}
            >
              <Send size={20} color={Colors.black} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    marginRight: 4,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  headerTextContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
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
    paddingVertical: 32,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 40,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  suggestions: {
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
    flex: 1,
  },
  messagesContainer: {
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginBottom: 2,
  },
  avatarBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  userAvatarBg: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  messageBox: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  generatingBox: {
    paddingVertical: 16,
  },
  generatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.black,
    fontWeight: '500' as const,
  },
  assistantMessageText: {
    color: Colors.textPrimary,
  },
  generatingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: Colors.lightGray,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  trialBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
});
