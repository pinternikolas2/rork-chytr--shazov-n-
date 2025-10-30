import { Language } from './translations';

export type UserRole = 'fighter' | 'coach';

export type Gender = 'male' | 'female';

export type Discipline = 'mma' | 'boxing' | 'wrestling' | 'bjj' | 'muayThai' | 'kickboxing';

export type TrainingIntensity = 'low' | 'moderate' | 'high' | 'professional';

export type DietType = 'standard' | 'keto' | 'paleo' | 'vegetarian' | 'vegan' | 'other';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  age: number;
  height: number;
  gender: Gender;
  discipline: Discipline;
}

export interface FighterProfile extends UserProfile {
  role: 'fighter';
  currentWeight: number;
  targetWeight: number;
  weightClass: string;
  cuttingStartDate?: Date;
  dietType: DietType;
  trainingIntensity: TrainingIntensity;
  hasPreviousExperience: boolean;
  trainerName?: string;
  profilePhotoUri?: string;
  coachId?: string;
}

export interface CoachProfile extends UserProfile {
  role: 'coach';
  linkedFighters: string[];
  isPremium: boolean;
  subscriptionEndDate?: Date;
  profilePhotoUri?: string;
  certifications?: string[];
  yearsOfExperience?: number;
  specializations?: Discipline[];
}

export type WeighInTiming = 'dayOf' | 'dayBefore';

export interface Fight {
  id: string;
  name: string;
  opponent: string;
  weightClass: string;
  date: Date;
  weighInTime?: Date;
  weighInTiming: WeighInTiming;
  location?: string;
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: Date;
  weight: number;
  time: 'morning' | 'evening';
  bodyFatPercentage?: number;
  notes?: string;
}

export interface HydrationLog {
  id: string;
  date: Date;
  amount: number;
  sodiumMg?: number;
}

export interface MealLog {
  id: string;
  date: Date;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodiumMg: number;
  notes?: string;
}

export interface DailyProgress {
  date: Date;
  weight?: number;
  hydration: number;
  calories?: number;
  sodium?: number;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface AppSettings {
  language: Language;
  theme: 'light' | 'dark';
  notifications: boolean;
  hasCompletedOnboarding: boolean;
  reminderTime?: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface SubscriptionInfo {
  isActive: boolean;
  type: 'free' | 'monthly' | 'annual';
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  autoRenew: boolean;
}
