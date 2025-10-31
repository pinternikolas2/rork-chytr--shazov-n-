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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Scale, Droplets, Calendar, BarChart3, TrendingDown, Activity } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function TrackingScreen() {
  const { t, addWeightLog, addHydrationLog, weightLogs, hydrationLogs, getTodayHydration, profile } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [weightInput, setWeightInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');

  const todayHydration = getTodayHydration();

  const handleLogWeight = async () => {
    if (!weightInput) return;
    const weight = parseFloat(weightInput);
    if (isNaN(weight)) return;
    
    await addWeightLog(weight, selectedTime);
    setWeightInput('');
  };

  const handleLogWater = async () => {
    if (!waterInput) return;
    const amount = parseInt(waterInput, 10);
    if (isNaN(amount)) return;
    
    await addHydrationLog(amount);
    setWaterInput('');
  };

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
  statsButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
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
