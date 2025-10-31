import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Language, translations } from '@/constants/translations';
import { AppSettings, Fight, FighterProfile, CoachProfile, HydrationLog, WeightLog, MealLog, CustomFood } from '@/constants/types';
import { WeightCuttingScience } from '@/utils/scientificCalculations';
import type { SafetyStatus, DailyWeightCutPlan, BodyCompositionEstimate, MetabolicData } from '@/utils/scientificCalculations';
import { trpcClient } from '@/lib/trpc';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'light',
  notifications: true,
  hasCompletedOnboarding: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<FighterProfile | CoachProfile | null>(null);
  const [fights, setFights] = useState<Fight[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      console.log('[AppContext] Starting to load stored data...');
      const [storedSettings, storedProfile, storedFights, storedWeightLogs, storedHydrationLogs, storedMealLogs, storedCustomFoods] =
        await Promise.all([
          AsyncStorage.getItem('settings'),
          AsyncStorage.getItem('profile'),
          AsyncStorage.getItem('fights'),
          AsyncStorage.getItem('weightLogs'),
          AsyncStorage.getItem('hydrationLogs'),
          AsyncStorage.getItem('mealLogs'),
          AsyncStorage.getItem('customFoods'),
        ]);

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        console.log('[AppContext] Loaded settings:', parsed);
        setSettings(parsed);
      } else {
        console.log('[AppContext] No stored settings found, using defaults');
      }
      
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        console.log('[AppContext] Loaded profile for user:', parsed.id);
        setProfile({
          ...parsed,
          cuttingStartDate: parsed.cuttingStartDate ? new Date(parsed.cuttingStartDate) : undefined,
        });
      } else {
        console.log('[AppContext] No stored profile found');
      }
      
      if (storedFights) {
        const parsedFights = JSON.parse(storedFights);
        console.log('[AppContext] Loaded', parsedFights.length, 'fights');
        setFights(
          parsedFights.map((f: Fight) => ({
            ...f,
            date: new Date(f.date),
            weighInTime: f.weighInTime ? new Date(f.weighInTime) : undefined,
          }))
        );
      }
      if (storedWeightLogs) {
        const parsedLogs = JSON.parse(storedWeightLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'weight logs');
        setWeightLogs(parsedLogs.map((l: WeightLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedHydrationLogs) {
        const parsedLogs = JSON.parse(storedHydrationLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'hydration logs');
        setHydrationLogs(parsedLogs.map((l: HydrationLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedMealLogs) {
        const parsedLogs = JSON.parse(storedMealLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'meal logs');
        setMealLogs(parsedLogs.map((l: MealLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedCustomFoods) {
        const parsedFoods = JSON.parse(storedCustomFoods);
        console.log('[AppContext] Loaded', parsedFoods.length, 'custom foods');
        setCustomFoods(parsedFoods.map((f: CustomFood) => ({ ...f, createdAt: new Date(f.createdAt) })));
      }
      console.log('[AppContext] Finished loading stored data');
    } catch (error) {
      console.error('[AppContext] Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem('settings', JSON.stringify(updated));
  }, [settings]);

  const setLanguage = useCallback((language: Language) => {
    updateSettings({ language });
  }, [updateSettings]);

  const completeOnboarding = useCallback(async (userProfile: FighterProfile | CoachProfile) => {
    console.log('[AppContext] Completing onboarding for user:', userProfile.id);
    setProfile(userProfile);
    await AsyncStorage.setItem('profile', JSON.stringify(userProfile));
    await updateSettings({ hasCompletedOnboarding: true });
    
    try {
      await trpcClient.profile.sync.mutate(userProfile);
      console.log('[AppContext] Profile synced to backend successfully');
    } catch (error) {
      console.error('[AppContext] Failed to sync profile to backend:', error);
    }
  }, [updateSettings]);

  const updateProfile = useCallback(async (updates: Partial<FighterProfile> | Partial<CoachProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates } as FighterProfile | CoachProfile;
    setProfile(updated);
    await AsyncStorage.setItem('profile', JSON.stringify(updated));
  }, [profile]);

  const addFight = useCallback(async (fight: Omit<Fight, 'id'>) => {
    const newFight: Fight = {
      ...fight,
      id: Date.now().toString(),
    };
    const updated = [...fights, newFight];
    setFights(updated);
    await AsyncStorage.setItem('fights', JSON.stringify(updated));

    if (profile && profile.role === 'fighter' && fight.weightClass) {
      const targetWeightFromClass = parseFloat(fight.weightClass.replace(/[^0-9.]/g, ''));
      if (!isNaN(targetWeightFromClass)) {
        const updatedProfile = { 
          ...profile, 
          targetWeight: targetWeightFromClass,
          startingWeight: profile.currentWeight
        } as FighterProfile;
        console.log('[AppContext] New fight created - setting startingWeight:', profile.currentWeight, 'targetWeight:', targetWeightFromClass);
        setProfile(updatedProfile);
        await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      }
    }
  }, [fights, profile]);

  const updateFight = useCallback(async (id: string, updates: Partial<Fight>) => {
    const updated = fights.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFights(updated);
    await AsyncStorage.setItem('fights', JSON.stringify(updated));
  }, [fights]);

  const deleteFight = useCallback(async (id: string) => {
    const updated = fights.filter((f) => f.id !== id);
    setFights(updated);
    await AsyncStorage.setItem('fights', JSON.stringify(updated));
  }, [fights]);

  const addWeightLog = useCallback(async (weight: number, time: 'morning' | 'evening') => {
    const newLog: WeightLog = {
      id: Date.now().toString(),
      date: new Date(),
      weight,
      time,
    };
    const updated = [...weightLogs, newLog];
    setWeightLogs(updated);
    await AsyncStorage.setItem('weightLogs', JSON.stringify(updated));

    if (profile && profile.role === 'fighter' && time === 'morning') {
      const updatedProfile = { ...profile, currentWeight: weight } as FighterProfile;
      console.log('[AppContext] Weight logged - currentWeight:', weight, 'startingWeight:', updatedProfile.startingWeight, 'targetWeight:', updatedProfile.targetWeight);
      setProfile(updatedProfile);
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
    }
  }, [weightLogs, profile]);

  const addHydrationLog = useCallback(async (amount: number) => {
    const newLog: HydrationLog = {
      id: Date.now().toString(),
      date: new Date(),
      amount,
    };
    const updated = [...hydrationLogs, newLog];
    setHydrationLogs(updated);
    await AsyncStorage.setItem('hydrationLogs', JSON.stringify(updated));
  }, [hydrationLogs]);

  const getUpcomingFight = useCallback((): Fight | null => {
    const now = new Date();
    const upcoming = fights
      .filter((f) => f.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
  }, [fights]);

  const getTodayHydration = useCallback((): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return hydrationLogs
      .filter((log) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      })
      .reduce((sum, log) => sum + log.amount, 0);
  }, [hydrationLogs]);

  const addMealLog = useCallback(async (meal: Omit<MealLog, 'id'>) => {
    const newLog: MealLog = {
      ...meal,
      id: Date.now().toString(),
    };
    const updated = [...mealLogs, newLog];
    setMealLogs(updated);
    await AsyncStorage.setItem('mealLogs', JSON.stringify(updated));

    if (meal.customFoodId) {
      const foodIndex = customFoods.findIndex((f) => f.id === meal.customFoodId);
      if (foodIndex !== -1) {
        const updatedFoods = [...customFoods];
        updatedFoods[foodIndex].usageCount += 1;
        setCustomFoods(updatedFoods);
        await AsyncStorage.setItem('customFoods', JSON.stringify(updatedFoods));
      }
    }
  }, [mealLogs, customFoods]);

  const updateMealLog = useCallback(async (id: string, updates: Partial<MealLog>) => {
    const updated = mealLogs.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMealLogs(updated);
    await AsyncStorage.setItem('mealLogs', JSON.stringify(updated));
  }, [mealLogs]);

  const deleteMealLog = useCallback(async (id: string) => {
    const updated = mealLogs.filter((m) => m.id !== id);
    setMealLogs(updated);
    await AsyncStorage.setItem('mealLogs', JSON.stringify(updated));
  }, [mealLogs]);

  const addCustomFood = useCallback(async (food: Omit<CustomFood, 'id' | 'createdAt' | 'usageCount'>) => {
    const newFood: CustomFood = {
      ...food,
      id: Date.now().toString(),
      createdAt: new Date(),
      usageCount: 0,
    };
    const updated = [...customFoods, newFood];
    setCustomFoods(updated);
    await AsyncStorage.setItem('customFoods', JSON.stringify(updated));
    return newFood;
  }, [customFoods]);

  const updateCustomFood = useCallback(async (id: string, updates: Partial<CustomFood>) => {
    const updated = customFoods.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setCustomFoods(updated);
    await AsyncStorage.setItem('customFoods', JSON.stringify(updated));
  }, [customFoods]);

  const deleteCustomFood = useCallback(async (id: string) => {
    const updated = customFoods.filter((f) => f.id !== id);
    setCustomFoods(updated);
    await AsyncStorage.setItem('customFoods', JSON.stringify(updated));
  }, [customFoods]);

  const getTodayMeals = useCallback((): MealLog[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return mealLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  }, [mealLogs]);

  const getTodayNutrition = useCallback(() => {
    const todayMeals = getTodayMeals();
    return todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        sodium: acc.sodium + meal.sodiumMg,
        fiber: acc.fiber + (meal.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, fiber: 0 }
    );
  }, [getTodayMeals]);

  const getBodyComposition = useCallback((): BodyCompositionEstimate | null => {
    if (!profile || profile.role !== 'fighter') return null;
    return WeightCuttingScience.estimateBodyComposition(
      profile.currentWeight,
      profile.height,
      profile.age,
      profile.gender
    );
  }, [profile]);

  const getMetabolicData = useCallback((): MetabolicData | null => {
    if (!profile || profile.role !== 'fighter') return null;
    return WeightCuttingScience.getMetabolicData(profile);
  }, [profile]);

  const getNutritionGoals = useCallback(() => {
    if (!profile || profile.role !== 'fighter') {
      return {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 60,
        sodium: 2300,
        fiber: 25,
      };
    }

    const metabolicData = getMetabolicData();
    if (!metabolicData) {
      return {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 60,
        sodium: 2300,
        fiber: 25,
      };
    }

    const upcomingFight = getUpcomingFight();
    const now = new Date();
    const daysUntilFight = upcomingFight
      ? Math.ceil((upcomingFight.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    let calorieTarget = metabolicData.tdee;
    let sodiumTarget = 2300;

    if (daysUntilFight && daysUntilFight <= 7) {
      if (daysUntilFight <= 3) {
        calorieTarget = metabolicData.tdee * 0.6;
        sodiumTarget = 500;
      } else {
        calorieTarget = metabolicData.tdee * 0.8;
        sodiumTarget = 1500;
      }
    }

    const proteinPerKg = 2.2;
    const fatPerKg = 0.8;
    const protein = profile.currentWeight * proteinPerKg;
    const fat = profile.currentWeight * fatPerKg;
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbCals = calorieTarget - proteinCals - fatCals;
    const carbs = carbCals / 4;

    return {
      calories: Math.round(calorieTarget),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      sodium: sodiumTarget,
      fiber: 25,
    };
  }, [profile, getMetabolicData, getUpcomingFight]);

  const getDailyHydrationGoal = useCallback((): number => {
    if (!profile || profile.role !== 'fighter') return 3000;
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight) return profile.currentWeight * 35;
    
    const now = new Date();
    const daysUntilFight = Math.ceil((upcomingFight.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return WeightCuttingScience.getDailyHydrationGoal(
      profile.currentWeight,
      daysUntilFight,
      profile.trainingIntensity
    );
  }, [profile, getUpcomingFight]);

  const getWeightCutPlan = useCallback((): DailyWeightCutPlan[] => {
    if (!profile || profile.role !== 'fighter') return [];
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight) return [];
    return WeightCuttingScience.generateWeightCutPlan(profile, upcomingFight.date);
  }, [profile, getUpcomingFight]);

  const getSafetyStatus = useCallback((): SafetyStatus | null => {
    if (!profile || profile.role !== 'fighter') return null;
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight) return null;
    
    const now = new Date();
    const daysUntilFight = Math.ceil((upcomingFight.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return WeightCuttingScience.assessSafetyStatus(profile, weightLogs, daysUntilFight);
  }, [profile, weightLogs, getUpcomingFight]);

  const getWeightProgress = useCallback((): number => {
    if (!profile || profile.role !== 'fighter') return 0;
    const startWeight = profile.startingWeight || profile.currentWeight;
    const total = startWeight - profile.targetWeight;
    if (total <= 0) return 100;
    const remaining = profile.currentWeight - profile.targetWeight;
    if (remaining <= 0) return 100;
    const progress = ((total - remaining) / total) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [profile]);

  const signOut = useCallback(async () => {
    setProfile(null);
    setFights([]);
    setWeightLogs([]);
    setHydrationLogs([]);
    setMealLogs([]);
    setCustomFoods([]);
    await AsyncStorage.multiRemove(['profile', 'fights', 'weightLogs', 'hydrationLogs', 'mealLogs', 'customFoods']);
    await updateSettings({ hasCompletedOnboarding: false });
  }, [updateSettings]);

  const t = useMemo(() => translations[settings.language], [settings.language]);

  return useMemo(() => ({
    settings,
    profile,
    fights,
    weightLogs,
    hydrationLogs,
    mealLogs,
    customFoods,
    isLoading,
    t,
    setLanguage,
    updateSettings,
    completeOnboarding,
    updateProfile,
    addFight,
    updateFight,
    deleteFight,
    addWeightLog,
    addHydrationLog,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    addCustomFood,
    updateCustomFood,
    deleteCustomFood,
    getTodayMeals,
    getTodayNutrition,
    getNutritionGoals,
    getUpcomingFight,
    getTodayHydration,
    getDailyHydrationGoal,
    getWeightCutPlan,
    getSafetyStatus,
    getBodyComposition,
    getMetabolicData,
    getWeightProgress,
    signOut,
  }), [
    settings,
    profile,
    fights,
    weightLogs,
    hydrationLogs,
    mealLogs,
    customFoods,
    isLoading,
    t,
    setLanguage,
    updateSettings,
    completeOnboarding,
    updateProfile,
    addFight,
    updateFight,
    deleteFight,
    addWeightLog,
    addHydrationLog,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    addCustomFood,
    updateCustomFood,
    deleteCustomFood,
    getTodayMeals,
    getTodayNutrition,
    getNutritionGoals,
    getUpcomingFight,
    getTodayHydration,
    getDailyHydrationGoal,
    getWeightCutPlan,
    getSafetyStatus,
    getBodyComposition,
    getMetabolicData,
    getWeightProgress,
    signOut,
  ]);
});
