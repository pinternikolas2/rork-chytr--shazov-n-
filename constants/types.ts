import { Language } from './translations';

export type UserRole = 'fighter';

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
  currentWeight: number;
  targetWeight: number;
  startingWeight?: number;
  weightClass: string;
  targetFightDate?: Date;
  cuttingStartDate?: Date;
  dietType: DietType;
  trainingIntensity: TrainingIntensity;
  trainingsPerWeek: number;
  hasPreviousExperience: boolean;
  trainerName?: string;
  profilePhotoUri?: string;
}

export type WeighInTiming = 'dayOf' | 'dayBefore';

export interface Fight {
  id: string;
  name: string;
  opponent: string;
  weightClass: string;
  targetWeightForFight: number;
  date: Date;
  weighInTime?: Date;
  weighInTiming: WeighInTiming;
  location?: string;
  notes?: string;
  selectedPhase?: PrepPhase;
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
  potassiumMg?: number;
  magnesiumMg?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLog {
  id: string;
  date: Date;
  name: string;
  mealType?: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodiumMg: number;
  fiber?: number;
  notes?: string;
  imageUri?: string;
  customFoodId?: string;
}

export interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodiumMg: number;
  fiber?: number;
  servingSize?: string;
  servingSizeGrams?: number;
  category?: string;
  imageUri?: string;
  createdAt: Date;
  usageCount: number;
}

export type SupplementType = 'electrolytes' | 'protein' | 'creatine' | 'vitamins' | 'bcaa' | 'other';

export interface SupplementLog {
  id: string;
  date: Date;
  name: string;
  type: SupplementType;
  amount: string;
  notes?: string;
}

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface RegenerationLog {
  id: string;
  date: Date;
  energyLevel: EnergyLevel;
  moodLevel: MoodLevel;
  sleepQuality: SleepQuality;
  sleepHours?: number;
  muscleSoreness?: 1 | 2 | 3 | 4 | 5;
  stress?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface SleepLog {
  id: string;
  date: Date;
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export type TrainingType = 'strength' | 'cardio' | 'technique' | 'sparring' | 'other';
export type TrainingIntensityLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface TrainingLog {
  id: string;
  date: Date;
  type: TrainingType;
  duration: number;
  intensity: TrainingIntensityLevel;
  caloriesBurned?: number;
  notes?: string;
}

export interface BodyCompositionLog {
  id: string;
  date: Date;
  bodyFatPercentage?: number;
  muscleMass?: number;
  notes?: string;
}

export type WaterRetentionLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyNote {
  id: string;
  date: Date;
  note: string;
  energyLevel?: EnergyLevel;
  waterRetention?: WaterRetentionLevel;
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

export type PrepPhase = 'GWL' | 'RWL' | 'REGEN' | 'MAINTENANCE';

export interface PhaseInfo {
  phase: PrepPhase;
  startDate: Date;
  endDate?: Date;
  daysRemaining: number;
  description: string;
}

export interface RWLProtocol {
  day: number;
  daysOut: number;
  waterTargetMl: number;
  sodiumTargetMg: number;
  potassiumTargetMg?: number;
  magnesiumTargetMg?: number;
  phase: 'loading' | 'medium' | 'cutting' | 'final';
  instructions: string[];
  warnings?: string[];
}

export interface REGENProtocol {
  timeElapsedMinutes: number;
  taskNumber: number;
  taskTitle: string;
  fluidTargetMl: number;
  carbsTargetG: number;
  proteinTargetG?: number;
  instructions: string[];
  completed: boolean;
}

export interface MacroCyclingPlan {
  date: Date;
  trainingIntensity: TrainingIntensityLevel;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  carbPercentage: number;
  fatPercentage: number;
  reasoning: string;
}

export interface WeighInRecord {
  id: string;
  fightId: string;
  weighInWeight: number;
  weighInTime: Date;
  targetWeight: number;
  successful: boolean;
  regenProtocolStarted?: Date;
  fightTime?: Date;
}

export interface SupplementSchedule {
  supplementName: string;
  type: SupplementType;
  phase: PrepPhase;
  dosage: string;
  timing: string;
  action: 'start' | 'stop' | 'increase' | 'maintain';
  reasoning: string;
}
