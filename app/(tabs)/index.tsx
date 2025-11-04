import { useMemo, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Droplets, TrendingDown, AlertTriangle, Activity, Brain as BrainIcon, Flame, Target, Clock, User, ChevronRight, Award, Zap, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    getWeightProgress,
    weightLogs,
    getTodayNutrition,
    getNutritionGoals,
    dangerBannerDismissed,
    dismissDangerBanner 
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const weightProgress = getWeightProgress();

  const hydrationProgress = (todayHydration / dailyHydrationGoal) * 100;

  const todayNutrition = getTodayNutrition();
  const nutritionGoals = getNutritionGoals();

  const calorieProgress = (todayNutrition.calories / nutritionGoals.calories) * 100;
  const proteinProgress = (todayNutrition.protein / nutritionGoals.protein) * 100;
  const carbsProgress = (todayNutrition.carbs / nutritionGoals.carbs) * 100;
  const fatsProgress = (todayNutrition.fat / nutritionGoals.fat) * 100;

  const recommendedWeeklyLoss = useMemo(() => {
    if (!profile || profile.role !== 'fighter' || !upcomingFight) return 0;
    const weeksUntilFight = daysUntilFight ? Math.max(1, daysUntilFight / 7) : 1;
    const totalToLose = profile.currentWeight - profile.targetWeight;
    return totalToLose / weeksUntilFight;
  }, [profile, upcomingFight, daysUntilFight]);

  const weeklyWeightChange = useMemo(() => {
    if (weightLogs.length < 2) return 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = weightLogs.filter(log => log.date >= weekAgo);
    if (recentLogs.length < 2) return 0;
    const oldest = recentLogs[0].weight;
    const newest = recentLogs[recentLogs.length - 1].weight;
    return oldest - newest;
  }, [weightLogs]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/eu9l4dsrphmttowu6m4wo' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Ahoj, {profile?.fullName?.split(' ')[0] || 'Zápasníku'}!</Text>
            <Text style={styles.subGreeting}>{t.dashboard.dailyOverview}</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={styles.profileButton}>
            <User size={20} color={Colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {safetyStatus && safetyStatus.level === 'danger' && !dangerBannerDismissed && (
          <Animated.View 
            style={[
              styles.dangerBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AlertTriangle size={20} color={Colors.white} />
            <Text style={styles.dangerBannerText}>NEBEZPEČÍ - OKAMŽITÁ AKCE VYŽADOVÁNA</Text>
            <Pressable onPress={dismissDangerBanner} style={styles.dismissButton}>
              <X size={18} color={Colors.white} />
            </Pressable>
          </Animated.View>
        )}

        {upcomingFight ? (
          <Animated.View 
            style={[
              styles.fightCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.fightCardHeader}>
              <View style={styles.fightCardTitleContainer}>
                <Text style={styles.fightCardTitle}>{upcomingFight.name}</Text>
                <Text style={styles.fightCardOpponent}>vs {upcomingFight.opponent}</Text>
              </View>
              <View style={styles.daysContainer}>
                <View style={styles.daysRow}>
                  <Clock size={18} color={Colors.gold} />
                  <Text style={styles.daysNumber}>{daysUntilFight}</Text>
                </View>
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
            <View style={styles.recommendedLossContainer}>
              <Text style={styles.recommendedLossText}>
                Doporučený pokles: {recommendedWeeklyLoss.toFixed(2)} kg/týden
              </Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.noFightCard}>
            <Text style={styles.noFightText}>{t.dashboard.noFight}</Text>
            <Pressable style={styles.addFightButton} onPress={() => router.push('/fights')}>
              <Plus size={20} color={Colors.black} />
              <Text style={styles.addFightButtonText}>{t.dashboard.addFight}</Text>
            </Pressable>
          </View>
        )}

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.weightTrendSection}>
            <View style={styles.weightTrendHeader}>
              <TrendingDown size={18} color={Colors.gold} />
              <Text style={styles.weightTrendTitle}>Trend váhy (7 dní)</Text>
            </View>
            {recentWeightLogs.length >= 2 ? (
              <>
                <View style={styles.miniChart}>
                  {recentWeightLogs.slice().reverse().map((log, i, arr) => {
                    if (i === 0) return null;
                    const maxWeight = Math.max(...arr.map(l => l.weight));
                    const minWeight = Math.min(...arr.map(l => l.weight));
                    const range = maxWeight - minWeight || 1;
                    const prevHeight = ((arr[i - 1].weight - minWeight) / range) * 60;
                    const currentHeight = ((arr[i].weight - minWeight) / range) * 60;
                    
                    return (
                      <View key={log.id} style={styles.miniChartBar}>
                        <View style={[styles.miniChartLine, { 
                          height: Math.max(4, currentHeight),
                          backgroundColor: arr[i].weight < arr[i - 1].weight ? '#10B981' : '#ef4444'
                        }]} />
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.weeklyChangeText}>
                  Průměrný pokles za týden: {weeklyWeightChange >= 0 ? weeklyWeightChange.toFixed(2) : '0.00'} kg
                </Text>
              </>
            ) : (
              <Text style={styles.noDataText}>Nedostatek dat pro zobrazení trendu</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Denní přehled makro a mikroživin</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.calorieCard]}>
              <Flame size={22} color="#FF6B35" />
              <Text style={styles.metricLabel}>Kalorie</Text>
              <Text style={styles.metricValue}>{todayNutrition.calories}</Text>
              <Text style={styles.metricGoal}>/ {nutritionGoals.calories}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min(100, calorieProgress)}%`,
                  backgroundColor: '#FF6B35'
                }]} />
              </View>
            </View>

            <View style={[styles.metricCard, styles.proteinCard]}>
              <Target size={22} color="#4ECDC4" />
              <Text style={styles.metricLabel}>Bílkoviny</Text>
              <Text style={styles.metricValue}>{todayNutrition.protein}g</Text>
              <Text style={styles.metricGoal}>/ {nutritionGoals.protein}g</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min(100, proteinProgress)}%`,
                  backgroundColor: '#4ECDC4'
                }]} />
              </View>
            </View>

            <View style={[styles.metricCard, styles.carbsCard]}>
              <Zap size={22} color="#F4C430" />
              <Text style={styles.metricLabel}>Sacharidy</Text>
              <Text style={styles.metricValue}>{todayNutrition.carbs}g</Text>
              <Text style={styles.metricGoal}>/ {nutritionGoals.carbs}g</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min(100, carbsProgress)}%`,
                  backgroundColor: '#F4C430'
                }]} />
              </View>
            </View>

            <View style={[styles.metricCard, styles.fatsCard]}>
              <Activity size={22} color="#FF8C42" />
              <Text style={styles.metricLabel}>Tuky</Text>
              <Text style={styles.metricValue}>{todayNutrition.fat}g</Text>
              <Text style={styles.metricGoal}>/ {nutritionGoals.fat}g</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min(100, fatsProgress)}%`,
                  backgroundColor: '#FF8C42'
                }]} />
              </View>
            </View>

            <View style={[styles.metricCard, styles.waterCard]}>
              <Droplets size={22} color="#3B9AE1" />
              <Text style={styles.metricLabel}>Voda</Text>
              <View style={styles.circularProgress}>
                <View style={[styles.circularProgressFill, { 
                  width: `${Math.min(100, hydrationProgress)}%`,
                }]} />
              </View>
              <Text style={styles.metricValue}>{(todayHydration / 1000).toFixed(1)}L</Text>
              <Text style={styles.metricGoal}>/ {(dailyHydrationGoal / 1000).toFixed(1)}L</Text>
            </View>

            <View style={[styles.metricCard, styles.sodiumCard]}>
              <AlertTriangle size={22} color="#EF4444" />
              <Text style={styles.metricLabel}>Sodík</Text>
              <Text style={styles.metricValue}>{todayNutrition.sodium}</Text>
              <Text style={styles.metricGoal}>/ {nutritionGoals.sodium} mg</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min(100, (todayNutrition.sodium / nutritionGoals.sodium) * 100)}%`,
                  backgroundColor: todayNutrition.sodium > nutritionGoals.sodium ? '#EF4444' : '#10B981'
                }]} />
              </View>
            </View>
          </View>

          {bodyComposition && metabolicData && (
            <View style={styles.bodyMetricsSection}>
              <Text style={styles.sectionTitle}>Složení těla a denní výdej</Text>
              <View style={styles.bodyMetricsGrid}>
                <View style={styles.bodyMetricCard}>
                  <Text style={styles.bodyMetricValue}>{bodyComposition.bodyFatPercentage}%</Text>
                  <Text style={styles.bodyMetricLabel}>Tělesný tuk</Text>
                </View>
                <View style={styles.bodyMetricCard}>
                  <Text style={styles.bodyMetricValue}>{bodyComposition.leanMass.toFixed(1)} kg</Text>
                  <Text style={styles.bodyMetricLabel}>Svalová hmota</Text>
                </View>
                <View style={styles.bodyMetricCard}>
                  <Text style={styles.bodyMetricValue}>{Math.round(metabolicData.bmr)}</Text>
                  <Text style={styles.bodyMetricLabel}>BMR (kal)</Text>
                </View>
                <View style={styles.bodyMetricCard}>
                  <Text style={styles.bodyMetricValue}>{Math.round(metabolicData.tdee)}</Text>
                  <Text style={styles.bodyMetricLabel}>TDEE (kal)</Text>
                </View>
              </View>
            </View>
          )}

          {weightCutPlan.length > 0 && (
            <View style={styles.todayPlanSection}>
              <View style={styles.planHeader}>
                <Award size={20} color={Colors.gold} />
                <Text style={styles.planTitle}>Můj plán pro dnešek</Text>
              </View>
              <View style={styles.planDetails}>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Cílová váha pro dnešek/fázi:</Text>
                  <Text style={styles.planValue}>{weightCutPlan[0].targetWeight.toFixed(1)} kg</Text>
                </View>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Příjem vody:</Text>
                  <Text style={styles.planValue}>{weightCutPlan[0].waterIntake} ml</Text>
                </View>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Limit sodíku:</Text>
                  <Text style={styles.planValue}>{weightCutPlan[0].sodiumLimit} mg</Text>
                </View>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Cílové kalorie:</Text>
                  <Text style={styles.planValue}>{weightCutPlan[0].calorieTarget} kcal</Text>
                </View>
              </View>
              <View style={styles.dynamicMessageContainer}>
                <Text style={styles.dynamicMessageText}>
                  {weightCutPlan[0].recommendations[0] || t.dashboard.maintainTraining}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.aiTipSection}>
            <Text style={styles.aiTipTitle}>{t.dashboard.aiCoachInsight}</Text>
            <Text style={styles.aiTipText}>
              {safetyStatus?.recommendations[0] || t.dashboard.maintainConsistent}
            </Text>
            <Pressable style={styles.aiButton} onPress={() => router.push('/ai')}>
              <Text style={styles.aiButtonText}>{t.dashboard.askAiCoach}</Text>
            </Pressable>
          </View>

          {recentWeightLogs.length > 0 && (
            <View style={styles.lastWeighInSection}>
              <Text style={styles.sectionTitle}>Poslední vážení</Text>
              <View style={styles.lastWeighInCard}>
                <Text style={styles.lastWeighInValue}>
                  Aktuální váha: {recentWeightLogs[0].weight.toFixed(1)} kg
                </Text>
                <Text style={styles.lastWeighInDate}>
                  {recentWeightLogs[0].date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}, {recentWeightLogs[0].date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Pressable style={styles.viewHistoryButton} onPress={() => router.push('/tracking-detail')}>
                  <Text style={styles.viewHistoryButtonText}>Zobrazit celou historii</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  gradientBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 48,
  },
  greeting: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  dangerBannerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fightCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fightCardTitleContainer: {
    flex: 1,
  },
  fightCardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fightCardOpponent: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  daysNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  daysLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fightCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontSize: 15,
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
  recommendedLossContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  recommendedLossText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  noFightCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  noFightText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  addFightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
  },
  addFightButtonText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  weightTrendSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weightTrendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  weightTrendTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 70,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  miniChartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  miniChartLine: {
    width: '100%',
    borderRadius: 3,
    minHeight: 4,
  },
  weeklyChangeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  calorieCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF6B35',
  },
  proteinCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#4ECDC4',
  },
  carbsCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#F4C430',
  },
  fatsCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF8C42',
  },
  waterCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B9AE1',
  },
  sodiumCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#EF4444',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  metricGoal: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  circularProgress: {
    width: 50,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  circularProgressFill: {
    height: '100%',
    backgroundColor: '#3B9AE1',
    borderRadius: 4,
  },
  bodyMetricsSection: {
    marginBottom: 16,
  },
  bodyMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bodyMetricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  bodyMetricValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  bodyMetricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  todayPlanSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  planDetails: {
    gap: 10,
    marginBottom: 14,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  dynamicMessageContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  dynamicMessageText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
    fontWeight: '500' as const,
  },
  aiTipSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  aiTipTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  aiTipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
    marginBottom: 12,
  },
  aiButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  lastWeighInSection: {
    marginBottom: 16,
  },
  lastWeighInCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  lastWeighInValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  lastWeighInDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewHistoryButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
