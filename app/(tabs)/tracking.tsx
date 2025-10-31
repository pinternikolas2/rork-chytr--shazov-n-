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
import { Scale, Droplets, Calendar, BarChart3, TrendingDown, Activity, Moon, Zap, AlertCircle, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { EnergyLevel, WaterRetentionLevel } from '@/constants/types';

export default function TrackingScreen() {
  const { 
    t, 
    addWeightLog, 
    addHydrationLog, 
    addSleepLog,
    addDailyNote,
    weightLogs, 
    hydrationLogs, 
    getTodayHydration,
    getTodaySleep,
    getTodayNote,
    getTodayNutrition,
    getNutritionGoals,
    profile 
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [weightInput, setWeightInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);
  const [waterRetention, setWaterRetention] = useState<WaterRetentionLevel>(3);
  const [noteText, setNoteText] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  const todayHydration = getTodayHydration();
  const todaySleep = getTodaySleep();
  const todayNote = getTodayNote();
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

  const handleLogSleep = async () => {
    if (!sleepHours) {
      Alert.alert(t.common.error, t.tracking.enterSleepHours);
      return;
    }
    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      Alert.alert(t.common.error, t.tracking.enterSleepHours);
      return;
    }

    await addSleepLog({
      date: new Date(),
      hours,
      quality: sleepQuality,
    });
    setSleepHours('');
    setSleepQuality(3);
    setShowSleepForm(false);
    Alert.alert(t.common.success, 'Spánek byl zaznamenán');
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert(t.common.error, t.tracking.enterNote);
      return;
    }

    await addDailyNote({
      date: new Date(),
      note: noteText,
      energyLevel,
      waterRetention,
    });
    setNoteText('');
    setEnergyLevel(3);
    setWaterRetention(3);
    setShowNoteForm(false);
    Alert.alert(t.common.success, 'Poznámka byla uložena');
  };

  const renderQualitySelector = (
    value: number,
    setValue: (v: any) => void,
    label: string
  ) => (
    <View style={styles.qualitySection}>
      <Text style={styles.qualityLabel}>{label}</Text>
      <View style={styles.qualityButtons}>
        {[1, 2, 3, 4, 5].map((level) => (
          <Pressable
            key={level}
            style={[
              styles.qualityButton,
              value === level && styles.qualityButtonActive
            ]}
            onPress={() => setValue(level)}
          >
            <Text style={[
              styles.qualityButtonText,
              value === level && styles.qualityButtonTextActive
            ]}>
              {level}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const sodiumProgress = (todayNutrition.sodium / nutritionGoals.sodium) * 100;
  const fiberProgress = (todayNutrition.fiber / nutritionGoals.fiber) * 100;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t.tracking.title}</Text>
            <View style={styles.headerButtons}>
              <Pressable style={styles.statsButton} onPress={() => router.push('/wellness')}>
                <Activity size={18} color={Colors.gold} />
              </Pressable>
              {(weightLogs.length > 0 || hydrationLogs.length > 0) && (
                <Pressable style={styles.statsButton} onPress={() => router.push('/tracking-detail')}>
                  <BarChart3 size={18} color={Colors.gold} />
                </Pressable>
              )}
            </View>
          </View>

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
            <View style={styles.cardHeader}>
              <Moon size={24} color="#6366F1" />
              <Text style={styles.cardTitle}>{t.tracking.sleep}</Text>
            </View>

            {todaySleep && !showSleepForm ? (
              <View style={styles.todayDataBox}>
                <View style={styles.todayDataRow}>
                  <Text style={styles.todayDataLabel}>{t.tracking.sleepHours}:</Text>
                  <Text style={styles.todayDataValue}>{todaySleep.hours}h</Text>
                </View>
                <View style={styles.todayDataRow}>
                  <Text style={styles.todayDataLabel}>{t.tracking.sleepQuality}:</Text>
                  <Text style={styles.todayDataValue}>{todaySleep.quality}/5</Text>
                </View>
                <Pressable style={styles.editButton} onPress={() => setShowSleepForm(true)}>
                  <Text style={styles.editButtonText}>Upravit</Text>
                </Pressable>
              </View>
            ) : showSleepForm ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  placeholder={t.tracking.enterSleepHours}
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                />

                {renderQualitySelector(sleepQuality, setSleepQuality, t.tracking.sleepQuality)}

                <View style={styles.formButtons}>
                  <Pressable 
                    style={styles.cancelButton} 
                    onPress={() => {
                      setShowSleepForm(false);
                      setSleepHours('');
                      setSleepQuality(3);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
                  </Pressable>
                  <Pressable style={styles.button} onPress={handleLogSleep}>
                    <Text style={styles.buttonText}>{t.tracking.save}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.addButton} onPress={() => setShowSleepForm(true)}>
                <Text style={styles.addButtonText}>{t.tracking.addNote}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={24} color="#10B981" />
              <Text style={styles.cardTitle}>{t.tracking.dailyNote}</Text>
            </View>

            {todayNote && !showNoteForm ? (
              <View style={styles.todayDataBox}>
                <Text style={styles.noteText}>{todayNote.note}</Text>
                {todayNote.energyLevel && (
                  <View style={styles.todayDataRow}>
                    <Zap size={16} color={Colors.gold} />
                    <Text style={styles.todayDataLabel}>{t.tracking.energyLevel}:</Text>
                    <Text style={styles.todayDataValue}>{todayNote.energyLevel}/5</Text>
                  </View>
                )}
                {todayNote.waterRetention && (
                  <View style={styles.todayDataRow}>
                    <AlertCircle size={16} color="#3B82F6" />
                    <Text style={styles.todayDataLabel}>{t.tracking.waterRetention}:</Text>
                    <Text style={styles.todayDataValue}>{todayNote.waterRetention}/5</Text>
                  </View>
                )}
                <Pressable style={styles.editButton} onPress={() => {
                  setShowNoteForm(true);
                  setNoteText(todayNote.note);
                  setEnergyLevel(todayNote.energyLevel || 3);
                  setWaterRetention(todayNote.waterRetention || 3);
                }}>
                  <Text style={styles.editButtonText}>Upravit</Text>
                </Pressable>
              </View>
            ) : showNoteForm ? (
              <View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder={t.tracking.enterNote}
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                />

                {renderQualitySelector(energyLevel, setEnergyLevel, t.tracking.energyLevel)}
                {renderQualitySelector(waterRetention, setWaterRetention, t.tracking.waterRetention)}

                <View style={styles.formButtons}>
                  <Pressable 
                    style={styles.cancelButton} 
                    onPress={() => {
                      setShowNoteForm(false);
                      setNoteText('');
                      setEnergyLevel(3);
                      setWaterRetention(3);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
                  </Pressable>
                  <Pressable style={styles.button} onPress={handleSaveNote}>
                    <Text style={styles.buttonText}>{t.tracking.save}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.addButton} onPress={() => setShowNoteForm(true)}>
                <Text style={styles.addButtonText}>{t.tracking.addNote}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.tracking.dailyMetrics}</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <AlertCircle size={20} color="#EF4444" />
                  <Text style={styles.metricLabel}>{t.tracking.sodium}</Text>
                </View>
                <Text style={styles.metricValue}>
                  {todayNutrition.sodium} / {nutritionGoals.sodium} {t.common.mg}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, sodiumProgress)}%`,
                    backgroundColor: sodiumProgress > 100 ? '#EF4444' : Colors.gold 
                  }]} />
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Activity size={20} color="#10B981" />
                  <Text style={styles.metricLabel}>{t.tracking.fiber}</Text>
                </View>
                <Text style={styles.metricValue}>
                  {todayNutrition.fiber.toFixed(1)} / {nutritionGoals.fiber} {t.common.g}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, fiberProgress)}%`,
                    backgroundColor: '#10B981'
                  }]} />
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
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  qualitySection: {
    marginBottom: 16,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '20',
  },
  qualityButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  qualityButtonTextActive: {
    color: Colors.gold,
  },
  todayDataBox: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  todayDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  todayDataLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  todayDataValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  noteText: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  editButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  addButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  metricsGrid: {
    gap: 16,
    marginTop: 16,
  },
  metricItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  metricValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
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
