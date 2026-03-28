import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Battery, Moon, Smile, Activity, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import type { EnergyLevel, MoodLevel, SleepQuality } from '@/constants/types';
import { useRouter } from 'expo-router';

export default function WellnessScreen() {
  const { t, addRegenerationLog, getTodayRegeneration, regenerationLogs } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const todayRegeneration = getTodayRegeneration();
  
  const [showForm, setShowForm] = useState(!todayRegeneration);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(todayRegeneration?.energyLevel || 3);
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(todayRegeneration?.moodLevel || 3);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(todayRegeneration?.sleepQuality || 3);
  const [sleepHours, setSleepHours] = useState<number>(todayRegeneration?.sleepHours || 7);
  const [muscleSoreness, setMuscleSoreness] = useState<1 | 2 | 3 | 4 | 5>(todayRegeneration?.muscleSoreness || 2);
  const [stress, setStress] = useState<1 | 2 | 3 | 4 | 5>(todayRegeneration?.stress || 2);

  const handleSave = async () => {
    try {
      await addRegenerationLog({
        date: new Date(),
        energyLevel,
        moodLevel,
        sleepQuality,
        sleepHours,
        muscleSoreness,
        stress,
      });
      setShowForm(false);
      Alert.alert(t.common.success, t.nutrition.regenerationSaved);
    } catch (error) {
      console.error('Error saving regeneration log:', error);
      Alert.alert(t.common.error, t.tracking.failedToSave);
    }
  };

  const recentLogs = regenerationLogs.slice(-7).reverse();

  const avgEnergy = recentLogs.length > 0 
    ? recentLogs.reduce((sum, log) => sum + log.energyLevel, 0) / recentLogs.length 
    : 0;
  const avgMood = recentLogs.length > 0 
    ? recentLogs.reduce((sum, log) => sum + log.moodLevel, 0) / recentLogs.length 
    : 0;
  const avgSleep = recentLogs.length > 0 
    ? recentLogs.reduce((sum, log) => sum + log.sleepQuality, 0) / recentLogs.length 
    : 0;

  const renderRatingSelector = (
    value: number,
    setValue: (v: any) => void,
    icon: any,
    label: string,
    color: string
  ) => {
    const Icon = icon;
    return (
      <View style={styles.ratingSection}>
        <View style={styles.ratingHeader}>
          <Icon size={20} color={color} />
          <Text style={styles.ratingLabel}>{label}</Text>
        </View>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Pressable
              key={level}
              style={[
                styles.ratingButton,
                value === level && { ...styles.ratingButtonActive, backgroundColor: color + '20', borderColor: color }
              ]}
              onPress={() => setValue(level)}
            >
              <Text style={[
                styles.ratingButtonText,
                value === level && { color: color }
              ]}>
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.nutrition.regenerationAndWellness}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Battery size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{avgEnergy.toFixed(1)}/5</Text>
            <Text style={styles.statLabel}>{t.nutrition.averageEnergy}</Text>
          </View>
          <View style={styles.statCard}>
            <Smile size={24} color="#10B981" />
            <Text style={styles.statValue}>{avgMood.toFixed(1)}/5</Text>
            <Text style={styles.statLabel}>{t.nutrition.averageMood}</Text>
          </View>
          <View style={styles.statCard}>
            <Moon size={24} color="#6366F1" />
            <Text style={styles.statValue}>{avgSleep.toFixed(1)}/5</Text>
            <Text style={styles.statLabel}>{t.nutrition.sleepQualityAvg}</Text>
          </View>
        </View>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{t.nutrition.todaysRecord}</Text>
            
            {renderRatingSelector(energyLevel, setEnergyLevel, Battery, t.tracking.energyLevel, Colors.gold)}
            {renderRatingSelector(moodLevel, setMoodLevel, Smile, t.nutrition.mood, '#10B981')}
            {renderRatingSelector(sleepQuality, setSleepQuality, Moon, t.tracking.sleepQuality, '#6366F1')}
            {renderRatingSelector(muscleSoreness, setMuscleSoreness, Activity, t.nutrition.muscleSoreness, '#F59E0B')}
            {renderRatingSelector(stress, setStress, Heart, t.nutrition.stressLevel, '#ef4444')}

            <View style={styles.sleepHoursSection}>
              <Text style={styles.sleepHoursLabel}>{t.nutrition.hoursOfSleepShort}: {sleepHours}h</Text>
              <View style={styles.sleepHoursButtons}>
                {[5, 6, 7, 8, 9, 10].map((hours) => (
                  <Pressable
                    key={hours}
                    style={[
                      styles.sleepHourButton,
                      sleepHours === hours && styles.sleepHourButtonActive
                    ]}
                    onPress={() => setSleepHours(hours)}
                  >
                    <Text style={[
                      styles.sleepHourButtonText,
                      sleepHours === hours && styles.sleepHourButtonTextActive
                    ]}>
                      {hours}h
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t.common.save}</Text>
              </Pressable>
            </View>
          </View>
        ) : todayRegeneration ? (
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>{t.nutrition.todaysRecord}</Text>
              <Pressable onPress={() => setShowForm(true)}>
                <Text style={styles.editText}>{t.nutrition.edit}</Text>
              </Pressable>
            </View>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <Battery size={18} color={Colors.gold} />
                <Text style={styles.todayStatLabel}>{t.tracking.energy}</Text>
                <Text style={styles.todayStatValue}>{todayRegeneration.energyLevel}/5</Text>
              </View>
              <View style={styles.todayStat}>
                <Smile size={18} color="#10B981" />
                <Text style={styles.todayStatLabel}>{t.nutrition.mood}</Text>
                <Text style={styles.todayStatValue}>{todayRegeneration.moodLevel}/5</Text>
              </View>
              <View style={styles.todayStat}>
                <Moon size={18} color="#6366F1" />
                <Text style={styles.todayStatLabel}>{t.tracking.sleep}</Text>
                <Text style={styles.todayStatValue}>{todayRegeneration.sleepQuality}/5</Text>
              </View>
            </View>
          </View>
        ) : null}

        {recentLogs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>{t.nutrition.recentRecords}</Text>
            {recentLogs.map((log) => (
              <View key={log.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>
                  {log.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                </Text>
                <View style={styles.historyStats}>
                  <View style={styles.historyStatSmall}>
                    <Battery size={14} color={Colors.gold} />
                    <Text style={styles.historyStatText}>{log.energyLevel}</Text>
                  </View>
                  <View style={styles.historyStatSmall}>
                    <Smile size={14} color="#10B981" />
                    <Text style={styles.historyStatText}>{log.moodLevel}</Text>
                  </View>
                  <View style={styles.historyStatSmall}>
                    <Moon size={14} color="#6366F1" />
                    <Text style={styles.historyStatText}>{log.sleepQuality}</Text>
                  </View>
                  <View style={styles.historyStatSmall}>
                    <Text style={styles.historyStatText}>{log.sleepHours}h</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingButtonActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  sleepHoursSection: {
    marginBottom: 20,
  },
  sleepHoursLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sleepHoursButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sleepHourButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sleepHourButtonActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  sleepHourButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sleepHourButtonTextActive: {
    color: Colors.gold,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  todayCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  todayStats: {
    flexDirection: 'row',
    gap: 16,
  },
  todayStat: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
  },
  todayStatValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  historyStatSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
});
