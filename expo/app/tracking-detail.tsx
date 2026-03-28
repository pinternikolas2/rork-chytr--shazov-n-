import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, TrendingDown, TrendingUp, Droplets, Calendar, Activity, Target, Zap, Lock, Crown, BarChart3, PieChart, LineChart } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const { width: screenWidth } = Dimensions.get('window');

type TimeRange = '7d' | '30d' | '3m';

export default function TrackingDetailScreen() {
  const { t, weightLogs, hydrationLogs, profile, getUpcomingFight, trainingLogs, mealLogs, getTodayNutrition, getNutritionGoals } = useApp();
  const { isPremium, isTrial, hasAccessToFeature } = useSubscription();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [selectedTab, setSelectedTab] = useState<'weight' | 'hydration' | 'nutrition' | 'training'>('weight');

  const upcomingFight = getUpcomingFight();

  const handlePremiumFeature = () => {
    Alert.alert(
      'Premium Funkce',
      'Tato funkce je dostupná pouze v Premium verzi. Získejte plný přístup ke všem pokročilým statistikám a analytice.',
      [
        { text: 'Zrušit', style: 'cancel' },
        { text: 'Zobrazit Premium', onPress: () => router.push('/subscription') }
      ]
    );
  };

  const getRangeDays = (range: TimeRange) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '3m': return 90;
    }
  };

  const filteredWeightLogs = useMemo(() => {
    const days = getRangeDays(selectedRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return weightLogs.filter(log => log.date >= cutoffDate).reverse();
  }, [weightLogs, selectedRange]);

  const filteredHydrationLogs = useMemo(() => {
    const days = getRangeDays(selectedRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return hydrationLogs.filter(log => log.date >= cutoffDate);
  }, [hydrationLogs, selectedRange]);

  const hydrationStats = useMemo(() => {
    const dailyTotals = new Map<string, number>();
    filteredHydrationLogs.forEach(log => {
      const dateKey = log.date.toDateString();
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + log.amount);
    });

    const values = Array.from(dailyTotals.values());
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;

    return { avg, max, min, dailyTotals };
  }, [filteredHydrationLogs]);

  const weightStats = useMemo(() => {
    if (filteredWeightLogs.length === 0) return null;
    
    const weights = filteredWeightLogs.map(l => l.weight);
    const max = Math.max(...weights);
    const min = Math.min(...weights);
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
    const latest = filteredWeightLogs[0].weight;
    const oldest = filteredWeightLogs[filteredWeightLogs.length - 1].weight;
    const change = latest - oldest;
    
    const weeklyAvg = filteredWeightLogs.length >= 7 
      ? filteredWeightLogs.slice(0, 7).reduce((sum, l) => sum + l.weight, 0) / Math.min(7, filteredWeightLogs.length)
      : avg;
    
    const trend = filteredWeightLogs.length >= 3
      ? (filteredWeightLogs[0].weight - filteredWeightLogs[Math.min(2, filteredWeightLogs.length - 1)].weight) / Math.min(3, filteredWeightLogs.length)
      : 0;
    
    return { max, min, avg, latest, oldest, change, weeklyAvg, trend };
  }, [filteredWeightLogs]);

  const todayNutrition = getTodayNutrition();
  const nutritionGoals = getNutritionGoals();

  const trainingStats = useMemo(() => {
    const days = getRangeDays(selectedRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filtered = trainingLogs.filter(log => log.date >= cutoffDate);
    
    const totalDuration = filtered.reduce((sum, log) => sum + log.duration, 0);
    const totalCalories = filtered.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
    const avgDuration = filtered.length > 0 ? totalDuration / filtered.length : 0;
    const avgCalories = filtered.length > 0 ? totalCalories / filtered.length : 0;
    
    return { totalDuration, totalCalories, avgDuration, avgCalories, count: filtered.length };
  }, [trainingLogs, selectedRange]);

  const nutritionStats = useMemo(() => {
    const days = getRangeDays(selectedRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filtered = mealLogs.filter(log => log.date >= cutoffDate);
    
    const totalCalories = filtered.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = filtered.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = filtered.reduce((sum, log) => sum + log.carbs, 0);
    const totalFat = filtered.reduce((sum, log) => sum + log.fat, 0);
    
    const avgCalories = filtered.length > 0 ? totalCalories / filtered.length : 0;
    const avgProtein = filtered.length > 0 ? totalProtein / filtered.length : 0;
    const avgCarbs = filtered.length > 0 ? totalCarbs / filtered.length : 0;
    const avgFat = filtered.length > 0 ? totalFat / filtered.length : 0;
    
    return { totalCalories, totalProtein, totalCarbs, totalFat, avgCalories, avgProtein, avgCarbs, avgFat, count: filtered.length };
  }, [mealLogs, selectedRange]);

  const renderWeightChart = () => {
    if (filteredWeightLogs.length < 2) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Nedostatek dat pro graf</Text>
        </View>
      );
    }

    const chartWidth = screenWidth - 80;
    const chartHeight = 200;
    const padding = 30;
    const plotWidth = chartWidth - padding * 2;
    const plotHeight = chartHeight - padding * 2;

    const weights = filteredWeightLogs.map(l => l.weight).reverse();
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const weightRange = maxWeight - minWeight;

    const points = weights.map((weight, i) => {
      const x = padding + (i / Math.max(1, weights.length - 1)) * plotWidth;
      const y = padding + plotHeight - ((weight - minWeight) / weightRange) * plotHeight;
      return { x, y, weight };
    });

    const targetWeight = profile && profile.role === 'fighter' ? profile.targetWeight : null;
    let targetY = null;
    if (targetWeight && targetWeight >= minWeight && targetWeight <= maxWeight) {
      targetY = padding + plotHeight - ((targetWeight - minWeight) / weightRange) * plotHeight;
    }

    return (
      <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
        <View style={styles.chartGradientBg} />
        
        {targetY && (
          <View style={[styles.targetLine, { top: targetY }]}>
            <View style={styles.targetLineDash} />
            <View style={styles.targetLabelContainer}>
              <Text style={styles.targetLabel}>Cíl: {targetWeight?.toFixed(1)} kg</Text>
            </View>
          </View>
        )}
        
        {points.map((point, i) => {
          if (i === 0) return null;
          const prevPoint = points[i - 1];
          const xDiff = point.x - prevPoint.x;
          const yDiff = point.y - prevPoint.y;
          const length = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
          const angle = Math.atan2(yDiff, xDiff) * 180 / Math.PI;
          
          return (
            <View
              key={i}
              style={[
                styles.chartLine,
                {
                  left: prevPoint.x,
                  top: prevPoint.y,
                  width: length,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center',
                },
              ]}
            />
          );
        })}

        {points.map((point, i) => (
          <View key={i} style={[styles.chartDot, { left: point.x - 5, top: point.y - 5 }]}>
            <View style={styles.chartDotInner} />
          </View>
        ))}

        <View style={[styles.yAxisLabel, { top: padding - 12, left: -5 }]}>
          <Text style={styles.axisText}>{maxWeight.toFixed(1)} kg</Text>
        </View>
        <View style={[styles.yAxisLabel, { top: chartHeight - padding + 2, left: -5 }]}>
          <Text style={styles.axisText}>{minWeight.toFixed(1)} kg</Text>
        </View>
      </View>
    );
  };

  const renderHydrationChart = () => {
    if (hydrationStats.dailyTotals.size === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Nedostatek dat pro graf</Text>
          <Text style={styles.emptySubtext}>Začněte zaznamenávat hydrataci každý den</Text>
        </View>
      );
    }

    const chartWidth = screenWidth - 80;
    const chartHeight = 220;
    const days = Array.from(hydrationStats.dailyTotals.entries()).slice(-7);
    const barWidth = Math.max(35, (chartWidth - 60) / Math.max(days.length, 1));
    const maxAmount = Math.max(hydrationStats.max, 1000);
    const minHeight = 15;
    const maxBarHeight = chartHeight - 90;

    return (
      <View style={[styles.barChart, { width: chartWidth, height: chartHeight }]}>
        {days.length > 0 ? (
          days.map(([date, amount], i) => {
            const barHeight = Math.max(minHeight, (amount / maxAmount) * maxBarHeight);
            const dateObj = new Date(date);
            const dayLabel = dateObj.toLocaleDateString('cs-CZ', { weekday: 'short' });
            const percentage = (amount / maxAmount) * 100;
            
            return (
              <View key={i} style={[styles.barContainer, { width: barWidth }]}>
                <Text style={styles.barValue}>
                  {amount >= 1000 ? `${(amount / 1000).toFixed(1)}L` : `${amount}ml`}
                </Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { height: barHeight }]}>
                    <View style={[styles.barGradient, { opacity: Math.min(1, percentage / 100) }]} />
                  </View>
                </View>
                <Text style={styles.barLabel}>{dayLabel}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>Nedostatek dat</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Detailní Statistiky</Text>
        {(isPremium || isTrial) && (
          <View style={styles.premiumBadge}>
            <Crown size={14} color={Colors.gold} />
          </View>
        )}
        {!isPremium && !isTrial && (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabSelector}>
          <Pressable
            style={[styles.tab, selectedTab === 'weight' && styles.tabActive]}
            onPress={() => setSelectedTab('weight')}
          >
            <Activity size={16} color={selectedTab === 'weight' ? Colors.gold : Colors.textSecondary} />
            <Text style={[styles.tabText, selectedTab === 'weight' && styles.tabTextActive]}>Váha</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'hydration' && styles.tabActive]}
            onPress={() => setSelectedTab('hydration')}
          >
            <Droplets size={16} color={selectedTab === 'hydration' ? Colors.gold : Colors.textSecondary} />
            <Text style={[styles.tabText, selectedTab === 'hydration' && styles.tabTextActive]}>Hydratace</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'nutrition' && styles.tabActive]}
            onPress={() => {
              if (hasAccessToFeature('advanced_analytics')) {
                setSelectedTab('nutrition');
              } else {
                handlePremiumFeature();
              }
            }}
          >
            <Target size={16} color={selectedTab === 'nutrition' ? Colors.gold : Colors.textSecondary} />
            <Text style={[styles.tabText, selectedTab === 'nutrition' && styles.tabTextActive]}>Výživa</Text>
            {!hasAccessToFeature('advanced_analytics') && <Lock size={12} color={Colors.textLight} />}
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'training' && styles.tabActive]}
            onPress={() => {
              if (hasAccessToFeature('advanced_analytics')) {
                setSelectedTab('training');
              } else {
                handlePremiumFeature();
              }
            }}
          >
            <Zap size={16} color={selectedTab === 'training' ? Colors.gold : Colors.textSecondary} />
            <Text style={[styles.tabText, selectedTab === 'training' && styles.tabTextActive]}>Trénink</Text>
            {!hasAccessToFeature('advanced_analytics') && <Lock size={12} color={Colors.textLight} />}
          </Pressable>
        </View>

        <View style={styles.rangeSelector}>
          <Pressable
            style={[styles.rangeButton, selectedRange === '7d' && styles.rangeButtonActive]}
            onPress={() => setSelectedRange('7d')}
          >
            <Text style={[styles.rangeButtonText, selectedRange === '7d' && styles.rangeButtonTextActive]}>
              7 dní
            </Text>
          </Pressable>
          <Pressable
            style={[styles.rangeButton, selectedRange === '30d' && styles.rangeButtonActive]}
            onPress={() => setSelectedRange('30d')}
          >
            <Text style={[styles.rangeButtonText, selectedRange === '30d' && styles.rangeButtonTextActive]}>
              30 dní
            </Text>
          </Pressable>
          <Pressable
            style={[styles.rangeButton, selectedRange === '3m' && styles.rangeButtonActive]}
            onPress={() => setSelectedRange('3m')}
          >
            <Text style={[styles.rangeButtonText, selectedRange === '3m' && styles.rangeButtonTextActive]}>
              3 měsíce
            </Text>
          </Pressable>
        </View>

        {selectedTab === 'weight' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={24} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Vývoj Váhy</Text>
          </View>

          {weightStats && (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{weightStats.latest.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Aktuální</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, weightStats.change < 0 ? styles.statValueGood : styles.statValueBad]}>
                    {weightStats.change > 0 ? '+' : ''}{weightStats.change.toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>Změna</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{weightStats.avg.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Průměr</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{(weightStats.max - weightStats.min).toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rozpětí</Text>
                </View>
              </View>

              <View style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <Zap size={20} color={weightStats.trend < 0 ? Colors.gold : '#ef4444'} />
                  <Text style={styles.trendTitle}>Týdenní analýza</Text>
                </View>
                <View style={styles.trendGrid}>
                  <View style={styles.trendItem}>
                    <Text style={styles.trendLabel}>Týdenní průměr</Text>
                    <Text style={styles.trendValue}>{weightStats.weeklyAvg.toFixed(1)} kg</Text>
                  </View>
                  <View style={styles.trendItem}>
                    <Text style={styles.trendLabel}>Trend</Text>
                    <View style={styles.trendValueRow}>
                      {weightStats.trend < 0 ? (
                        <TrendingDown size={16} color={Colors.gold} />
                      ) : weightStats.trend > 0 ? (
                        <TrendingUp size={16} color="#ef4444" />
                      ) : null}
                      <Text style={[styles.trendValue, weightStats.trend < 0 ? styles.trendValueGood : styles.trendValueBad]}>
                        {Math.abs(weightStats.trend).toFixed(2)} kg/den
                      </Text>
                    </View>
                  </View>
                </View>
                {profile && profile.role === 'fighter' && upcomingFight && (
                  <View style={styles.predictionBox}>
                    <Target size={16} color={Colors.textSecondary} />
                    <Text style={styles.predictionText}>
                      {(() => {
                        const daysUntil = Math.ceil((upcomingFight.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const predictedWeight = weightStats.latest + (weightStats.trend * daysUntil);
                        const diff = predictedWeight - profile.targetWeight;
                        if (diff > 0.5) {
                          return `Při současném trendu budete mít ${diff.toFixed(1)} kg nad cílem`;
                        } else if (diff < -0.5) {
                          return `Při současném trendu dosáhnete cíle a budete mít ${Math.abs(diff).toFixed(1)} kg rezervu`;
                        } else {
                          return 'Při současném trendu dosáhnete přesně cílové váhy!';
                        }
                      })()}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={styles.chartContainer}>
            {renderWeightChart()}
          </View>

          {upcomingFight && profile && profile.role === 'fighter' && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Calendar size={18} color={Colors.gold} />
                <Text style={styles.progressTitle}>Do zápasu zbývá</Text>
              </View>
              <View style={styles.progressContent}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Zbývá shodit:</Text>
                  <Text style={[styles.progressValue, styles.progressValueLarge]}>
                    {(profile.currentWeight - profile.targetWeight).toFixed(1)} kg
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Průměr na den:</Text>
                  <Text style={styles.progressValue}>
                    {(() => {
                      const daysUntil = Math.ceil((upcomingFight.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const remaining = profile.currentWeight - profile.targetWeight;
                      const perDay = daysUntil > 0 ? remaining / daysUntil : 0;
                      return perDay.toFixed(2);
                    })()} kg/den
                  </Text>
                </View>
              </View>
            </View>
          )}

          {filteredWeightLogs.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Historie Měření</Text>
              <View style={styles.historyList}>
                {filteredWeightLogs.slice(0, 20).map((log) => {
                  const prevLog = weightLogs[weightLogs.indexOf(log) - 1];
                  const diff = prevLog ? log.weight - prevLog.weight : null;
                  
                  return (
                    <View key={log.id} style={styles.historyItem}>
                      <View style={styles.historyLeft}>
                        <Text style={styles.historyWeight}>
                          {log.weight.toFixed(1)} kg
                        </Text>
                        <Text style={styles.historyDate}>
                          {log.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} • {t.tracking[log.time]}
                        </Text>
                      </View>
                      {diff !== null && (
                        <View style={[styles.diffBadge, diff < 0 ? styles.diffBadgeGood : styles.diffBadgeBad]}>
                          {diff < 0 ? <TrendingDown size={14} color={Colors.gold} /> : <TrendingUp size={14} color="#ef4444" />}
                          <Text style={[styles.diffText, diff < 0 ? styles.diffTextGood : styles.diffTextBad]}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
        )}

        {selectedTab === 'hydration' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Droplets size={24} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Hydratace</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(hydrationStats.avg / 1000)}</Text>
              <Text style={styles.statLabel}>Průměr (L/den)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(hydrationStats.max / 1000)}</Text>
              <Text style={styles.statLabel}>Max (L/den)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(hydrationStats.min / 1000)}</Text>
              <Text style={styles.statLabel}>Min (L/den)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{hydrationStats.dailyTotals.size}</Text>
              <Text style={styles.statLabel}>Dní dat</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {renderHydrationChart()}
          </View>
        </View>
        )}

        {selectedTab === 'nutrition' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Výživová Statistika</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(nutritionStats.avgCalories)}</Text>
              <Text style={styles.statLabel}>Průměr kcal/den</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(nutritionStats.avgProtein)}g</Text>
              <Text style={styles.statLabel}>Průměr bílkovin</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(nutritionStats.avgCarbs)}g</Text>
              <Text style={styles.statLabel}>Průměr sacharidů</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(nutritionStats.avgFat)}g</Text>
              <Text style={styles.statLabel}>Průměr tuků</Text>
            </View>
          </View>

          <View style={styles.nutritionProgress}>
            <Text style={styles.progressTitle}>Dnešní pokrok</Text>
            <View style={styles.macroBar}>
              <Text style={styles.macroLabel}>Kalorie</Text>
              <View style={styles.macroProgressBar}>
                <View style={[styles.macroProgressFill, { 
                  width: `${Math.min(100, (todayNutrition.calories / nutritionGoals.calories) * 100)}%`,
                  backgroundColor: '#FF6B35'
                }]} />
              </View>
              <Text style={styles.macroValue}>{todayNutrition.calories}/{nutritionGoals.calories}</Text>
            </View>
            <View style={styles.macroBar}>
              <Text style={styles.macroLabel}>Bílkoviny</Text>
              <View style={styles.macroProgressBar}>
                <View style={[styles.macroProgressFill, { 
                  width: `${Math.min(100, (todayNutrition.protein / nutritionGoals.protein) * 100)}%`,
                  backgroundColor: '#4ECDC4'
                }]} />
              </View>
              <Text style={styles.macroValue}>{todayNutrition.protein}g/{nutritionGoals.protein}g</Text>
            </View>
            <View style={styles.macroBar}>
              <Text style={styles.macroLabel}>Sacharidy</Text>
              <View style={styles.macroProgressBar}>
                <View style={[styles.macroProgressFill, { 
                  width: `${Math.min(100, (todayNutrition.carbs / nutritionGoals.carbs) * 100)}%`,
                  backgroundColor: '#F4C430'
                }]} />
              </View>
              <Text style={styles.macroValue}>{todayNutrition.carbs}g/{nutritionGoals.carbs}g</Text>
            </View>
            <View style={styles.macroBar}>
              <Text style={styles.macroLabel}>Tuky</Text>
              <View style={styles.macroProgressBar}>
                <View style={[styles.macroProgressFill, { 
                  width: `${Math.min(100, (todayNutrition.fat / nutritionGoals.fat) * 100)}%`,
                  backgroundColor: '#FF8C42'
                }]} />
              </View>
              <Text style={styles.macroValue}>{todayNutrition.fat}g/{nutritionGoals.fat}g</Text>
            </View>
          </View>

          {nutritionStats.totalCalories > 0 && (
          <View style={styles.insightCard}>
            <PieChart size={20} color={Colors.gold} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Makro rozložení</Text>
              <Text style={styles.insightText}>
                Protein: {Math.round((nutritionStats.totalProtein * 4 / nutritionStats.totalCalories) * 100)}% • 
                Sacharidy: {Math.round((nutritionStats.totalCarbs * 4 / nutritionStats.totalCalories) * 100)}% • 
                Tuky: {Math.round((nutritionStats.totalFat * 9 / nutritionStats.totalCalories) * 100)}%
              </Text>
            </View>
          </View>
          )}
        </View>
        )}

        {selectedTab === 'training' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={24} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Tréninková Statistika</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trainingStats.count}</Text>
              <Text style={styles.statLabel}>Celkem tréninků</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(trainingStats.totalDuration)}</Text>
              <Text style={styles.statLabel}>Celkem minut</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(trainingStats.avgDuration)}</Text>
              <Text style={styles.statLabel}>Průměr min/trénink</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(trainingStats.totalCalories)}</Text>
              <Text style={styles.statLabel}>Celkem kcal</Text>
            </View>
          </View>

          {trainingLogs.length > 0 && (
          <View style={styles.trainingTypeBreakdown}>
            <Text style={styles.breakdownTitle}>Rozložení podle typu</Text>
            {(() => {
              const types = trainingLogs.reduce((acc, log) => {
                acc[log.type] = (acc[log.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              return Object.entries(types).map(([type, count]) => {
                const percentage = (count / trainingLogs.length) * 100;
                return (
                  <View key={type} style={styles.typeRow}>
                    <Text style={styles.typeLabel}>{type}</Text>
                    <View style={styles.typeBarContainer}>
                      <View style={[styles.typeBar, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.typeCount}>{count}x</Text>
                  </View>
                );
              });
            })()}
          </View>
          )}

          <View style={styles.insightCard}>
            <BarChart3 size={20} color={Colors.gold} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Tréninková doporučení</Text>
              <Text style={styles.insightText}>
                {trainingStats.avgDuration < 45 
                  ? 'Zvažte prodloužení tréninků pro lepší výsledky'
                  : 'Vynikající délka tréninků! Udržujte tempo.'}
              </Text>
            </View>
          </View>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  premiumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingBottom: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.gold,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  rangeButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  rangeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rangeButtonTextActive: {
    color: Colors.gold,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  statValueGood: {
    color: Colors.gold,
  },
  statValueBad: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  chart: {
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius: 12,
  },
  chartGradientBg: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.lightGray,
    opacity: 0.3,
  },
  chartLine: {
    position: 'absolute' as const,
    height: 3,
    backgroundColor: Colors.gold,
    transformOrigin: 'left center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  chartDot: {
    position: 'absolute' as const,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  chartDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  targetLine: {
    position: 'absolute' as const,
    left: 30,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  targetLineDash: {
    flex: 1,
    height: 2,
    borderTopWidth: 2,
    borderColor: '#ef4444',
    borderStyle: 'dashed' as const,
    opacity: 0.7,
  },
  targetLabelContainer: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  targetLabel: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  yAxisLabel: {
    position: 'absolute' as const,
  },
  axisText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyChart: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textLight,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 32,
    backgroundColor: Colors.gold,
    borderRadius: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  barGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '600' as const,
  },
  progressCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  progressContent: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  progressValueLarge: {
    fontSize: 20,
    color: Colors.gold,
  },
  historySection: {
    marginTop: 16,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  historyLeft: {
    flex: 1,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffBadgeGood: {
    backgroundColor: Colors.lightGray,
  },
  diffBadgeBad: {
    backgroundColor: '#fee2e2',
  },
  diffText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  diffTextGood: {
    color: Colors.gold,
  },
  diffTextBad: {
    color: '#ef4444',
  },
  trendCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  trendGrid: {
    gap: 12,
    marginBottom: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  trendValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValueGood: {
    color: Colors.gold,
  },
  trendValueBad: {
    color: '#ef4444',
  },
  predictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  predictionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  nutritionProgress: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  macroBar: {
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  macroProgressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  trainingTypeBreakdown: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    width: 70,
  },
  typeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  typeBar: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  typeCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
    width: 35,
    textAlign: 'right',
  },
});
