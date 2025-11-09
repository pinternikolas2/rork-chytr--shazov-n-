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
import { Scale, Droplets, BarChart3, Dumbbell, Moon, Activity as ActivityIcon, ChevronRight, Calendar, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

type MetricType = 'weight' | 'water' | 'training' | 'bodyFat';
type TimeRange = '7days' | 'month' | '3months' | 'year';

export default function TrackingScreen() {
  const { 
    t, 
    addWeightLog, 
    deleteWeightLog,
    addTrainingLog,
    deleteTrainingLog,
    addBodyCompositionLog,
    getTodayTrainings,
    weightLogs, 
    getTodayHydration,
    getTodayNutrition,
    getNutritionGoals,
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [weightInput, setWeightInput] = useState('');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [muscleMassInput, setMuscleMassInput] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('7days');
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [trainingType, setTrainingType] = useState<'strength' | 'cardio' | 'technique' | 'sparring' | 'other'>('cardio');
  const [trainingDuration, setTrainingDuration] = useState('');
  const [trainingIntensity, setTrainingIntensity] = useState<'low' | 'medium' | 'high' | 'extreme'>('medium');
  const [caloriesBurned, setCaloriesBurned] = useState('');

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

  const handleLogTraining = async () => {
    if (!trainingDuration) return;
    const duration = parseInt(trainingDuration, 10);
    if (isNaN(duration)) return;
    
    await addTrainingLog({
      date: new Date(),
      type: trainingType,
      duration,
      intensity: trainingIntensity,
      caloriesBurned: caloriesBurned ? parseFloat(caloriesBurned) : undefined,
    });
    setTrainingDuration('');
    setCaloriesBurned('');
    setShowTrainingForm(false);
    Alert.alert(t.common.success, 'Trénink byl zaznamenán');
  };

  const handleLogBodyComposition = async () => {
    if (!bodyFatInput && !muscleMassInput) return;
    
    await addBodyCompositionLog({
      date: new Date(),
      bodyFatPercentage: bodyFatInput ? parseFloat(bodyFatInput) : undefined,
      muscleMass: muscleMassInput ? parseFloat(muscleMassInput) : undefined,
    });
    setBodyFatInput('');
    setMuscleMassInput('');
    Alert.alert(t.common.success, 'Tělesné složení bylo zaznamenáno');
  };

  const todayTrainings = getTodayTrainings();

  const metrics: { key: MetricType; label: string }[] = [
    { key: 'weight', label: 'Váha' },
    { key: 'water', label: 'Hydratace' },
    { key: 'training', label: 'Trénink' },
    { key: 'bodyFat', label: 'Tělesný tuk' },
  ];

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: '7days', label: '7 dní' },
    { key: 'month', label: 'Měsíc' },
    { key: '3months', label: '3 měsíce' },
    { key: 'year', label: 'Rok' },
  ];

  const getFilteredData = () => {
    const now = new Date();
    let daysBack = 7;
    if (selectedTimeRange === 'month') daysBack = 30;
    if (selectedTimeRange === '3months') daysBack = 90;
    if (selectedTimeRange === 'year') daysBack = 365;
    
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    if (selectedMetric === 'weight') {
      return weightLogs.filter(log => log.date >= cutoffDate).reverse();
    }
    
    return [];
  };

  const filteredData = getFilteredData();

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

            <Pressable style={styles.navigateButton} onPress={() => router.push('/hydration')}>
              <Text style={styles.navigateButtonText}>Přejít do Hydratace</Text>
              <ChevronRight size={20} color={Colors.black} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ActivityIcon size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>Jídlo & Makroživiny</Text>
            </View>

            <View style={styles.nutritionSummary}>
              <Text style={styles.nutritionSummaryTitle}>Dnešní součet:</Text>
              <Text style={styles.nutritionSummaryText}>
                {todayNutrition.calories} Kalorií, {todayNutrition.protein}g Bílkovin, {todayNutrition.carbs}g Sacharidů, {todayNutrition.fat}g Tuků, {todayNutrition.sodium}mg Sodíku
              </Text>
            </View>

            <Pressable style={styles.navigateButton} onPress={() => router.push('/nutrition')}>
              <Text style={styles.navigateButtonText}>Přejít do Výživy</Text>
              <ChevronRight size={20} color={Colors.black} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Dumbbell size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>Trénink</Text>
            </View>
            {!showTrainingForm && todayTrainings.length === 0 && (
              <View style={styles.trainingEmptyState}>
                <Text style={styles.emptyStateText}>Zatím žádný trénink zaznamenán</Text>
                <Pressable style={styles.addTrainingButton} onPress={() => setShowTrainingForm(true)}>
                  <Text style={styles.addTrainingButtonText}>+ Přidat trénink</Text>
                </Pressable>
              </View>
            )}
            {!showTrainingForm && todayTrainings.length > 0 && (
              <View>
                {todayTrainings.map((training) => (
                  <View key={training.id} style={styles.trainingItem}>
                    <View style={styles.trainingItemContent}>
                      <View style={styles.trainingItemLeft}>
                        <Text style={styles.trainingTypeText}>{training.type} - {training.duration} min</Text>
                        <Text style={styles.trainingIntensityText}>Intenzita: {training.intensity}</Text>
                        {training.caloriesBurned && (
                          <Text style={styles.trainingCaloriesText}>{training.caloriesBurned} kcal</Text>
                        )}
                      </View>
                      <Pressable 
                        style={styles.deleteButton}
                        onPress={async () => {
                          Alert.alert(
                            'Smazat trénink',
                            'Opravdu chcete smazat tento trénink?',
                            [
                              { text: 'Zrušit', style: 'cancel' },
                              { 
                                text: 'Smazat', 
                                style: 'destructive',
                                onPress: async () => {
                                  await deleteTrainingLog(training.id);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <Trash2 size={18} color={"#EF4444"} />
                      </Pressable>
                    </View>
                  </View>
                ))}
                <Pressable style={styles.addTrainingButton} onPress={() => setShowTrainingForm(true)}>
                  <Text style={styles.addTrainingButtonText}>+ Přidat další trénink</Text>
                </Pressable>
              </View>
            )}
            {showTrainingForm && (
              <View style={styles.trainingForm}>
                <Text style={styles.formLabel}>Typ tréninku</Text>
                <View style={styles.typeSelector}>
                  {(['strength', 'cardio', 'technique', 'sparring', 'other'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[styles.typeButton, trainingType === type && styles.typeButtonActive]}
                      onPress={() => setTrainingType(type)}
                    >
                      <Text style={[styles.typeButtonText, trainingType === type && styles.typeButtonTextActive]}>
                        {type === 'strength' ? 'Síla' : type === 'cardio' ? 'Kardio' : type === 'technique' ? 'Technika' : type === 'sparring' ? 'Sparing' : 'Ostatní'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.formLabel}>Doba trvání (minuty)</Text>
                <TextInput
                  style={styles.input}
                  value={trainingDuration}
                  onChangeText={setTrainingDuration}
                  placeholder="60"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                />
                <Text style={styles.formLabel}>Intenzita</Text>
                <View style={styles.intensitySelector}>
                  {(['low', 'medium', 'high', 'extreme'] as const).map((intensity) => (
                    <Pressable
                      key={intensity}
                      style={[styles.intensityButton, trainingIntensity === intensity && styles.intensityButtonActive]}
                      onPress={() => setTrainingIntensity(intensity)}
                    >
                      <Text style={[styles.intensityButtonText, trainingIntensity === intensity && styles.intensityButtonTextActive]}>
                        {intensity === 'low' ? 'Nízká' : intensity === 'medium' ? 'Střední' : intensity === 'high' ? 'Vysoká' : 'Extrémní'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.formLabel}>Spálené kalorie (volitelné)</Text>
                <TextInput
                  style={styles.input}
                  value={caloriesBurned}
                  onChangeText={setCaloriesBurned}
                  placeholder="300"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                />
                <View style={styles.formButtons}>
                  <Pressable style={styles.cancelButton} onPress={() => setShowTrainingForm(false)}>
                    <Text style={styles.cancelButtonText}>Zrušit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, !trainingDuration && styles.buttonDisabled]}
                    onPress={handleLogTraining}
                    disabled={!trainingDuration}
                  >
                    <Text style={styles.buttonText}>{t.tracking.save}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Moon size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>Spánek & Regenerace</Text>
            </View>
            <View style={styles.wellnessGrid}>
              <View style={styles.wellnessCard}>
                <Text style={styles.wellnessLabel}>Hodiny spánku</Text>
                <Text style={styles.wellnessValue}>-</Text>
                <Text style={styles.wellnessSubtext}>Zatím nezaznamenáno</Text>
              </View>
              <View style={styles.wellnessCard}>
                <Text style={styles.wellnessLabel}>Kvalita</Text>
                <Text style={styles.wellnessValue}>-</Text>
                <Text style={styles.wellnessSubtext}>Zatím nezaznamenáno</Text>
              </View>
            </View>
            <Pressable style={styles.addDataButton} onPress={() => router.push('/wellness')}>
              <Text style={styles.addDataButtonText}>Zaznamenat spánek</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ActivityIcon size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>Tělesné složení</Text>
            </View>
            <View style={styles.bodyCompositionForm}>
              <TextInput
                style={styles.input}
                value={bodyFatInput}
                onChangeText={setBodyFatInput}
                placeholder="Tělesný tuk (%)"
                placeholderTextColor={Colors.textLight}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.input}
                value={muscleMassInput}
                onChangeText={setMuscleMassInput}
                placeholder="Svalová hmota (kg)"
                placeholderTextColor={Colors.textLight}
                keyboardType="decimal-pad"
              />
              <Pressable
                style={[styles.button, (!bodyFatInput && !muscleMassInput) && styles.buttonDisabled]}
                onPress={handleLogBodyComposition}
                disabled={!bodyFatInput && !muscleMassInput}
              >
                <Text style={styles.buttonText}>{t.tracking.save}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={24} color={Colors.gold} />
              <Text style={styles.cardTitle}>Historie & Trendy</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.metricSelector}
              contentContainerStyle={styles.metricSelectorContent}
            >
              {metrics.map((metric) => (
                <Pressable
                  key={metric.key}
                  style={[
                    styles.metricButton,
                    selectedMetric === metric.key && styles.metricButtonActive,
                  ]}
                  onPress={() => setSelectedMetric(metric.key)}
                >
                  <Text
                    style={[
                      styles.metricButtonText,
                      selectedMetric === metric.key && styles.metricButtonTextActive,
                    ]}
                  >
                    {metric.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.timeRangeSelector}>
              {timeRanges.map((range) => (
                <Pressable
                  key={range.key}
                  style={[
                    styles.timeRangeButton,
                    selectedTimeRange === range.key && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setSelectedTimeRange(range.key)}
                >
                  <Text
                    style={[
                      styles.timeRangeButtonText,
                      selectedTimeRange === range.key && styles.timeRangeButtonTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {selectedMetric === 'weight' && filteredData.length > 0 ? (
              <>
                <View style={styles.historyChartContainer}>
                  <View style={styles.historyChart}>
                    {(() => {
                      const arr = filteredData.slice(0, 10);
                      const weights = arr.map(l => l.weight);
                      const maxWeight = Math.max(...weights);
                      const minWeight = Math.min(...weights);
                      const range = maxWeight - minWeight || 1;
                      
                      return (
                        <View style={styles.chartBarsContainer}>
                          {arr.map((log, i) => {
                            const heightPercent = ((log.weight - minWeight) / range) * 100;
                            
                            return (
                              <View key={`bar-${log.id}`} style={styles.chartBarColumn}>
                                <View style={styles.chartBarWrapper}>
                                  <View style={[styles.chartBar, { height: `${heightPercent}%` }]} />
                                </View>
                                <Text style={styles.chartBarValue}>{log.weight.toFixed(1)}</Text>
                                <Text style={styles.chartBarLabel}>
                                  {log.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })()}
                  </View>
                </View>

                <View style={styles.historyList}>
                  {filteredData.slice(0, 10).map((log) => (
                    <View key={log.id} style={styles.historyItem}>
                      <View style={styles.historyItemContent}>
                        <View>
                          <Text style={styles.historyValue}>
                            {log.weight.toFixed(1)} {t.common.kg}
                          </Text>
                          <Text style={styles.historyDate}>
                            {log.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })} - {log.date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} ({t.tracking[log.time]})
                          </Text>
                        </View>
                        <Pressable 
                          style={styles.deleteButton}
                          onPress={async () => {
                            Alert.alert(
                              'Smazat záznam',
                              'Opravdu chcete smazat tento záznam váhy?',
                              [
                                { text: 'Zrušit', style: 'cancel' },
                                { 
                                  text: 'Smazat', 
                                  style: 'destructive',
                                  onPress: async () => {
                                    await deleteWeightLog(log.id);
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Trash2 size={18} color={"#EF4444"} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.noDataText}>Žádná data pro vybranou metriku a časový rozsah</Text>
            )}
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  timeButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: '#FEF9E7',
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
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 14,
  },
  button: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  hydrationStats: {
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nutritionSummary: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  nutritionSummaryTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  nutritionSummaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  navigateButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  trainingEmptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  addTrainingButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  addTrainingButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  wellnessGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  wellnessCard: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  wellnessLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  wellnessValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  wellnessSubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addDataButton: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  addDataButtonText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  bodyCompositionForm: {
    gap: 0,
  },
  metricSelector: {
    marginBottom: 12,
  },
  metricSelectorContent: {
    gap: 8,
    paddingRight: 16,
  },
  metricButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  metricButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  metricButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  metricButtonTextActive: {
    color: Colors.black,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  timeRangeButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  timeRangeButtonTextActive: {
    color: Colors.black,
  },
  historyChartContainer: {
    marginBottom: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 12,
  },
  historyChart: {
    width: '100%',
    padding: 8,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: 2,
  },
  chartBarColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  chartBarWrapper: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: '80%',
    backgroundColor: Colors.gold,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  chartBarValue: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  chartBarLabel: {
    fontSize: 7,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  noDataText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  trainingItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  trainingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trainingItemLeft: {
    flex: 1,
  },
  trainingTypeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  trainingIntensityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  trainingCaloriesText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  trainingForm: {
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  typeButtonActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: Colors.gold,
  },
  intensitySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  intensityButtonActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  intensityButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  intensityButtonTextActive: {
    color: Colors.gold,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
});
