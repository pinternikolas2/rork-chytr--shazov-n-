import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Droplets, TrendingDown, AlertTriangle, Activity, Brain as BrainIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';



export default function DashboardScreen() {
  const { 
    t, 
    profile, 
    getUpcomingFight, 
    getTodayHydration, 
    getDailyHydrationGoal,
    getSafetyStatus,
    getBodyComposition,
    getMetabolicData,
    getWeightCutPlan,
    weightLogs 
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const upcomingFight = getUpcomingFight();
  const todayHydration = getTodayHydration();
  const dailyHydrationGoal = getDailyHydrationGoal();
  const safetyStatus = getSafetyStatus();
  const bodyComposition = getBodyComposition();
  const metabolicData = getMetabolicData();
  const weightCutPlan = getWeightCutPlan();

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
    if (!profile || profile.role !== 'fighter') return 0;
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
              resizeMode="cover"
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
                  {profile && profile.role === 'fighter' ? profile.currentWeight.toFixed(1) : '0.0'} {t.common.kg}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t.dashboard.targetWeight}</Text>
                <Text style={styles.statValue}>
                  {profile && profile.role === 'fighter' ? profile.targetWeight.toFixed(1) : '0.0'} {t.common.kg}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t.dashboard.remaining}</Text>
                <Text style={[styles.statValue, styles.statValueGold]}>
                  {profile && profile.role === 'fighter' ? (profile.currentWeight - profile.targetWeight).toFixed(1) : '0.0'}{' '}
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
          <Text style={styles.progressText}>{weightProgress.toFixed(0)}% {t.dashboard.toTarget}</Text>
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

        {safetyStatus && (
          <View style={[
            styles.safetyCard,
            safetyStatus.level === 'danger' && styles.safetyCardDanger,
            safetyStatus.level === 'caution' && styles.safetyCardCaution,
          ]}>
            <View style={styles.safetyHeader}>
              <AlertTriangle 
                size={20} 
                color={safetyStatus.level === 'safe' ? Colors.gold : safetyStatus.level === 'caution' ? '#f59e0b' : '#ef4444'} 
              />
              <Text style={[
                styles.safetyTitle,
                safetyStatus.level === 'danger' && styles.safetyTitleDanger,
                safetyStatus.level === 'caution' && styles.safetyTitleCaution,
              ]}>
                {safetyStatus.level === 'safe' ? t.dashboard.safetyStatus : 
                 safetyStatus.level === 'caution' ? t.dashboard.cautionRequired : t.dashboard.dangerAction}
              </Text>
            </View>
            <Text style={styles.safetyMessage}>{safetyStatus.level === 'safe' && safetyStatus.message === 'Not enough data to assess safety' ? t.dashboard.notEnoughData : safetyStatus.message}</Text>
            <View style={styles.recommendationsList}>
              {safetyStatus.recommendations.slice(0, 3).map((rec, idx) => {
                let translatedRec = rec;
                if (rec === 'Continue logging weight daily for accurate tracking') translatedRec = t.dashboard.continueLogging;
                return <Text key={idx} style={styles.recommendationItem}>• {translatedRec}</Text>;
              })}
            </View>
          </View>
        )}

        {bodyComposition && metabolicData && (
          <View style={styles.scientificDataSection}>
            <View style={styles.dataHeader}>
              <Activity size={20} color={Colors.gold} />
              <Text style={styles.dataTitle}>{t.dashboard.bodyComposition}</Text>
            </View>
            <View style={styles.dataGrid}>
              <View style={styles.dataBox}>
                <Text style={styles.dataValue}>{bodyComposition.bodyFatPercentage}%</Text>
                <Text style={styles.dataLabel}>{t.dashboard.bodyFat}</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.dataValue}>{bodyComposition.leanMass.toFixed(1)}</Text>
                <Text style={styles.dataLabel}>{t.dashboard.leanMass}</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.dataValue}>{Math.round(metabolicData.bmr)}</Text>
                <Text style={styles.dataLabel}>{t.dashboard.bmr}</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.dataValue}>{Math.round(metabolicData.tdee)}</Text>
                <Text style={styles.dataLabel}>{t.dashboard.tdee}</Text>
              </View>
            </View>
          </View>
        )}

        {weightCutPlan.length > 0 && (
          <View style={styles.todayPlanSection}>
            <View style={styles.planHeader}>
              <BrainIcon size={20} color={Colors.gold} />
              <Text style={styles.planTitle}>{t.dashboard.todaysPlan}</Text>
            </View>
            <View style={styles.planDetails}>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>{t.dashboard.targetWeightLabel}</Text>
                <Text style={styles.planValue}>{weightCutPlan[0].targetWeight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>{t.dashboard.waterIntakeLabel}</Text>
                <Text style={styles.planValue}>{weightCutPlan[0].waterIntake} ml</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>{t.dashboard.sodiumLimitLabel}</Text>
                <Text style={styles.planValue}>{weightCutPlan[0].sodiumLimit} mg</Text>
              </View>
              <View style={styles.planRow}>
                <Text style={styles.planLabel}>{t.dashboard.calorieTargetLabel}</Text>
                <Text style={styles.planValue}>{weightCutPlan[0].calorieTarget} kcal</Text>
              </View>
            </View>
            <View style={styles.recommendationsList}>
              {weightCutPlan[0].recommendations.slice(0, 2).map((rec, idx) => {
                let translatedRec = rec;
                if (rec === 'Maintain training intensity and normal nutrition') translatedRec = t.dashboard.maintainTraining;
                if (rec === 'Focus on technique and conditioning') translatedRec = t.dashboard.focusTechnique;
                return <Text key={idx} style={styles.todayRecommendation}>• {translatedRec}</Text>;
              })}
            </View>
          </View>
        )}

        <View style={styles.aiTipSection}>
          <Text style={styles.aiTipTitle}>{t.dashboard.aiCoachInsight}</Text>
          <Text style={styles.aiTipText}>
            {t.dashboard.maintainConsistent}
          </Text>
          <Pressable style={styles.aiButton} onPress={() => router.push('/ai')}>
            <Text style={styles.aiButtonText}>{t.dashboard.askAiCoach}</Text>
          </Pressable>
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
    borderRadius: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 56,
    height: 56,
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
    marginBottom: 12,
  },
  aiButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  safetyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  safetyCardCaution: {
    borderColor: '#f59e0b',
  },
  safetyCardDanger: {
    borderColor: '#ef4444',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
    textTransform: 'uppercase' as const,
  },
  safetyTitleCaution: {
    color: '#f59e0b',
  },
  safetyTitleDanger: {
    color: '#ef4444',
  },
  safetyMessage: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  recommendationsList: {
    gap: 6,
  },
  recommendationItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  scientificDataSection: {
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
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  todayPlanSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  planDetails: {
    gap: 10,
    marginBottom: 16,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  todayRecommendation: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
});
