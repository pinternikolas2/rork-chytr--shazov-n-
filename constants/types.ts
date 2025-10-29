import { Language } from './translations';

export type UserRole = 'fighter' | 'coach';

export type Gender = 'male' | 'female' | 'other';

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
}

export interface Fight {
  id: string;
  name: string;
  opponent: string;
  weightClass: string;
  date: Date;
  weighInTime?: Date;
  location?: string;
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: Date;
  weight: number;
  time: 'morning' | 'evening';
}

export interface HydrationLog {
  id: string;
  date: Date;
  amount: number;
}

export interface AppSettings {
  language: Language;
  theme: 'light' | 'dark';
  notifications: boolean;
  hasCompletedOnboarding: boolean;
}
