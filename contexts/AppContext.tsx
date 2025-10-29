import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Language, translations } from '@/constants/translations';
import { AppSettings, Fight, FighterProfile, CoachProfile, HydrationLog, WeightLog, MealLog, SubscriptionInfo } from '@/constants/types';
import { WeightCuttingScience } from '@/utils/scientificCalculations';
import type { SafetyStatus, DailyWeightCutPlan, BodyCompositionEstimate, MetabolicData } from '@/utils/scientificCalculations';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedSettings, storedProfile, storedFights, storedWeightLogs, storedHydrationLogs, storedMealLogs] =
        await Promise.all([
          AsyncStorage.getItem('settings'),
          AsyncStorage.getItem('profile'),
          AsyncStorage.getItem('fights'),
          AsyncStorage.getItem('weightLogs'),
          AsyncStorage.getItem('hydrationLogs'),
          AsyncStorage.getItem('mealLogs'),
        ]);

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile({
          ...parsed,
          cuttingStartDate: parsed.cuttingStartDate ? new Date(parsed.cuttingStartDate) : undefined,
        });
      }
      if (storedFights) {
        const parsedFights = JSON.parse(storedFights);
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
        setWeightLogs(parsedLogs.map((l: WeightLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedHydrationLogs) {
        const parsedLogs = JSON.parse(storedHydrationLogs);
        setHydrationLogs(parsedLogs.map((l: HydrationLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedMealLogs) {
        const parsedLogs = JSON.parse(storedMealLogs);
        setMealLogs(parsedLogs.map((l: MealLog) => ({ ...l, date: new Date(l.date) })));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
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
    setProfile(userProfile);
    await AsyncStorage.setItem('profile', JSON.stringify(userProfile));
    await updateSettings({ hasCompletedOnboarding: true });
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
  }, [fights]);

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
  }, [mealLogs]);

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

  const signOut = useCallback(async () => {
    setProfile(null);
    setFights([]);
    setWeightLogs([]);
    setHydrationLogs([]);
    setMealLogs([]);
    await AsyncStorage.multiRemove(['profile', 'fights', 'weightLogs', 'hydrationLogs', 'mealLogs']);
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
    getUpcomingFight,
    getTodayHydration,
    getDailyHydrationGoal,
    getWeightCutPlan,
    getSafetyStatus,
    getBodyComposition,
    getMetabolicData,
    signOut,
  }), [
    settings,
    profile,
    fights,
    weightLogs,
    hydrationLogs,
    mealLogs,
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
    getUpcomingFight,
    getTodayHydration,
    getDailyHydrationGoal,
    getWeightCutPlan,
    getSafetyStatus,
    getBodyComposition,
    getMetabolicData,
    signOut,
  ]);
});
