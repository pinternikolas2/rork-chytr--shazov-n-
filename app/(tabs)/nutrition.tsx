
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Camera, Flame, Drumstick, Wheat, Droplet, Pizza } from 'lucide-react-native';
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
      color: '#4ECDC4',
      label: t.nutrition.protein,
      current: Math.round(todayNutrition.protein),
      goal: goals.protein,
      progress: proteinProgress,
      unit: t.common.g,
    },
    {
      icon: Wheat,
      color: '#FFD93D',
      label: t.nutrition.carbs,
      current: Math.round(todayNutrition.carbs),
      goal: goals.carbs,
      progress: carbsProgress,
      unit: t.common.g,
    },
    {
      icon: Droplet,
      color: '#95E1D3',
      label: t.nutrition.fat,
      current: Math.round(todayNutrition.fat),
      goal: goals.fat,
      progress: fatProgress,
      unit: t.common.g,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t.nutrition.title}</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/add-meal')}
          >
            <Plus size={20} color={Colors.black} />
          </Pressable>
        </View>

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

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>{t.nutrition.meals}</Text>
          
          {todayMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Pizza size={64} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>{t.nutrition.noMealsToday}</Text>
              <Text style={styles.emptyDescription}>{t.nutrition.startLogging}</Text>
              <Pressable
                style={styles.scanButton}
                onPress={() => router.push('/add-meal')}
              >
                <Camera size={20} color={Colors.black} />
                <Text style={styles.scanButtonText}>{t.nutrition.scanFood}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {todayMeals.map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealTime}>
                        {meal.mealType ? t.nutrition[meal.mealType] : t.nutrition.snack}
                      </Text>
                    </View>
                    <View style={styles.mealCalories}>
                      <Text style={styles.mealCaloriesValue}>{Math.round(meal.calories)}</Text>
                      <Text style={styles.mealCaloriesUnit}>{t.common.kcal}</Text>
                    </View>
                  </View>
                  <View style={styles.mealMacros}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>P</Text>
                      <Text style={styles.macroValue}>{Math.round(meal.protein)}{t.common.g}</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>C</Text>
                      <Text style={styles.macroValue}>{Math.round(meal.carbs)}{t.common.g}</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>F</Text>
                      <Text style={styles.macroValue}>{Math.round(meal.fat)}{t.common.g}</Text>
                    </View>
                  </View>
                </View>
              ))}
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
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.gold,
    width: 44,
    height: 44,
    borderRadius: 12,
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
    width: 48,
    height: 48,
    borderRadius: 12,
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
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalCurrent: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  goalSeparator: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  goalTarget: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  goalUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  mealsSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 24,
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
    gap: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
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
    marginBottom: 12,
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
    gap: 16,
  },
  macroItem: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
});
