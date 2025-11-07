import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Language, translations } from '@/constants/translations';
import { AppSettings, Fight, UserProfile, HydrationLog, WeightLog, MealLog, CustomFood, SupplementLog, RegenerationLog, SleepLog, DailyNote, TrainingLog, BodyCompositionLog } from '@/constants/types';
import { WeightCuttingScience } from '@/utils/scientificCalculations';
import type { SafetyStatus, DailyWeightCutPlan, BodyCompositionEstimate, MetabolicData } from '@/utils/scientificCalculations';
import { trpcClient } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'cs',
  theme: 'light',
  notifications: true,
  hasCompletedOnboarding: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fights, setFights] = useState<Fight[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [supplementLogs, setSupplementLogs] = useState<SupplementLog[]>([]);
  const [regenerationLogs, setRegenerationLogs] = useState<RegenerationLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [bodyCompositionLogs, setBodyCompositionLogs] = useState<BodyCompositionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dangerBannerDismissed, setDangerBannerDismissed] = useState(false);

  useEffect(() => {
    loadStoredData();
    const cleanup = setupAuthListener();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupAuthListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AppContext] Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AppContext] User signed in, loading profile from backend');
        await loadProfileFromBackend(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('[AppContext] User signed out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadProfileFromBackend = async (userId: string) => {
    try {
      console.log('[AppContext] Loading profile from backend for user:', userId);
      const backendProfile = await trpcClient.profile.get.query({ userId });
      
      if (backendProfile) {
        console.log('[AppContext] Profile loaded from backend:', backendProfile.id);
        setProfile(backendProfile);
        await AsyncStorage.setItem('profile', JSON.stringify(backendProfile));
        const currentSettings = await AsyncStorage.getItem('settings');
        const parsedSettings = currentSettings ? JSON.parse(currentSettings) : DEFAULT_SETTINGS;
        const updatedSettings = { ...parsedSettings, hasCompletedOnboarding: true };
        setSettings(updatedSettings);
        await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
      } else {
        console.log('[AppContext] No profile found in backend for user:', userId);
      }

      console.log('[AppContext] Loading weight logs from backend');
      const backendWeightLogs = await trpcClient.weightLogs.list.query({ userId });
      if (backendWeightLogs && backendWeightLogs.length > 0) {
        console.log('[AppContext] Loaded', backendWeightLogs.length, 'weight logs from backend');
        setWeightLogs(backendWeightLogs);
        await AsyncStorage.setItem('weightLogs', JSON.stringify(backendWeightLogs));
      }
    } catch (error) {
      console.error('[AppContext] Error loading data from backend:', error);
    }
  };

  const loadStoredData = async () => {
    try {
      console.log('[AppContext] Starting to load stored data...');
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[AppContext] Current session:', session?.user?.id);
      
      const [storedSettings, storedProfile, storedFights, storedWeightLogs, storedHydrationLogs, storedMealLogs, storedCustomFoods, storedSupplementLogs, storedRegenerationLogs, storedSleepLogs, storedDailyNotes, storedTrainingLogs, storedBodyCompositionLogs, storedDangerBannerDismissed] =
        await Promise.all([
          AsyncStorage.getItem('settings'),
          AsyncStorage.getItem('profile'),
          AsyncStorage.getItem('fights'),
          AsyncStorage.getItem('weightLogs'),
          AsyncStorage.getItem('hydrationLogs'),
          AsyncStorage.getItem('mealLogs'),
          AsyncStorage.getItem('customFoods'),
          AsyncStorage.getItem('supplementLogs'),
          AsyncStorage.getItem('regenerationLogs'),
          AsyncStorage.getItem('sleepLogs'),
          AsyncStorage.getItem('dailyNotes'),
          AsyncStorage.getItem('trainingLogs'),
          AsyncStorage.getItem('bodyCompositionLogs'),
          AsyncStorage.getItem('dangerBannerDismissed'),
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
      if (storedSupplementLogs) {
        const parsedLogs = JSON.parse(storedSupplementLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'supplement logs');
        setSupplementLogs(parsedLogs.map((l: SupplementLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedRegenerationLogs) {
        const parsedLogs = JSON.parse(storedRegenerationLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'regeneration logs');
        setRegenerationLogs(parsedLogs.map((l: RegenerationLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedSleepLogs) {
        const parsedLogs = JSON.parse(storedSleepLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'sleep logs');
        setSleepLogs(parsedLogs.map((l: SleepLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedDailyNotes) {
        const parsedNotes = JSON.parse(storedDailyNotes);
        console.log('[AppContext] Loaded', parsedNotes.length, 'daily notes');
        setDailyNotes(parsedNotes.map((n: DailyNote) => ({ ...n, date: new Date(n.date) })));
      }
      if (storedTrainingLogs) {
        const parsedLogs = JSON.parse(storedTrainingLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'training logs');
        setTrainingLogs(parsedLogs.map((l: TrainingLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedBodyCompositionLogs) {
        const parsedLogs = JSON.parse(storedBodyCompositionLogs);
        console.log('[AppContext] Loaded', parsedLogs.length, 'body composition logs');
        setBodyCompositionLogs(parsedLogs.map((l: BodyCompositionLog) => ({ ...l, date: new Date(l.date) })));
      }
      if (storedDangerBannerDismissed) {
        const dismissed = storedDangerBannerDismissed === 'true';
        setDangerBannerDismissed(dismissed);
      }
      console.log('[AppContext] Finished loading stored data');
      
      if (session?.user) {
        console.log('[AppContext] User is signed in, loading data from backend');
        await loadProfileFromBackend(session.user.id);
      }
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

  const completeOnboarding = useCallback(async (userProfile: UserProfile) => {
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

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) {
      console.log('[AppContext] No profile found, user should complete onboarding');
      return;
    }
    const updated = { ...profile, ...updates } as UserProfile;
    setProfile(updated);
    await AsyncStorage.setItem('profile', JSON.stringify(updated));
    
    try {
      await trpcClient.profile.sync.mutate(updated);
      console.log('[AppContext] Profile updated and synced to backend');
    } catch (error) {
      console.error('[AppContext] Failed to sync updated profile to backend:', error);
    }
  }, [profile]);

  const addFight = useCallback(async (fight: Omit<Fight, 'id'>) => {
    const newFight: Fight = {
      ...fight,
      id: Date.now().toString(),
    };
    const updated = [...fights, newFight];
    setFights(updated);
    await AsyncStorage.setItem('fights', JSON.stringify(updated));

    if (profile) {
      const updatedProfile = { 
        ...profile, 
        targetWeight: fight.targetWeightForFight,
        startingWeight: profile.startingWeight || profile.currentWeight,
        targetFightDate: fight.date
      } as UserProfile;
      console.log('[AppContext] New fight created - startingWeight:', updatedProfile.startingWeight, 'currentWeight:', profile.currentWeight, 'targetWeight:', fight.targetWeightForFight);
      setProfile(updatedProfile);
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      
      try {
        await trpcClient.profile.sync.mutate(updatedProfile);
        console.log('[AppContext] Updated profile synced to backend after adding fight');
      } catch (error) {
        console.error('[AppContext] Failed to sync updated profile to backend:', error);
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

    if (profile) {
      try {
        await trpcClient.weightLogs.add.mutate({
          userId: profile.id,
          date: newLog.date,
          weight: newLog.weight,
          time: newLog.time,
        });
        console.log('[AppContext] Weight log synced to backend');
      } catch (error) {
        console.error('[AppContext] Failed to sync weight log to backend:', error);
      }

      if (time === 'morning') {
        const updatedProfile = { ...profile, currentWeight: weight } as UserProfile;
        console.log('[AppContext] Weight logged - currentWeight:', weight, 'startingWeight:', updatedProfile.startingWeight, 'targetWeight:', updatedProfile.targetWeight);
        setProfile(updatedProfile);
        await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
        
        try {
          await trpcClient.profile.sync.mutate(updatedProfile);
          console.log('[AppContext] Updated profile synced to backend');
        } catch (error) {
          console.error('[AppContext] Failed to sync updated profile to backend:', error);
        }
      }
    } else {
      console.log('[AppContext] Weight log added locally without profile');
    }
  }, [weightLogs, profile]);

  const addHydrationLog = useCallback(async (amount: number, sodiumMg?: number, potassiumMg?: number, magnesiumMg?: number) => {
    const newLog: HydrationLog = {
      id: Date.now().toString(),
      date: new Date(),
      amount,
      sodiumMg,
      potassiumMg,
      magnesiumMg,
    };
    const updated = [...hydrationLogs, newLog];
    setHydrationLogs(updated);
    await AsyncStorage.setItem('hydrationLogs', JSON.stringify(updated));
  }, [hydrationLogs]);

  const addSupplementLog = useCallback(async (supplement: Omit<SupplementLog, 'id'>) => {
    const newLog: SupplementLog = {
      ...supplement,
      id: Date.now().toString(),
    };
    const updated = [...supplementLogs, newLog];
    setSupplementLogs(updated);
    await AsyncStorage.setItem('supplementLogs', JSON.stringify(updated));
  }, [supplementLogs]);

  const deleteSupplementLog = useCallback(async (id: string) => {
    const updated = supplementLogs.filter((s) => s.id !== id);
    setSupplementLogs(updated);
    await AsyncStorage.setItem('supplementLogs', JSON.stringify(updated));
  }, [supplementLogs]);

  const getTodaySupplements = useCallback((): SupplementLog[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return supplementLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  }, [supplementLogs]);

  const addRegenerationLog = useCallback(async (log: Omit<RegenerationLog, 'id'>) => {
    const newLog: RegenerationLog = {
      ...log,
      id: Date.now().toString(),
    };
    const updated = [...regenerationLogs, newLog];
    setRegenerationLogs(updated);
    await AsyncStorage.setItem('regenerationLogs', JSON.stringify(updated));
  }, [regenerationLogs]);

  const getTodayRegeneration = useCallback((): RegenerationLog | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = regenerationLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    return todayLogs[todayLogs.length - 1] || null;
  }, [regenerationLogs]);

  const addSleepLog = useCallback(async (log: Omit<SleepLog, 'id'>) => {
    const newLog: SleepLog = {
      ...log,
      id: Date.now().toString(),
    };
    const updated = [...sleepLogs, newLog];
    setSleepLogs(updated);
    await AsyncStorage.setItem('sleepLogs', JSON.stringify(updated));
  }, [sleepLogs]);

  const getTodaySleep = useCallback((): SleepLog | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = sleepLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    return todayLogs[todayLogs.length - 1] || null;
  }, [sleepLogs]);

  const addDailyNote = useCallback(async (note: Omit<DailyNote, 'id'>) => {
    const existingNote = dailyNotes.find((n) => {
      const noteDate = new Date(n.date);
      const inputDate = new Date(note.date);
      noteDate.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);
      return noteDate.getTime() === inputDate.getTime();
    });

    let updated: DailyNote[];
    if (existingNote) {
      updated = dailyNotes.map((n) =>
        n.id === existingNote.id ? { ...n, ...note } : n
      );
    } else {
      const newNote: DailyNote = {
        ...note,
        id: Date.now().toString(),
      };
      updated = [...dailyNotes, newNote];
    }
    setDailyNotes(updated);
    await AsyncStorage.setItem('dailyNotes', JSON.stringify(updated));
  }, [dailyNotes]);

  const getTodayNote = useCallback((): DailyNote | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNote = dailyNotes.find((note) => {
      const noteDate = new Date(note.date);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate.getTime() === today.getTime();
    });
    return todayNote || null;
  }, [dailyNotes]);

  const addTrainingLog = useCallback(async (log: Omit<TrainingLog, 'id'>) => {
    const newLog: TrainingLog = {
      ...log,
      id: Date.now().toString(),
    };
    const updated = [...trainingLogs, newLog];
    setTrainingLogs(updated);
    await AsyncStorage.setItem('trainingLogs', JSON.stringify(updated));
  }, [trainingLogs]);

  const getTodayTrainings = useCallback((): TrainingLog[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trainingLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  }, [trainingLogs]);

  const addBodyCompositionLog = useCallback(async (log: Omit<BodyCompositionLog, 'id'>) => {
    const newLog: BodyCompositionLog = {
      ...log,
      id: Date.now().toString(),
    };
    const updated = [...bodyCompositionLogs, newLog];
    setBodyCompositionLogs(updated);
    await AsyncStorage.setItem('bodyCompositionLogs', JSON.stringify(updated));
  }, [bodyCompositionLogs]);

  const getLatestBodyComposition = useCallback((): BodyCompositionLog | null => {
    if (bodyCompositionLogs.length === 0) return null;
    return bodyCompositionLogs[bodyCompositionLogs.length - 1];
  }, [bodyCompositionLogs]);

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
    if (!profile) return null;
    return WeightCuttingScience.estimateBodyComposition(
      profile.currentWeight,
      profile.height,
      profile.age,
      profile.gender
    );
  }, [profile]);

  const getMetabolicData = useCallback((): MetabolicData | null => {
    if (!profile) return null;
    return WeightCuttingScience.getMetabolicData(profile);
  }, [profile]);

  const getNutritionGoals = useCallback(() => {
    if (!profile) {
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
    if (!profile) return 3000;
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
    if (!profile) return [];
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight) return [];
    return WeightCuttingScience.generateWeightCutPlan(profile, upcomingFight.date);
  }, [profile, getUpcomingFight]);

  const getSafetyStatus = useCallback((): SafetyStatus | null => {
    if (!profile) return null;
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight) return null;
    
    const now = new Date();
    const daysUntilFight = Math.ceil((upcomingFight.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return WeightCuttingScience.assessSafetyStatus(profile, weightLogs, daysUntilFight);
  }, [profile, weightLogs, getUpcomingFight]);

  const getWeightProgress = useCallback((): number => {
    if (!profile) return 0;
    const startWeight = profile.startingWeight || profile.currentWeight;
    const total = startWeight - profile.targetWeight;
    if (total <= 0) return 100;
    const remaining = profile.currentWeight - profile.targetWeight;
    if (remaining <= 0) return 100;
    const progress = ((total - remaining) / total) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [profile]);

  const dismissDangerBanner = useCallback(async () => {
    setDangerBannerDismissed(true);
    await AsyncStorage.setItem('dangerBannerDismissed', 'true');
  }, []);

  const signOut = useCallback(async () => {
    console.log('[AppContext] Signing out...');
    try {
      await supabase.auth.signOut();
      console.log('[AppContext] Successfully signed out from Supabase');
    } catch (error) {
      console.error('[AppContext] Error signing out from Supabase:', error);
    }
    
    setProfile(null);
    setFights([]);
    setWeightLogs([]);
    setHydrationLogs([]);
    setMealLogs([]);
    setCustomFoods([]);
    setSupplementLogs([]);
    setRegenerationLogs([]);
    setSleepLogs([]);
    setDailyNotes([]);
    setTrainingLogs([]);
    setBodyCompositionLogs([]);
    setDangerBannerDismissed(false);
    await AsyncStorage.multiRemove(['profile', 'fights', 'weightLogs', 'hydrationLogs', 'mealLogs', 'customFoods', 'supplementLogs', 'regenerationLogs', 'sleepLogs', 'dailyNotes', 'trainingLogs', 'bodyCompositionLogs', 'subscriptionState', 'dangerBannerDismissed']);
    await updateSettings({ hasCompletedOnboarding: false });
    console.log('[AppContext] Local data cleared, onboarding reset, subscription state cleared');
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
    supplementLogs,
    regenerationLogs,
    sleepLogs,
    dailyNotes,
    trainingLogs,
    bodyCompositionLogs,
    isLoading,
    dangerBannerDismissed,
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
    addSupplementLog,
    deleteSupplementLog,
    getTodaySupplements,
    addRegenerationLog,
    getTodayRegeneration,
    addSleepLog,
    getTodaySleep,
    addDailyNote,
    getTodayNote,
    addTrainingLog,
    getTodayTrainings,
    addBodyCompositionLog,
    getLatestBodyComposition,
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
    dismissDangerBanner,
    signOut,
  }), [
    settings,
    profile,
    fights,
    weightLogs,
    hydrationLogs,
    mealLogs,
    customFoods,
    supplementLogs,
    regenerationLogs,
    sleepLogs,
    dailyNotes,
    trainingLogs,
    bodyCompositionLogs,
    isLoading,
    dangerBannerDismissed,
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
    addSupplementLog,
    deleteSupplementLog,
    getTodaySupplements,
    addRegenerationLog,
    getTodayRegeneration,
    addSleepLog,
    getTodaySleep,
    addDailyNote,
    getTodayNote,
    addTrainingLog,
    getTodayTrainings,
    addBodyCompositionLog,
    getLatestBodyComposition,
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
    dismissDangerBanner,
    signOut,
  ]);
});
