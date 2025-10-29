import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Droplets, TrendingDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';



export default function DashboardScreen() {
  const { t, profile, getUpcomingFight, getTodayHydration, weightLogs } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const upcomingFight = getUpcomingFight();
  const todayHydration = getTodayHydration();
  const dailyHydrationGoal = 3000;

  const daysUntilFight = useMemo(() => {
    if (!upcomingFight) return null;
    const now = new Date();
    const diff = upcomingFight.date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [upcomingFight]);

  const recentWeightLogs = useMemo(() => {
    return weightLogs.slice(-7).reverse();
  }, [weightLogs]);

  const weightProgress = useMemo(() => {
    if (!profile) return 0;
    const total = profile.currentWeight - profile.targetWeight;
    if (total <= 0) return 100;
    const current = profile.currentWeight - profile.targetWeight;
    return Math.max(0, Math.min(100, ((total - current) / total) * 100));
  }, [profile]);

  const hydrationProgress = (todayHydration / dailyHydrationGoal) * 100;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/eu9l4dsrphmttowu6m4wo' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.greeting}>{t.appName}</Text>
            {profile && <Text style={styles.userName}>{profile.fullName}</Text>}
          </View>
        </View>

        {upcomingFight ? (
          <View style={styles.fightCard}>
            <View style={styles.fightCardHeader}>
              <Text style={styles.fightCardTitle}>{upcomingFight.name}</Text>
              <View style={styles.daysContainer}>
                <Text style={styles.daysNumber}>{daysUntilFight}</Text>
                <Text style={styles.daysLabel}>{t.dashboard.daysUntilWeighIn}</Text>
              </View>
            </View>
            <View style={styles.fightCardStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t.dashboard.currentWeight}</Text>
                <Text style={styles.statValue}>
                  {profile?.currentWeight.toFixed(1)} {t.common.kg}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t.dashboard.targetWeight}</Text>
                <Text style={styles.statValue}>
                  {profile?.targetWeight.toFixed(1)} {t.common.kg}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t.dashboard.remaining}</Text>
                <Text style={[styles.statValue, styles.statValueGold]}>
                  {profile ? (profile.currentWeight - profile.targetWeight).toFixed(1) : '0.0'}{' '}
                  {t.common.kg}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noFightCard}>
            <Text style={styles.noFightText}>{t.dashboard.noFight}</Text>
            <Pressable style={styles.addFightButton} onPress={() => router.push('/fights')}>
              <Plus size={20} color={Colors.black} />
              <Text style={styles.addFightButtonText}>{t.dashboard.addFight}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <TrendingDown size={20} color={Colors.gold} />
            <Text style={styles.progressTitle}>{t.tracking.progress}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${weightProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{weightProgress.toFixed(0)}% to target</Text>
        </View>

        <View style={styles.hydrationSection}>
          <View style={styles.hydrationHeader}>
            <Droplets size={20} color={Colors.gold} />
            <Text style={styles.hydrationTitle}>{t.dashboard.hydration}</Text>
          </View>
          <View style={styles.hydrationContent}>
            <View style={styles.hydrationCircle}>
              <Text style={styles.hydrationValue}>{todayHydration}</Text>
              <Text style={styles.hydrationUnit}>{t.common.ml}</Text>
            </View>
            <View style={styles.hydrationInfo}>
              <Text style={styles.hydrationLabel}>{t.dashboard.dailyGoal}</Text>
              <Text style={styles.hydrationGoal}>
                {dailyHydrationGoal} {t.common.ml}
              </Text>
              <View style={styles.hydrationProgressBar}>
                <View
                  style={[
                    styles.hydrationProgressFill,
                    { width: `${Math.min(100, hydrationProgress)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
          <Pressable style={styles.logButton} onPress={() => router.push('/tracking')}>
            <Droplets size={18} color={Colors.black} />
            <Text style={styles.logButtonText}>{t.dashboard.logWater}</Text>
          </Pressable>
        </View>

        {recentWeightLogs.length > 0 && (
          <View style={styles.recentLogsSection}>
            <Text style={styles.sectionTitle}>{t.tracking.history}</Text>
            {recentWeightLogs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View>
                  <Text style={styles.logWeight}>
                    {log.weight.toFixed(1)} {t.common.kg}
                  </Text>
                  <Text style={styles.logTime}>
                    {log.date.toLocaleDateString()} - {t.tracking[log.time]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.aiTipSection}>
          <Text style={styles.aiTipTitle}>{t.dashboard.aiTip}</Text>
          <Text style={styles.aiTipText}>
            {daysUntilFight && daysUntilFight <= 7
              ? 'You\'re in the final week. Focus on water manipulation and sodium control. Reduce water intake by 15% today.'
              : 'Maintain consistent hydration. Drink at least 3L of water daily and monitor your sodium intake closely.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightGray,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 48,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  userName: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
  fightCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  fightCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  daysLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fightCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statValueGold: {
    color: Colors.gold,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: 8,
  },
  noFightCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noFightText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  addFightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFightButtonText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  progressSection: {
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  hydrationSection: {
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
  hydrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  hydrationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  hydrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  hydrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  hydrationValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  hydrationUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  hydrationInfo: {
    flex: 1,
  },
  hydrationLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  hydrationGoal: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  hydrationProgressBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  hydrationProgressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  logButtonText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  recentLogsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  logItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  logWeight: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  aiTipSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiTipTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  aiTipText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
