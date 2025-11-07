import { useMemo, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Droplets, TrendingDown, AlertTriangle, Activity, Flame, Target, Clock, User, ChevronRight, Award, Zap, X } from 'lucide-react-native';
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
    weightLogs,
    getTodayNutrition,
    getNutritionGoals,
    dangerBannerDismissed,
    dismissDangerBanner,
    getCurrentPhase,
    getRWLProtocol,
    getActiveREGENProtocol,
    hydrationLogs 
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

  const currentPhase = getCurrentPhase();
  const activeREGEN = getActiveREGENProtocol();

  const getTodaySodium = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return hydrationLogs
      .filter((log) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      })
      .reduce((sum, log) => sum + (log.sodiumMg || 0), 0);
  }, [hydrationLogs]);



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
  }, [fadeAnim, slideAnim]);

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

        {currentPhase && currentPhase.phase === 'RWL' && daysUntilFight && (
          <Animated.View 
            style={[
              styles.phaseCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.phaseBadge, styles.phaseBadgeRWL]}>
              <Text style={styles.phaseBadgeText}>RWL</Text>
            </View>
            <Text style={styles.phaseDescription}>{currentPhase.description}</Text>
            
            {currentPhase.phase === 'RWL' && daysUntilFight && (
              <View style={styles.rwlProtocolCard}>
                <Text style={styles.rwlTitle}>DENNÍ PROTOKOL (D-{daysUntilFight})</Text>
                {(() => {
                  const protocol = getRWLProtocol(daysUntilFight);
                  if (!protocol) return null;
                  const todayHydration = getTodayHydration();
                  const todaySodium = getTodaySodium;
                  const waterProgress = (todayHydration / protocol.waterTargetMl) * 100;
                  const sodiumProgress = (todaySodium / protocol.sodiumTargetMg) * 100;
                  
                  return (
                    <>
                      <View style={styles.rwlMetricRow}>
                        <View style={styles.rwlMetricContainer}>
                          <View style={styles.rwlMetricHeader}>
                            <Droplets size={20} color="#3B9AE1" />
                            <Text style={styles.rwlMetricLabel}>Voda</Text>
                          </View>
                          <View style={styles.rwlProgressContainer}>
                            <View style={styles.rwlProgressBar}>
                              <View style={[
                                styles.rwlProgressFill,
                                { 
                                  width: `${Math.min(100, waterProgress)}%`,
                                  backgroundColor: waterProgress >= 100 ? '#10B981' : '#3B9AE1'
                                }
                              ]} />
                            </View>
                            <Text style={styles.rwlProgressText}>
                              {(todayHydration / 1000).toFixed(1)}L / {(protocol.waterTargetMl / 1000).toFixed(1)}L
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.rwlMetricRow}>
                        <View style={styles.rwlMetricContainer}>
                          <View style={styles.rwlMetricHeader}>
                            <AlertTriangle size={20} color="#EF4444" />
                            <Text style={styles.rwlMetricLabel}>Sodík</Text>
                          </View>
                          <View style={styles.rwlProgressContainer}>
                            <View style={styles.rwlProgressBar}>
                              <View style={[
                                styles.rwlProgressFill,
                                { 
                                  width: `${Math.min(100, sodiumProgress)}%`,
                                  backgroundColor: sodiumProgress > 100 ? '#EF4444' : sodiumProgress >= 80 ? '#F59E0B' : '#10B981'
                                }
                              ]} />
                            </View>
                            <Text style={styles.rwlProgressText}>
                              {todaySodium.toFixed(0)} / {protocol.sodiumTargetMg} mg
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.rwlInstructionsContainer}>
                        <Text style={styles.rwlInstructionsTitle}>Instrukce pro dnešek:</Text>
                        {protocol.instructions.map((instruction, idx) => (
                          <View key={idx} style={styles.rwlInstructionRow}>
                            <Text style={styles.rwlInstructionBullet}>•</Text>
                            <Text style={styles.rwlInstructionText}>{instruction}</Text>
                          </View>
                        ))}
                      </View>

                      {protocol.warnings && protocol.warnings.length > 0 && (
                        <View style={styles.rwlWarningsContainer}>
                          {protocol.warnings.map((warning, idx) => (
                            <View key={idx} style={styles.rwlWarningRow}>
                              <AlertTriangle size={14} color="#EF4444" />
                              <Text style={styles.rwlWarningText}>{warning}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}

          </Animated.View>
        )}

        {currentPhase && currentPhase.phase === 'REGEN' && activeREGEN && (
          <Animated.View 
            style={[
              styles.phaseCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[
              styles.phaseBadge,
              styles.phaseBadgeREGEN,
            ]}>
              <Text style={styles.phaseBadgeText}>REGEN</Text>
            </View>
            <Text style={styles.phaseDescription}>{currentPhase.description}</Text>
            
            <View style={styles.regenProtocolCard}>
              <Text style={styles.regenTitle}>PROTOKOL OBNOVY VÝKONU</Text>
              <View style={styles.regenTasksContainer}>
                {activeREGEN.protocols.map((task, idx) => {
                  const now = new Date();
                  const weighInTime = activeREGEN.record.regenProtocolStarted || activeREGEN.record.weighInTime;
                  const minutesSinceWeighIn = Math.floor((now.getTime() - weighInTime.getTime()) / (1000 * 60));
                  const isActive = minutesSinceWeighIn >= task.timeElapsedMinutes && !task.completed;
                  const minutesRemaining = Math.max(0, task.timeElapsedMinutes - minutesSinceWeighIn);
                  const hoursRemaining = Math.floor(minutesRemaining / 60);
                  const minsRemaining = minutesRemaining % 60;
                  
                  return (
                    <View 
                      key={idx} 
                      style={[
                        styles.regenTaskCard,
                        task.completed && styles.regenTaskCompleted,
                        isActive && styles.regenTaskActive,
                      ]}
                    >
                      <View style={styles.regenTaskHeader}>
                        <View style={[
                          styles.regenTaskNumber,
                          task.completed && styles.regenTaskNumberCompleted,
                          isActive && styles.regenTaskNumberActive,
                        ]}>
                          <Text style={[
                            styles.regenTaskNumberText,
                            (task.completed || isActive) && styles.regenTaskNumberTextWhite,
                          ]}>{task.taskNumber}</Text>
                        </View>
                        <Text style={styles.regenTaskTitle}>{task.taskTitle}</Text>
                      </View>
                      
                      {isActive && !task.completed && (
                        <View style={styles.regenCountdown}>
                          <Clock size={16} color={Colors.gold} />
                          <Text style={styles.regenCountdownText}>
                            {hoursRemaining > 0 ? `Za ${hoursRemaining}h ${minsRemaining}m` : minutesRemaining > 0 ? `Za ${minsRemaining}m` : 'NYNÍ'}
                          </Text>
                        </View>
                      )}

                      <View style={styles.regenTaskTargets}>
                        <View style={styles.regenTargetItem}>
                          <Droplets size={16} color="#3B9AE1" />
                          <Text style={styles.regenTargetText}>{task.fluidTargetMl}ml</Text>
                        </View>
                        <View style={styles.regenTargetItem}>
                          <Zap size={16} color="#F4C430" />
                          <Text style={styles.regenTargetText}>{task.carbsTargetG}g sacharidů</Text>
                        </View>
                        {task.proteinTargetG && (
                          <View style={styles.regenTargetItem}>
                            <Target size={16} color="#4ECDC4" />
                            <Text style={styles.regenTargetText}>{task.proteinTargetG}g bílkovin</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.regenInstructionsList}>
                        {task.instructions.slice(0, 2).map((instruction, i) => (
                          <Text key={i} style={styles.regenInstructionText}>• {instruction}</Text>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

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
                {currentPhase && (
                  <View style={[
                    styles.fightPhaseBadge,
                    currentPhase.phase === 'GWL' && styles.fightPhaseBadgeGWL,
                    currentPhase.phase === 'RWL' && styles.fightPhaseBadgeRWL,
                    currentPhase.phase === 'REGEN' && styles.fightPhaseBadgeREGEN,
                  ]}>
                    <Text style={styles.fightPhaseBadgeText}>{currentPhase.phase}</Text>
                  </View>
                )}
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
                <View style={styles.miniChartContainer}>
                  <View style={styles.miniChart}>
                    {recentWeightLogs.slice().reverse().map((log, i, arr) => {
                      const maxWeight = Math.max(...arr.map(l => l.weight));
                      const minWeight = Math.min(...arr.map(l => l.weight));
                      const range = maxWeight - minWeight || 1;
                      
                      const points = arr.map((l, idx) => {
                        const x = (idx / (arr.length - 1)) * 100;
                        const y = 100 - ((l.weight - minWeight) / range) * 100;
                        return { x, y, weight: l.weight };
                      });
                      
                      if (i === 0) return null;
                      const prevPoint = points[i - 1];
                      const currentPoint = points[i];
                      
                      const xDiff = currentPoint.x - prevPoint.x;
                      const yDiff = currentPoint.y - prevPoint.y;
                      const length = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
                      const angle = Math.atan2(yDiff, xDiff) * (180 / Math.PI);
                      
                      return (
                        <View key={log.id}>
                          <View
                            style={[
                              styles.miniChartLine,
                              {
                                position: 'absolute' as const,
                                left: `${prevPoint.x}%`,
                                top: `${prevPoint.y}%`,
                                width: `${length}%`,
                                transform: [{ rotate: `${angle}deg` }],
                              },
                            ]}
                          />
                        </View>
                      );
                    })}
                    {recentWeightLogs.slice().reverse().map((log, i, arr) => {
                      const maxWeight = Math.max(...arr.map(l => l.weight));
                      const minWeight = Math.min(...arr.map(l => l.weight));
                      const range = maxWeight - minWeight || 1;
                      const x = (i / (arr.length - 1)) * 100;
                      const y = 100 - ((log.weight - minWeight) / range) * 100;
                      
                      return (
                        <View
                          key={`dot-${log.id}`}
                          style={[
                            styles.miniChartDot,
                            {
                              left: `${x}%`,
                              top: `${y}%`,
                            },
                          ]}
                        >
                          <View style={styles.miniChartDotInner} />
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.miniChartLabels}>
                    {recentWeightLogs.slice().reverse().slice(0, 7).map((log, i) => (
                      <Text key={`label-${log.id}`} style={styles.miniChartLabel}>
                        {log.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                      </Text>
                    ))}
                  </View>
                </View>
                <View style={styles.weeklyChangeContainer}>
                  <View style={styles.weeklyChangeRow}>
                    <Text style={styles.weeklyChangeLabel}>Průměrný pokles za týden:</Text>
                    <Text style={[styles.weeklyChangeValue, weeklyWeightChange >= 0 && styles.weeklyChangeValuePositive]}>
                      {weeklyWeightChange >= 0 ? weeklyWeightChange.toFixed(2) : '0.00'} kg
                    </Text>
                  </View>
                </View>
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
  miniChartContainer: {
    marginBottom: 12,
  },
  miniChart: {
    position: 'relative' as const,
    width: '100%',
    height: 120,
    marginBottom: 8,
  },
  miniChartLine: {
    height: 3,
    backgroundColor: Colors.gold,
    transformOrigin: 'left center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  miniChartDot: {
    position: 'absolute' as const,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.gold,
    marginLeft: -5,
    marginTop: -5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniChartDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  miniChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  miniChartLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  weeklyChangeContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
  },
  weeklyChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyChangeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  weeklyChangeValue: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '700' as const,
  },
  weeklyChangeValuePositive: {
    color: Colors.gold,
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
  phaseCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  phaseBadgeGWL: {
    backgroundColor: '#10B981',
  },
  phaseBadgeRWL: {
    backgroundColor: '#F59E0B',
  },
  phaseBadgeREGEN: {
    backgroundColor: '#3B82F6',
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'uppercase' as const,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 16,
  },
  fightPhaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  fightPhaseBadgeGWL: {
    backgroundColor: '#10B981',
  },
  fightPhaseBadgeRWL: {
    backgroundColor: '#F59E0B',
  },
  fightPhaseBadgeREGEN: {
    backgroundColor: '#3B82F6',
  },
  fightPhaseBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'uppercase' as const,
  },
  rwlProtocolCard: {
    marginTop: 4,
  },
  rwlTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  rwlMetricRow: {
    marginBottom: 16,
  },
  rwlMetricContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  rwlMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rwlMetricLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rwlProgressContainer: {
    gap: 6,
  },
  rwlProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rwlProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  rwlProgressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  rwlInstructionsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rwlInstructionsTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#166534',
    marginBottom: 10,
  },
  rwlInstructionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 8,
  },
  rwlInstructionBullet: {
    fontSize: 14,
    color: '#16A34A',
    marginRight: 8,
    fontWeight: '700' as const,
  },
  rwlInstructionText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  rwlWarningsContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  rwlWarningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rwlWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  regenProtocolCard: {
    marginTop: 4,
  },
  regenTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  regenTasksContainer: {
    gap: 12,
  },
  regenTaskCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  regenTaskCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    opacity: 0.7,
  },
  regenTaskActive: {
    backgroundColor: '#FEF3C7',
    borderColor: Colors.gold,
  },
  regenTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  regenTaskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenTaskNumberCompleted: {
    backgroundColor: '#10B981',
  },
  regenTaskNumberActive: {
    backgroundColor: Colors.gold,
  },
  regenTaskNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  regenTaskNumberTextWhite: {
    color: Colors.white,
  },
  regenTaskTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  regenCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  regenCountdownText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  regenTaskTargets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  regenTargetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  regenTargetText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  regenInstructionsList: {
    gap: 4,
  },
  regenInstructionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
