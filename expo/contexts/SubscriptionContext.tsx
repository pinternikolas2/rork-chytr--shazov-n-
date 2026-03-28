import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type SubscriptionTier = 'free' | 'trial' | 'premium';

export interface SubscriptionState {
  tier: SubscriptionTier;
  trialStartDate?: Date;
  trialEndDate?: Date;
  premiumStartDate?: Date;
  premiumEndDate?: Date;
  hasSeenWelcome: boolean;
  hasSeenOnboarding: boolean;
}

const DEFAULT_STATE: SubscriptionState = {
  tier: 'free',
  hasSeenWelcome: false,
  hasSeenOnboarding: false,
};

const TRIAL_DAYS = 7;

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscriptionState = async () => {
    try {
      console.log('[SubscriptionContext] Loading subscription state...');
      const stored = await AsyncStorage.getItem('subscriptionState');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[SubscriptionContext] Loaded state:', parsed);
        
        const stateWithDates: SubscriptionState = {
          ...parsed,
          trialStartDate: parsed.trialStartDate ? new Date(parsed.trialStartDate) : undefined,
          trialEndDate: parsed.trialEndDate ? new Date(parsed.trialEndDate) : undefined,
          premiumStartDate: parsed.premiumStartDate ? new Date(parsed.premiumStartDate) : undefined,
          premiumEndDate: parsed.premiumEndDate ? new Date(parsed.premiumEndDate) : undefined,
        };
        
        const updatedState = checkAndUpdateTrialExpiry(stateWithDates);
        setState(updatedState);
        
        if (updatedState !== stateWithDates) {
          await AsyncStorage.setItem('subscriptionState', JSON.stringify(updatedState));
        }
      } else {
        console.log('[SubscriptionContext] No stored state, using defaults');
      }
    } catch (error) {
      console.error('[SubscriptionContext] Error loading state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndUpdateTrialExpiry = (currentState: SubscriptionState): SubscriptionState => {
    if (currentState.tier === 'trial' && currentState.trialEndDate) {
      const now = new Date();
      if (now > currentState.trialEndDate) {
        console.log('[SubscriptionContext] Trial expired, switching to free');
        return {
          ...currentState,
          tier: 'free',
        };
      }
    }
    return currentState;
  };

  const saveState = async (newState: SubscriptionState) => {
    setState(newState);
    await AsyncStorage.setItem('subscriptionState', JSON.stringify(newState));
    console.log('[SubscriptionContext] State saved:', newState);
  };

  const startTrial = useCallback(async () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    
    const newState: SubscriptionState = {
      ...state,
      tier: 'trial',
      trialStartDate: now,
      trialEndDate: endDate,
    };
    
    await saveState(newState);
    console.log('[SubscriptionContext] Trial started:', { start: now, end: endDate });
  }, [state]);

  const startPremium = useCallback(async (durationMonths: number = 1) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    const newState: SubscriptionState = {
      ...state,
      tier: 'premium',
      premiumStartDate: now,
      premiumEndDate: endDate,
    };
    
    await saveState(newState);
    console.log('[SubscriptionContext] Premium started:', { start: now, end: endDate, months: durationMonths });
  }, [state]);

  const cancelSubscription = useCallback(async () => {
    const newState: SubscriptionState = {
      ...state,
      tier: 'free',
    };
    
    await saveState(newState);
    console.log('[SubscriptionContext] Subscription cancelled');
  }, [state]);

  const markWelcomeSeen = useCallback(async () => {
    const newState: SubscriptionState = {
      ...state,
      hasSeenWelcome: true,
    };
    
    await saveState(newState);
    console.log('[SubscriptionContext] Welcome marked as seen');
  }, [state]);

  const markOnboardingSeen = useCallback(async () => {
    const newState: SubscriptionState = {
      ...state,
      hasSeenOnboarding: true,
    };
    
    await saveState(newState);
    console.log('[SubscriptionContext] Onboarding marked as seen');
  }, [state]);

  const skipWelcome = useCallback(async () => {
    const newState: SubscriptionState = {
      ...state,
      hasSeenWelcome: true,
      tier: 'free',
    };
    
    await saveState(newState);
    console.log('[SubscriptionContext] Welcome skipped, using free tier');
  }, [state]);

  const getTrialDaysRemaining = useCallback((): number => {
    if (state.tier !== 'trial' || !state.trialEndDate) return 0;
    
    const now = new Date();
    const diff = state.trialEndDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
  }, [state]);

  const isPremiumFeature = useCallback((featureName: string): boolean => {
    const premiumFeatures = [
      'ai_recognition',
      'ai_advisor',
      'advanced_analytics',
      'detailed_reports',
      'export_data',
      'unlimited_tracking',
      'meal_planning',
    ];
    
    return premiumFeatures.includes(featureName);
  }, []);

  const hasAccessToFeature = useCallback((featureName: string): boolean => {
    if (!isPremiumFeature(featureName)) return true;
    
    return state.tier === 'trial' || state.tier === 'premium';
  }, [state.tier, isPremiumFeature]);

  const isFeatureLocked = useCallback((featureName: string): boolean => {
    return isPremiumFeature(featureName) && !hasAccessToFeature(featureName);
  }, [isPremiumFeature, hasAccessToFeature]);

  return useMemo(() => ({
    state,
    isLoading,
    tier: state.tier,
    hasSeenWelcome: state.hasSeenWelcome,
    hasSeenOnboarding: state.hasSeenOnboarding,
    isPremium: state.tier === 'premium',
    isTrial: state.tier === 'trial',
    isFree: state.tier === 'free',
    trialDaysRemaining: getTrialDaysRemaining(),
    startTrial,
    startPremium,
    cancelSubscription,
    markWelcomeSeen,
    markOnboardingSeen,
    skipWelcome,
    hasAccessToFeature,
    isFeatureLocked,
    isPremiumFeature,
  }), [
    state,
    isLoading,
    getTrialDaysRemaining,
    startTrial,
    startPremium,
    cancelSubscription,
    markWelcomeSeen,
    markOnboardingSeen,
    skipWelcome,
    hasAccessToFeature,
    isFeatureLocked,
    isPremiumFeature,
  ]);
});
