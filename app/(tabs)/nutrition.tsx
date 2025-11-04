
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Camera, Flame, Drumstick, Wheat, Droplet, Pizza, Utensils, Apple, ChefHat, PieChart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function NutritionScreen() {
  const { t, getTodayNutrition, getNutritionGoals, getTodayMeals } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const todayNutrition = getTodayNutrition();
  const goals = getNutritionGoals();
  const todayMeals = getTodayMeals();

  const caloriesProgress = (todayNutrition.calories / goals.calories) * 100;
  const proteinProgress = (todayNutrition.protein / goals.protein) * 100;
  const carbsProgress = (todayNutrition.carbs / goals.carbs) * 100;
  const fatProgress = (todayNutrition.fat / goals.fat) * 100;

  const nutritionData = [
    {
      icon: Flame,
      color: '#FF6B6B',
      label: t.nutrition.calories,
      current: Math.round(todayNutrition.calories),
      goal: goals.calories,
      progress: caloriesProgress,
      unit: t.common.kcal,
    },
    {
      icon: Drumstick,
      color: '#6366F1',
      label: t.nutrition.protein,
      current: Math.round(todayNutrition.protein),
      goal: goals.protein,
      progress: proteinProgress,
      unit: t.common.g,
    },
    {
      icon: Wheat,
      color: '#F59E0B',
      label: t.nutrition.carbs,
      current: Math.round(todayNutrition.carbs),
      goal: goals.carbs,
      progress: carbsProgress,
      unit: t.common.g,
    },
    {
      icon: Droplet,
      color: '#10B981',
      label: t.nutrition.fat,
      current: Math.round(todayNutrition.fat),
      goal: goals.fat,
      progress: fatProgress,
      unit: t.common.g,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{t.nutrition.title}</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add-meal')}
        >
          <Plus size={20} color={Colors.black} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>{t.nutrition.todayGoals}</Text>
          <View style={styles.goalsGrid}>
            {nutritionData.map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={index} style={styles.goalCard}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <Icon size={24} color={item.color} />
                  </View>
                  <Text style={styles.goalLabel}>{item.label}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, item.progress)}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.goalValues}>
                    <Text style={[styles.goalCurrent, { color: item.color }]}>
                      {item.current}
                    </Text>
                    <Text style={styles.goalSeparator}>/</Text>
                    <Text style={styles.goalTarget}>{item.goal}</Text>
                    <Text style={styles.goalUnit}>{item.unit}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.macroBreakdownSection}>
          <View style={styles.macroHeader}>
            <PieChart size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Rozložení makroživin</Text>
          </View>
          <View style={styles.macroCircleContainer}>
            <View style={styles.macroCircle}>
              <Text style={styles.macroCircleValue}>{todayNutrition.calories}</Text>
              <Text style={styles.macroCircleLabel}>{t.common.kcal}</Text>
            </View>
          </View>
          <View style={styles.macroBreakdownGrid}>
            <View style={styles.macroBreakdownItem}>
              <View style={[styles.macroDot, { backgroundColor: '#6366F1' }]} />
              <View style={styles.macroBreakdownText}>
                <Text style={styles.macroBreakdownLabel}>Bílkoviny</Text>
                <Text style={styles.macroBreakdownValue}>{todayNutrition.protein}g ({Math.round((todayNutrition.protein * 4 / todayNutrition.calories) * 100) || 0}%)</Text>
              </View>
            </View>
            <View style={styles.macroBreakdownItem}>
              <View style={[styles.macroDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.macroBreakdownText}>
                <Text style={styles.macroBreakdownLabel}>Sacharidy</Text>
                <Text style={styles.macroBreakdownValue}>{todayNutrition.carbs}g ({Math.round((todayNutrition.carbs * 4 / todayNutrition.calories) * 100) || 0}%)</Text>
              </View>
            </View>
            <View style={styles.macroBreakdownItem}>
              <View style={[styles.macroDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.macroBreakdownText}>
                <Text style={styles.macroBreakdownLabel}>Tuky</Text>
                <Text style={styles.macroBreakdownValue}>{todayNutrition.fat}g ({Math.round((todayNutrition.fat * 9 / todayNutrition.calories) * 100) || 0}%)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>{t.nutrition.meals}</Text>
          
          {todayMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <ChefHat size={64} color={Colors.gold} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>{t.nutrition.noMealsToday}</Text>
              <Text style={styles.emptyDescription}>{t.nutrition.startLogging}</Text>
              <Pressable
                style={styles.scanButton}
                onPress={() => router.push('/add-meal')}
              >
                <Camera size={22} color={Colors.black} strokeWidth={2} />
                <Text style={styles.scanButtonText}>{t.nutrition.scanFood}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {todayMeals.map((meal) => {
                const getMealIcon = (mealType: string | undefined) => {
                  switch(mealType) {
                    case 'breakfast': return Apple;
                    case 'lunch': return Utensils;
                    case 'dinner': return ChefHat;
                    case 'snack': return Pizza;
                    default: return Utensils;
                  }
                };
                const MealIcon = getMealIcon(meal.mealType);
                return (
                  <View key={meal.id} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <View style={styles.mealHeaderLeft}>
                        <View style={styles.mealIconContainer}>
                          <MealIcon size={20} color={Colors.gold} strokeWidth={2} />
                        </View>
                        <View>
                          <Text style={styles.mealName}>{meal.name}</Text>
                          <Text style={styles.mealTime}>
                            {meal.mealType ? t.nutrition[meal.mealType] : t.nutrition.snack}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mealCalories}>
                        <Text style={styles.mealCaloriesValue}>{Math.round(meal.calories)}</Text>
                        <Text style={styles.mealCaloriesUnit}>{t.common.kcal}</Text>
                      </View>
                    </View>
                    <View style={styles.mealMacros}>
                      <View style={styles.macroItem}>
                        <View style={[styles.macroIconDot, { backgroundColor: '#6366F1' }]} />
                        <View>
                          <Text style={styles.macroLabel}>{t.nutrition.protein}</Text>
                          <Text style={styles.macroValue}>{Math.round(meal.protein)}{t.common.g}</Text>
                        </View>
                      </View>
                      <View style={styles.macroItem}>
                        <View style={[styles.macroIconDot, { backgroundColor: '#F59E0B' }]} />
                        <View>
                          <Text style={styles.macroLabel}>{t.nutrition.carbs}</Text>
                          <Text style={styles.macroValue}>{Math.round(meal.carbs)}{t.common.g}</Text>
                        </View>
                      </View>
                      <View style={styles.macroItem}>
                        <View style={[styles.macroIconDot, { backgroundColor: '#10B981' }]} />
                        <View>
                          <Text style={styles.macroLabel}>{t.nutrition.fat}</Text>
                          <Text style={styles.macroValue}>{Math.round(meal.fat)}{t.common.g}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  addButton: {
    backgroundColor: Colors.gold,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  goalCurrent: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  goalSeparator: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginHorizontal: 3,
  },
  goalTarget: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  goalUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  mealsSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: Colors.gold + '30',
    borderStyle: 'dashed' as const,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.gold,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  mealsList: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mealCalories: {
    alignItems: 'flex-end',
  },
  mealCaloriesValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  mealCaloriesUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  macroItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  macroBreakdownSection: {
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  macroCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  macroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.lightGray,
    borderWidth: 8,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCircleValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  macroCircleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  macroBreakdownGrid: {
    gap: 12,
  },
  macroBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  macroBreakdownText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroBreakdownLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  macroBreakdownValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
});
