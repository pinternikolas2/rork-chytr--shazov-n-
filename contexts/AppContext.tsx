import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Language, translations } from '@/constants/translations';
import { AppSettings, Fight, UserProfile, HydrationLog, WeightLog, MealLog, CustomFood, SupplementLog, RegenerationLog, SleepLog, DailyNote, TrainingLog, BodyCompositionLog } from '@/constants/types';
import { WeightCuttingScience } from '@/utils/scientificCalculations';
import type { SafetyStatus, DailyWeightCutPlan, BodyCompositionEstimate, MetabolicData } from '@/utils/scientificCalculations';
import type { PrepPhase, PhaseInfo, RWLProtocol, REGENProtocol, WeighInRecord, MacroCyclingPlan, SupplementSchedule } from '@/constants/types';
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
  const [weighInRecords, setWeighInRecords] = useState<WeighInRecord[]>([]);

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
        try {
          await loadProfileFromBackend(session.user.id);
        } catch (error) {
          console.error('[AppContext] Error loading profile after sign in:', error);
        }
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
      
      const [backendProfile, backendWeightLogs] = await Promise.all([
        trpcClient.profile.get.query({ userId }),
        trpcClient.weightLogs.list.query({ userId })
      ]);
      
      if (backendProfile) {
        console.log('[AppContext] Profile loaded from backend:', backendProfile.id);
        setProfile(backendProfile);
        
        const currentSettings = await AsyncStorage.getItem('settings');
        const parsedSettings = currentSettings ? JSON.parse(currentSettings) : DEFAULT_SETTINGS;
        const updatedSettings = { ...parsedSettings, hasCompletedOnboarding: true };
        setSettings(updatedSettings);
        
        await Promise.all([
          AsyncStorage.setItem('profile', JSON.stringify(backendProfile)),
          AsyncStorage.setItem('settings', JSON.stringify(updatedSettings))
        ]);
      } else {
        console.log('[AppContext] No profile found in backend for user:', userId);
      }

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
      
      const [storedSettings, storedProfile, storedFights, storedWeightLogs, storedHydrationLogs, storedMealLogs, storedCustomFoods, storedSupplementLogs, storedRegenerationLogs, storedSleepLogs, storedDailyNotes, storedTrainingLogs, storedBodyCompositionLogs, storedDangerBannerDismissed, storedWeighInRecords] =
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
          AsyncStorage.getItem('weighInRecords'),
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
      if (storedWeighInRecords) {
        const parsedRecords = JSON.parse(storedWeighInRecords);
        console.log('[AppContext] Loaded', parsedRecords.length, 'weigh-in records');
        setWeighInRecords(parsedRecords.map((r: WeighInRecord) => ({
          ...r,
          weighInTime: new Date(r.weighInTime),
          regenProtocolStarted: r.regenProtocolStarted ? new Date(r.regenProtocolStarted) : undefined,
          fightTime: r.fightTime ? new Date(r.fightTime) : undefined,
        })));
      }
      console.log('[AppContext] Finished loading stored data');
      
      if (session?.user) {
        console.log('[AppContext] User is signed in, loading data from backend');
        try {
          await loadProfileFromBackend(session.user.id);
        } catch (error) {
          console.error('[AppContext] Error loading profile during initial load:', error);
        }
      }
    } catch (error) {
      console.error('[AppContext] Error loading stored data:', error);
    } finally {
      setIsLoading(false);
      console.log('[AppContext] App loading completed');
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
    if (!profile) {
      console.error('[AppContext] Cannot add fight without profile');
      return;
    }

    try {
      console.log('[AppContext] Syncing fight to backend...');
      const backendFight = await trpcClient.fights.add.mutate({
        userId: profile.id,
        name: fight.name,
        opponent: fight.opponent,
        weightClass: fight.weightClass,
        targetWeightForFight: fight.targetWeightForFight,
        date: fight.date,
        weighInTime: fight.weighInTime,
        location: fight.location,
        notes: fight.notes,
      });
      console.log('[AppContext] Fight synced to backend successfully');

      const newFight: Fight = {
        id: backendFight.id,
        name: backendFight.name,
        opponent: backendFight.opponent,
        weightClass: backendFight.weightClass,
        targetWeightForFight: backendFight.targetWeightForFight,
        date: backendFight.date,
        weighInTime: backendFight.weighInTime,
        weighInTiming: 'dayBefore' as const,
        location: backendFight.location,
        notes: backendFight.notes,
      };

      const updated = [...fights, newFight];
      setFights(updated);
      await AsyncStorage.setItem('fights', JSON.stringify(updated));

      const isFirstFight = fights.length === 0;
      const updatedProfile = { 
        ...profile, 
        targetWeight: fight.targetWeightForFight,
        startingWeight: isFirstFight ? profile.currentWeight : profile.startingWeight,
        weightClass: fight.weightClass,
        targetFightDate: fight.date,
        cuttingStartDate: isFirstFight ? new Date() : profile.cuttingStartDate,
      } as UserProfile;
      console.log('[AppContext] Fight added - isFirstFight:', isFirstFight, 'startingWeight:', updatedProfile.startingWeight, 'currentWeight:', profile.currentWeight, 'targetWeight:', fight.targetWeightForFight);
      setProfile(updatedProfile);
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      
      try {
        await trpcClient.profile.sync.mutate(updatedProfile);
        console.log('[AppContext] Updated profile synced to backend after adding fight');
      } catch (error) {
        console.error('[AppContext] Failed to sync updated profile to backend:', error);
      }
    } catch (error) {
      console.error('[AppContext] Failed to sync fight to backend:', error);
      const newFight: Fight = {
        ...fight,
        id: Date.now().toString(),
      };
      const updated = [...fights, newFight];
      setFights(updated);
      await AsyncStorage.setItem('fights', JSON.stringify(updated));
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

      const updatedProfile = { ...profile, currentWeight: weight } as UserProfile;
      console.log('[AppContext] Weight logged - currentWeight:', weight, 'time:', time, 'startingWeight:', updatedProfile.startingWeight, 'targetWeight:', updatedProfile.targetWeight);
      setProfile(updatedProfile);
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      
      try {
        await trpcClient.profile.sync.mutate(updatedProfile);
        console.log('[AppContext] Updated profile synced to backend');
      } catch (error) {
        console.error('[AppContext] Failed to sync updated profile to backend:', error);
      }
    } else {
      console.log('[AppContext] Weight log added locally without profile');
    }
  }, [weightLogs, profile]);

  const deleteWeightLog = useCallback(async (id: string) => {
    const updated = weightLogs.filter((l) => l.id !== id);
    setWeightLogs(updated);
    await AsyncStorage.setItem('weightLogs', JSON.stringify(updated));
  }, [weightLogs]);

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

  const deleteHydrationLog = useCallback(async (id: string) => {
    const updated = hydrationLogs.filter((l) => l.id !== id);
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

  const deleteSleepLog = useCallback(async (id: string) => {
    const updated = sleepLogs.filter((l) => l.id !== id);
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

  const deleteDailyNote = useCallback(async (id: string) => {
    const updated = dailyNotes.filter((n) => n.id !== id);
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

  const deleteTrainingLog = useCallback(async (id: string) => {
    const updated = trainingLogs.filter((l) => l.id !== id);
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

  const deleteBodyCompositionLog = useCallback(async (id: string) => {
    const updated = bodyCompositionLogs.filter((l) => l.id !== id);
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

  const getCurrentPhase = useCallback((): PhaseInfo | null => {
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight || !profile) return null;

    const now = new Date();
    const daysUntilFight = Math.ceil((upcomingFight.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const activeWeighIn = weighInRecords.find(r => r.fightId === upcomingFight.id);
    if (activeWeighIn?.regenProtocolStarted) {
      const fightTime = activeWeighIn.fightTime || upcomingFight.date;
      const hoursUntilFight = Math.max(0, Math.ceil((fightTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
      
      if (now < fightTime) {
        return {
          phase: 'RECOVERY',
          startDate: activeWeighIn.weighInTime,
          endDate: fightTime,
          daysRemaining: 0,
          description: `Obnova výkonu - zbývá ${hoursUntilFight}h do zápasu`,
        };
      }
    }

    if (daysUntilFight <= 7 && daysUntilFight >= 1) {
      return {
        phase: 'WATER_CUT',
        startDate: new Date(upcomingFight.date.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: upcomingFight.date,
        daysRemaining: daysUntilFight,
        description: `Shazování váhy vodou - D-${daysUntilFight}`,
      };
    }

    if (daysUntilFight > 7) {
      const cuttingStart = profile.cuttingStartDate || new Date();
      return {
        phase: 'WEIGHT_LOSS',
        startDate: cuttingStart,
        endDate: new Date(upcomingFight.date.getTime() - 7 * 24 * 60 * 60 * 1000),
        daysRemaining: daysUntilFight,
        description: `Dlouhodobé hubnutí - ${daysUntilFight} dní do zápasu`,
      };
    }

    return {
      phase: 'MAINTENANCE',
      startDate: now,
      endDate: undefined,
      daysRemaining: 0,
      description: 'Udržovací režim',
    };
  }, [profile, getUpcomingFight, weighInRecords]);

  const getRWLProtocol = useCallback((daysOut: number): RWLProtocol | null => {
    if (daysOut < 1 || daysOut > 7) return null;

    const protocols: Record<number, RWLProtocol> = {
      7: {
        day: 7,
        daysOut: 7,
        waterTargetMl: 8000,
        sodiumTargetMg: 5000,
        potassiumTargetMg: 4000,
        magnesiumTargetMg: 500,
        phase: 'loading',
        instructions: [
          'Pij minimálně 8L vody rozdělených do celého dne',
          'Přidej 5000mg sodíku (slané roztoky, ORS)',
          'Udržuj vysoký příjem draslíku a hořčíku',
          'Trénuj normálně, ale kontroluj intenzitu',
        ],
        warnings: ['Klíčová fáze načtení - nesmíš ji vynechat!'],
      },
      6: {
        day: 6,
        daysOut: 6,
        waterTargetMl: 8000,
        sodiumTargetMg: 4500,
        potassiumTargetMg: 3500,
        magnesiumTargetMg: 450,
        phase: 'loading',
        instructions: [
          'Pokračuj v high-load protokolu',
          'Udržuj 8L vody',
          '4500mg sodíku během dne',
          'Mírné snížení tréninkové intenzity',
        ],
      },
      5: {
        day: 5,
        daysOut: 5,
        waterTargetMl: 5000,
        sodiumTargetMg: 2500,
        potassiumTargetMg: 3000,
        magnesiumTargetMg: 400,
        phase: 'medium',
        instructions: [
          'Sníž vodu na 5L',
          'Sníž sodík na 2500mg',
          'Udržuj vyváženou elektrickou rovnováhu',
          'Další snížení tréninkové intenzity',
        ],
      },
      4: {
        day: 4,
        daysOut: 4,
        waterTargetMl: 5000,
        sodiumTargetMg: 1500,
        potassiumTargetMg: 2500,
        magnesiumTargetMg: 350,
        phase: 'medium',
        instructions: [
          'Udržuj 5L vody',
          'Další pokles sodíku na 1500mg',
          'Zaměř se na kvalitní odpočinek',
        ],
      },
      3: {
        day: 3,
        daysOut: 3,
        waterTargetMl: 2000,
        sodiumTargetMg: 500,
        potassiumTargetMg: 2000,
        magnesiumTargetMg: 300,
        phase: 'cutting',
        instructions: [
          'KLÍČOVÝ DEN - sníž vodu na 2L max',
          'Drasticky sníž sodík pod 500mg',
          'Žádné zpracované potraviny',
          'Minimalizuj objem stravy - jez jen lehce stravitelné',
          'Jen lehký pohyb, žádný tvrdý trénink',
        ],
        warnings: [
          'Začne diuréza - budeš často na toaletě',
          'Jsou očekávány symptomy jako únava',
        ],
      },
      2: {
        day: 2,
        daysOut: 2,
        waterTargetMl: 1000,
        sodiumTargetMg: 300,
        potassiumTargetMg: 1500,
        magnesiumTargetMg: 250,
        phase: 'cutting',
        instructions: [
          'Maximálně 1L vody',
          'Téměř nulový sodík (pod 300mg)',
          'Odstraň veškerou objemnou stravu (zelenina, celozrnné)',
          'Žádný trénink, jen lehké protažení',
        ],
        warnings: [
          'Pokračující diuréza',
          'Vyhni se přehřátí',
        ],
      },
      1: {
        day: 1,
        daysOut: 1,
        waterTargetMl: 500,
        sodiumTargetMg: 0,
        phase: 'final',
        instructions: [
          'FINÁLNÍ DEN - méně než 0.5L vody',
          'NULOVÝ sodík',
          'Jen minimální strava (pokud vůbec)',
          'Odpočívej, šetři energii',
          'Pokud potřebuješ doladit poslední kg: krátké saunové intervaly (max 15-20min)',
        ],
        warnings: [
          'KRITICKÉ: Nepoužívej saunu déle než 20min bez přestávky',
          'Sleduj své tělo - při závratích OKAMŽITĚ přestaň',
          'Měj trenéra/partnera poblíž',
        ],
      },
    };

    return protocols[daysOut] || null;
  }, []);

  const getREGENProtocol = useCallback((weighInWeight: number, targetWeight: number, weighInTime: Date, fightTime: Date): REGENProtocol[] => {
    const weightLost = weighInWeight - targetWeight;
    const totalFluidTarget = Math.round(weightLost * 1.5 * 1000);
    const bodyWeightKg = targetWeight;

    const now = new Date();
    const minutesSinceWeighIn = Math.floor((now.getTime() - weighInTime.getTime()) / (1000 * 60));

    const protocols: REGENProtocol[] = [
      {
        timeElapsedMinutes: 0,
        taskNumber: 1,
        taskTitle: 'Okamžitá Rehydratace (0-90min)',
        fluidTargetMl: Math.round(totalFluidTarget * 0.3),
        carbsTargetG: Math.round(bodyWeightKg * 0.4),
        proteinTargetG: Math.round(bodyWeightKg * 0.15),
        instructions: [
          `Vypij ${Math.round(totalFluidTarget * 0.3)}ml ORS/elektrolytů OKAMŽITĚ po vážení`,
          `Sněz ${Math.round(bodyWeightKg * 0.4)}g rychlých sacharidů (rýžové koláčky, banány)`,
          `Přidej ${Math.round(bodyWeightKg * 0.15)}g rychlého proteinu (whey)`,
          'Jez pomalu, v malých dávkách každých 15-20 minut',
        ],
        completed: minutesSinceWeighIn > 90,
      },
      {
        timeElapsedMinutes: 90,
        taskNumber: 2,
        taskTitle: 'Pokračující Hydratace (90-180min)',
        fluidTargetMl: Math.round(totalFluidTarget * 0.25),
        carbsTargetG: Math.round(bodyWeightKg * 0.5),
        proteinTargetG: Math.round(bodyWeightKg * 0.2),
        instructions: [
          `Vypij dalších ${Math.round(totalFluidTarget * 0.25)}ml tekutin`,
          `Sněz ${Math.round(bodyWeightKg * 0.5)}g sacharidů (bílé těstoviny, rýže)`,
          `Přidej ${Math.round(bodyWeightKg * 0.2)}g proteinu (kuřecí prsa, ryby)`,
          'Udržuj stabilní příjem každých 30 minut',
          'Vyhni se tučným jídlům a vláknině',
        ],
        completed: minutesSinceWeighIn > 180,
      },
      {
        timeElapsedMinutes: 180,
        taskNumber: 3,
        taskTitle: 'Optimalizace Glykogenu (3-6h)',
        fluidTargetMl: Math.round(totalFluidTarget * 0.25),
        carbsTargetG: Math.round(bodyWeightKg * 0.6),
        proteinTargetG: Math.round(bodyWeightKg * 0.25),
        instructions: [
          `Dodej dalších ${Math.round(totalFluidTarget * 0.25)}ml tekutin`,
          `Cíl: ${Math.round(bodyWeightKg * 0.6)}g sacharidů (rýžové kaše, těstoviny)`,
          `Udržuj příjem proteinu: ${Math.round(bodyWeightKg * 0.25)}g`,
          'Začni přidávat mírně tučnější zdroje pro nasycení',
          'Suplementace: 6-8g L-Citrulinu pro vazodilataci',
          'Kreatin: Zahaj loading 10-15g',
        ],
        completed: minutesSinceWeighIn > 360,
      },
      {
        timeElapsedMinutes: 360,
        taskNumber: 4,
        taskTitle: 'Udržovací Fáze (6-12h)',
        fluidTargetMl: Math.round(totalFluidTarget * 0.15),
        carbsTargetG: Math.round(bodyWeightKg * 0.3),
        proteinTargetG: Math.round(bodyWeightKg * 0.15),
        instructions: [
          `Dopij zbývajících ${Math.round(totalFluidTarget * 0.15)}ml`,
          'Lehčí jídla s vysokým obsahem sacharidů',
          'Začni snižovat objem stravy',
          'Zaměř se na kvalitní odpočinek a spánek',
          'Vyhni se nadměrnému příjmu těsně před spánkem',
        ],
        completed: minutesSinceWeighIn > 720,
      },
      {
        timeElapsedMinutes: 720,
        taskNumber: 5,
        taskTitle: 'Pre-Fight Finalizace (12h až zápas)',
        fluidTargetMl: Math.round(totalFluidTarget * 0.05),
        carbsTargetG: Math.round(bodyWeightKg * 0.2),
        instructions: [
          'Minimální příjem tekutin - jen podle pocitu žízně',
          'Lehké snídaně/svačiny s rychlými cukry',
          '2-3h před zápasem: Poslední lehké jídlo',
          '60-90min před: Energy gel nebo banán',
          'Během warm-upu: Malé doušky vody s elektrolyty',
        ],
        completed: now >= fightTime,
      },
    ];

    return protocols;
  }, []);

  const recordWeighIn = useCallback(async (fightId: string, weighInWeight: number, targetWeight: number, fightTime?: Date): Promise<WeighInRecord> => {
    const upcomingFight = fights.find(f => f.id === fightId);
    if (!upcomingFight) {
      throw new Error('Fight not found');
    }

    const newRecord: WeighInRecord = {
      id: Date.now().toString(),
      fightId,
      weighInWeight,
      weighInTime: new Date(),
      targetWeight,
      successful: weighInWeight <= targetWeight,
      fightTime: fightTime || upcomingFight.date,
    };

    const updated = [...weighInRecords, newRecord];
    setWeighInRecords(updated);
    await AsyncStorage.setItem('weighInRecords', JSON.stringify(updated));

    console.log('[AppContext] Weigh-in recorded:', newRecord);
    return newRecord;
  }, [fights, weighInRecords]);

  const startREGENProtocol = useCallback(async (weighInRecordId: string) => {
    const record = weighInRecords.find(r => r.id === weighInRecordId);
    if (!record) {
      throw new Error('Weigh-in record not found');
    }

    const updatedRecord = {
      ...record,
      regenProtocolStarted: new Date(),
    };

    const updated = weighInRecords.map(r => r.id === weighInRecordId ? updatedRecord : r);
    setWeighInRecords(updated);
    await AsyncStorage.setItem('weighInRecords', JSON.stringify(updated));

    console.log('[AppContext] REGEN protocol started for weigh-in:', weighInRecordId);
    return updatedRecord;
  }, [weighInRecords]);

  const getActiveREGENProtocol = useCallback((): { record: WeighInRecord; protocols: REGENProtocol[] } | null => {
    const upcomingFight = getUpcomingFight();
    if (!upcomingFight) return null;

    const activeRecord = weighInRecords.find(
      r => r.fightId === upcomingFight.id && r.regenProtocolStarted
    );

    if (!activeRecord || !activeRecord.regenProtocolStarted || !activeRecord.fightTime) {
      return null;
    }

    const protocols = getREGENProtocol(
      activeRecord.weighInWeight,
      activeRecord.targetWeight,
      activeRecord.weighInTime,
      activeRecord.fightTime
    );

    return { record: activeRecord, protocols };
  }, [weighInRecords, getUpcomingFight, getREGENProtocol]);

  const signOut = useCallback(async () => {
    console.log('[AppContext] Signing out...');
    
    console.log('[AppContext] Clearing local state...');
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
    setWeighInRecords([]);
    
    console.log('[AppContext] Clearing AsyncStorage...');
    try {
      await AsyncStorage.multiRemove(['profile', 'fights', 'weightLogs', 'hydrationLogs', 'mealLogs', 'customFoods', 'supplementLogs', 'regenerationLogs', 'sleepLogs', 'dailyNotes', 'trainingLogs', 'bodyCompositionLogs', 'subscriptionState', 'dangerBannerDismissed', 'weighInRecords']);
      console.log('[AppContext] AsyncStorage cleared successfully');
    } catch (error) {
      console.error('[AppContext] Error clearing AsyncStorage:', error);
    }
    
    console.log('[AppContext] Resetting onboarding...');
    await updateSettings({ hasCompletedOnboarding: false });
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('[AppContext] Supabase signOut error:', error);
        throw error;
      } else {
        console.log('[AppContext] Successfully signed out from Supabase');
      }
    } catch (error) {
      console.error('[AppContext] Error signing out from Supabase:', error);
      throw error;
    }
    
    console.log('[AppContext] Sign out complete - local data cleared, onboarding reset, subscription state cleared');
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
    weighInRecords,
    t,
    setLanguage,
    updateSettings,
    completeOnboarding,
    updateProfile,
    addFight,
    updateFight,
    deleteFight,
    addWeightLog,
    deleteWeightLog,
    addHydrationLog,
    deleteHydrationLog,
    addSupplementLog,
    deleteSupplementLog,
    getTodaySupplements,
    addRegenerationLog,
    getTodayRegeneration,
    addSleepLog,
    deleteSleepLog,
    getTodaySleep,
    addDailyNote,
    deleteDailyNote,
    getTodayNote,
    addTrainingLog,
    deleteTrainingLog,
    getTodayTrainings,
    addBodyCompositionLog,
    deleteBodyCompositionLog,
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
    getCurrentPhase,
    getRWLProtocol,
    getREGENProtocol,
    recordWeighIn,
    startREGENProtocol,
    getActiveREGENProtocol,
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
    deleteWeightLog,
    addHydrationLog,
    deleteHydrationLog,
    addSupplementLog,
    deleteSupplementLog,
    getTodaySupplements,
    addRegenerationLog,
    getTodayRegeneration,
    addSleepLog,
    deleteSleepLog,
    getTodaySleep,
    addDailyNote,
    deleteDailyNote,
    getTodayNote,
    addTrainingLog,
    deleteTrainingLog,
    getTodayTrainings,
    addBodyCompositionLog,
    deleteBodyCompositionLog,
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
    weighInRecords,
    getCurrentPhase,
    getRWLProtocol,
    getREGENProtocol,
    recordWeighIn,
    startREGENProtocol,
    getActiveREGENProtocol,
    signOut,
  ]);
});
