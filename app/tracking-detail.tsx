import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, TrendingDown, TrendingUp, Droplets, Calendar, Activity } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const { width: screenWidth } = Dimensions.get('window');

type TimeRange = '7d' | '30d' | '3m';

export default function TrackingDetailScreen() {
  const { t, weightLogs, hydrationLogs, profile, getUpcomingFight } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');

  const upcomingFight = getUpcomingFight();

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
    
    return { max, min, avg, latest, oldest, change };
  }, [filteredWeightLogs]);

  const renderWeightChart = () => {
    if (filteredWeightLogs.length < 2) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Nedostatek dat pro graf</Text>
        </View>
      );
    }

    const chartWidth = screenWidth - 80;
    const chartHeight = 180;
    const padding = 20;
    const plotWidth = chartWidth - padding * 2;
    const plotHeight = chartHeight - padding * 2;

    const weights = filteredWeightLogs.map(l => l.weight).reverse();
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const weightRange = maxWeight - minWeight;

    const points = weights.map((weight, i) => {
      const x = padding + (i / (weights.length - 1)) * plotWidth;
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
        {targetY && (
          <View style={[styles.targetLine, { top: targetY }]}>
            <View style={styles.targetLineDash} />
            <Text style={styles.targetLabel}>Cíl: {targetWeight?.toFixed(1)} kg</Text>
          </View>
        )}
        
        {points.map((point, i) => {
          if (i === 0) return null;
          const prevPoint = points[i - 1];
          const length = Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2));
          const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
          
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
                },
              ]}
            />
          );
        })}

        {points.map((point, i) => (
          <View key={i} style={[styles.chartDot, { left: point.x - 4, top: point.y - 4 }]}>
            <View style={styles.chartDotInner} />
          </View>
        ))}

        <View style={[styles.yAxisLabel, { top: padding - 10 }]}>
          <Text style={styles.axisText}>{maxWeight.toFixed(1)}</Text>
        </View>
        <View style={[styles.yAxisLabel, { top: chartHeight - padding - 10 }]}>
          <Text style={styles.axisText}>{minWeight.toFixed(1)}</Text>
        </View>
      </View>
    );
  };

  const renderHydrationChart = () => {
    if (hydrationStats.dailyTotals.size === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Nedostatek dat pro graf</Text>
        </View>
      );
    }

    const chartWidth = screenWidth - 80;
    const chartHeight = 180;
    const days = Array.from(hydrationStats.dailyTotals.entries()).slice(-7);
    const barWidth = (chartWidth - 60) / days.length;
    const maxAmount = hydrationStats.max;

    return (
      <View style={[styles.barChart, { width: chartWidth, height: chartHeight }]}>
        {days.map(([date, amount], i) => {
          const barHeight = (amount / maxAmount) * (chartHeight - 40);
          const dateObj = new Date(date);
          const dayLabel = dateObj.toLocaleDateString('cs-CZ', { weekday: 'short' });
          
          return (
            <View key={i} style={[styles.barContainer, { width: barWidth }]}>
              <View style={styles.barWrapper}>
                <Text style={styles.barValue}>{Math.round(amount / 1000)}L</Text>
                <View style={[styles.bar, { height: Math.max(barHeight, 5) }]} />
              </View>
              <Text style={styles.barLabel}>{dayLabel}</Text>
            </View>
          );
        })}
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={24} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Vývoj Váhy</Text>
          </View>

          {weightStats && (
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
        </View>

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

        {filteredWeightLogs.length > 0 && (
          <View style={styles.section}>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
  },
  chartLine: {
    position: 'absolute' as const,
    height: 3,
    backgroundColor: Colors.gold,
    transformOrigin: 'left center',
  },
  chartDot: {
    position: 'absolute' as const,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartDotInner: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.gold,
  },
  targetLine: {
    position: 'absolute' as const,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetLineDash: {
    flex: 1,
    height: 2,
    borderTopWidth: 2,
    borderColor: '#ef4444',
    borderStyle: 'dashed' as const,
  },
  targetLabel: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600' as const,
  },
  yAxisLabel: {
    position: 'absolute' as const,
    left: -40,
  },
  axisText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyChart: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: '80%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
    minHeight: 5,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
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
});
