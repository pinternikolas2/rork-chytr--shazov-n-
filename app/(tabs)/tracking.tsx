import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Scale, Droplets, Calendar, BarChart3, TrendingDown, AlertCircle, Flame, Drumstick, Wheat } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function TrackingScreen() {
  const { 
    t, 
    addWeightLog, 
    addHydrationLog, 
    weightLogs, 
    getTodayHydration,
    getTodayNutrition,
    getNutritionGoals,
    profile 
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [weightInput, setWeightInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');


  const todayHydration = getTodayHydration();

  const todayNutrition = getTodayNutrition();
  const nutritionGoals = getNutritionGoals();

  const handleLogWeight = async () => {
    if (!weightInput) return;
    const weight = parseFloat(weightInput);
    if (isNaN(weight)) return;
    
    await addWeightLog(weight, selectedTime);
    setWeightInput('');
    Alert.alert(t.common.success, 'Váha byla zaznamenána');
  };

  const handleLogWater = async () => {
    if (!waterInput) return;
    const amount = parseInt(waterInput, 10);
    if (isNaN(amount)) return;
    
    await addHydrationLog(amount);
    setWaterInput('');
  };



  const sodiumProgress = (todayNutrition.sodium / nutritionGoals.sodium) * 100;
  const waterProgress = (todayHydration / 3000) * 100;
  const caloriesProgress = (todayNutrition.calories / nutritionGoals.calories) * 100;
  const proteinProgress = (todayNutrition.protein / nutritionGoals.protein) * 100;
  const carbsProgress = (todayNutrition.carbs / nutritionGoals.carbs) * 100;
  const fatProgress = (todayNutrition.fat / nutritionGoals.fat) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{t.tracking.title}</Text>
        <Pressable style={styles.statsButton} onPress={() => router.push('/tracking-detail')}>
          <BarChart3 size={20} color={Colors.gold} strokeWidth={2.5} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Scale size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>{t.tracking.weight}</Text>
            </View>

            <View style={styles.timeSelector}>
              <Pressable
                style={[
                  styles.timeButton,
                  selectedTime === 'morning' && styles.timeButtonActive,
                ]}
                onPress={() => setSelectedTime('morning')}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    selectedTime === 'morning' && styles.timeButtonTextActive,
                  ]}
                >
                  {t.tracking.morning}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.timeButton,
                  selectedTime === 'evening' && styles.timeButtonActive,
                ]}
                onPress={() => setSelectedTime('evening')}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    selectedTime === 'evening' && styles.timeButtonTextActive,
                  ]}
                >
                  {t.tracking.evening}
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder={t.tracking.enterWeight}
              placeholderTextColor={Colors.textLight}
              keyboardType="decimal-pad"
            />

            <Pressable
              style={[styles.button, !weightInput && styles.buttonDisabled]}
              onPress={handleLogWeight}
              disabled={!weightInput}
            >
              <Text style={styles.buttonText}>{t.tracking.save}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Droplets size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>{t.tracking.hydration}</Text>
            </View>

            <View style={styles.hydrationStats}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{todayHydration}</Text>
                <Text style={styles.statLabel}>{t.tracking.today} ({t.common.ml})</Text>
              </View>
            </View>

            <TextInput
              style={styles.input}
              value={waterInput}
              onChangeText={setWaterInput}
              placeholder={t.tracking.enterWater}
              placeholderTextColor={Colors.textLight}
              keyboardType="number-pad"
            />

            <View style={styles.quickButtons}>
              <Pressable
                style={styles.quickButton}
                onPress={() => {
                  setWaterInput('250');
                  setTimeout(() => handleLogWater(), 100);
                }}
              >
                <Text style={styles.quickButtonText}>250ml</Text>
              </Pressable>
              <Pressable
                style={styles.quickButton}
                onPress={() => {
                  setWaterInput('500');
                  setTimeout(() => handleLogWater(), 100);
                }}
              >
                <Text style={styles.quickButtonText}>500ml</Text>
              </Pressable>
              <Pressable
                style={styles.quickButton}
                onPress={() => {
                  setWaterInput('1000');
                  setTimeout(() => handleLogWater(), 100);
                }}
              >
                <Text style={styles.quickButtonText}>1L</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, !waterInput && styles.buttonDisabled]}
              onPress={handleLogWater}
              disabled={!waterInput}
            >
              <Text style={styles.buttonText}>{t.tracking.save}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dnešní pokrok</Text>

            <View style={styles.progressGrid}>
              <View style={styles.progressCard}>
                <View style={[styles.progressIconContainer, { backgroundColor: '#FF6B6B20' }]}>
                  <Flame size={24} color="#FF6B6B" />
                </View>
                <Text style={styles.progressLabel}>{t.nutrition.calories}</Text>
                <View style={styles.circularProgress}>
                  <View style={styles.circularProgressInner}>
                    <Text style={[styles.progressValue, { color: '#FF6B6B' }]}>
                      {Math.round(todayNutrition.calories)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, caloriesProgress)}%`,
                    backgroundColor: '#FF6B6B'
                  }]} />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressGoal}>{nutritionGoals.calories}</Text>
                  <Text style={styles.progressUnit}>{t.common.kcal}</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={[styles.progressIconContainer, { backgroundColor: '#6366F120' }]}>
                  <Drumstick size={24} color="#6366F1" />
                </View>
                <Text style={styles.progressLabel}>{t.nutrition.protein}</Text>
                <View style={styles.circularProgress}>
                  <View style={styles.circularProgressInner}>
                    <Text style={[styles.progressValue, { color: '#6366F1' }]}>
                      {Math.round(todayNutrition.protein)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, proteinProgress)}%`,
                    backgroundColor: '#6366F1'
                  }]} />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressGoal}>{nutritionGoals.protein}</Text>
                  <Text style={styles.progressUnit}>{t.common.g}</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={[styles.progressIconContainer, { backgroundColor: '#3B82F620' }]}>
                  <Droplets size={24} color="#3B82F6" />
                </View>
                <Text style={styles.progressLabel}>{t.tracking.hydration}</Text>
                <View style={styles.circularProgress}>
                  <View style={styles.circularProgressInner}>
                    <Text style={[styles.progressValue, { color: '#3B82F6' }]}>
                      {todayHydration}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, waterProgress)}%`,
                    backgroundColor: '#3B82F6'
                  }]} />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressGoal}>3000</Text>
                  <Text style={styles.progressUnit}>{t.common.ml}</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={[styles.progressIconContainer, { backgroundColor: '#F59E0B20' }]}>
                  <Wheat size={24} color="#F59E0B" />
                </View>
                <Text style={styles.progressLabel}>{t.nutrition.carbs}</Text>
                <View style={styles.circularProgress}>
                  <View style={styles.circularProgressInner}>
                    <Text style={[styles.progressValue, { color: '#F59E0B' }]}>
                      {Math.round(todayNutrition.carbs)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, carbsProgress)}%`,
                    backgroundColor: '#F59E0B'
                  }]} />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressGoal}>{nutritionGoals.carbs}</Text>
                  <Text style={styles.progressUnit}>{t.common.g}</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={[styles.progressIconContainer, { backgroundColor: '#10B98120' }]}>
                  <Droplets size={24} color="#10B981" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
                <Text style={styles.progressLabel}>{t.nutrition.fat}</Text>
                <View style={styles.circularProgress}>
                  <View style={styles.circularProgressInner}>
                    <Text style={[styles.progressValue, { color: '#10B981' }]}>
                      {Math.round(todayNutrition.fat)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, fatProgress)}%`,
                    backgroundColor: '#10B981'
                  }]} />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressGoal}>{nutritionGoals.fat}</Text>
                  <Text style={styles.progressUnit}>{t.common.g}</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={[styles.progressIconContainer, { backgroundColor: '#EF444420' }]}>
                  <AlertCircle size={24} color="#EF4444" />
                </View>
                <Text style={styles.progressLabel}>{t.tracking.sodium}</Text>
                <View style={styles.circularProgress}>
                  <View style={styles.circularProgressInner}>
                    <Text style={[styles.progressValue, { color: '#EF4444' }]}>
                      {todayNutrition.sodium}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, sodiumProgress)}%`,
                    backgroundColor: sodiumProgress > 100 ? '#EF4444' : '#EF4444'
                  }]} />
                </View>
                <View style={styles.progressStats}>
                  <Text style={styles.progressGoal}>{nutritionGoals.sodium}</Text>
                  <Text style={styles.progressUnit}>{t.common.mg}</Text>
                </View>
              </View>
            </View>
          </View>

          {weightLogs.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Calendar size={24} color={Colors.gold} />
                <Text style={styles.cardTitle}>{t.tracking.history}</Text>
              </View>

              <View style={styles.quickStatsGrid}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>
                    {weightLogs[weightLogs.length - 1].weight.toFixed(1)}
                  </Text>
                  <Text style={styles.quickStatLabel}>Poslední váha (kg)</Text>
                </View>
                {profile && profile.role === 'fighter' && (
                  <View style={styles.quickStatItem}>
                    <View style={styles.quickStatValueRow}>
                      {profile.currentWeight > profile.targetWeight ? (
                        <TrendingDown size={20} color={Colors.gold} />
                      ) : null}
                      <Text style={styles.quickStatValue}>
                        {(profile.currentWeight - profile.targetWeight).toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.quickStatLabel}>Zbývá shodit (kg)</Text>
                  </View>
                )}
              </View>

              <View style={styles.historyList}>
                {weightLogs.slice(-5).reverse().map((log) => (
                  <View key={log.id} style={styles.historyItem}>
                    <View>
                      <Text style={styles.historyValue}>
                        {log.weight.toFixed(1)} {t.common.kg}
                      </Text>
                      <Text style={styles.historyDate}>
                        {log.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} - {t.tracking[log.time]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {weightLogs.length > 5 && (
                <Pressable style={styles.seeAllButton} onPress={() => router.push('/tracking-detail')}>
                  <Text style={styles.seeAllButtonText}>Zobrazit vše ({weightLogs.length} záznamů)</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  timeButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  timeButtonTextActive: {
    color: Colors.gold,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 16,
  },

  button: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  hydrationStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },

  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  progressCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600' as const,
  },
  circularProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  circularProgressInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 4,
  },
  progressGoal: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  progressUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickStatItem: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  quickStatValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  seeAllButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  seeAllButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
});
