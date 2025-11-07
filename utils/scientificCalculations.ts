import { UserProfile, WeightLog, MacroCyclingPlan, TrainingIntensityLevel, PrepPhase, TrainingLog } from '@/constants/types';

export interface WaterLoadingSchedule {
  daysOut: number;
  waterIntakeMl: number;
  sodiumMg: number;
  phase: 'loading' | 'maintenance' | 'tapering' | 'cutting';
  description: string;
}

export interface SafetyStatus {
  level: 'safe' | 'caution' | 'danger';
  message: string;
  recommendations: string[];
}

export interface DailyWeightCutPlan {
  date: Date;
  targetWeight: number;
  waterIntake: number;
  sodiumLimit: number;
  carbsGrams: number;
  calorieTarget: number;
  recommendations: string[];
}

export interface BodyCompositionEstimate {
  bodyFatPercentage: number;
  leanMass: number;
  fatMass: number;
  waterWeight: number;
}

export interface MetabolicData {
  bmr: number;
  tdee: number;
  recommendedDeficit: number;
  minCalories: number;
}

export class WeightCuttingScience {
  static calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female' | 'other'
  ): number {
    if (gender === 'male' || gender === 'other') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  static calculateTDEE(bmr: number, trainingIntensity: string): number {
    const multipliers = {
      low: 1.375,
      moderate: 1.55,
      high: 1.725,
      professional: 1.9,
    };
    return bmr * (multipliers[trainingIntensity as keyof typeof multipliers] || 1.55);
  }

  static getMetabolicData(profile: UserProfile): MetabolicData {
    const bmr = this.calculateBMR(
      profile.currentWeight,
      profile.height,
      profile.age,
      profile.gender
    );
    const tdee = this.calculateTDEE(bmr, profile.trainingIntensity);
    const recommendedDeficit = Math.min(tdee * 0.25, 750);
    const minCalories = bmr * 1.2;

    return {
      bmr,
      tdee,
      recommendedDeficit,
      minCalories,
    };
  }

  static estimateBodyComposition(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female' | 'other'
  ): BodyCompositionEstimate {
    let bodyFatPercentage: number;

    if (gender === 'male' || gender === 'other') {
      bodyFatPercentage = 1.2 * (weight / ((height / 100) ** 2)) + 0.23 * age - 16.2;
    } else {
      bodyFatPercentage = 1.2 * (weight / ((height / 100) ** 2)) + 0.23 * age - 5.4;
    }

    bodyFatPercentage = Math.max(5, Math.min(50, bodyFatPercentage));

    const fatMass = (weight * bodyFatPercentage) / 100;
    const leanMass = weight - fatMass;
    const waterWeight = leanMass * 0.73;

    return {
      bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
      leanMass: parseFloat(leanMass.toFixed(2)),
      fatMass: parseFloat(fatMass.toFixed(2)),
      waterWeight: parseFloat(waterWeight.toFixed(2)),
    };
  }

  static getSafeWeightLossRate(
    currentWeight: number,
    hasPreviousExperience: boolean
  ): number {
    const maxPercentPerWeek = hasPreviousExperience ? 1.0 : 0.75;
    return (currentWeight * maxPercentPerWeek) / 100;
  }

  static generateWaterLoadingSchedule(daysUntilWeighIn: number, bodyWeight: number): WaterLoadingSchedule[] {
    const baseWater = bodyWeight * 35;
    const schedule: WaterLoadingSchedule[] = [];

    for (let day = daysUntilWeighIn; day >= 0; day--) {
      let waterIntake: number;
      let sodiumMg: number;
      let phase: 'loading' | 'maintenance' | 'tapering' | 'cutting';
      let description: string;

      if (day >= 7) {
        phase = 'maintenance';
        waterIntake = baseWater;
        sodiumMg = 3000;
        description = 'Normal hydration - maintain consistent water intake';
      } else if (day >= 5) {
        phase = 'loading';
        waterIntake = baseWater * 1.5;
        sodiumMg = 3500;
        description = 'Water loading phase - increase intake to prime body';
      } else if (day === 4) {
        phase = 'loading';
        waterIntake = baseWater * 1.8;
        sodiumMg = 4000;
        description = 'Peak water loading - maximum hydration';
      } else if (day === 3) {
        phase = 'tapering';
        waterIntake = baseWater * 1.2;
        sodiumMg = 2000;
        description = 'Begin tapering - reduce sodium significantly';
      } else if (day === 2) {
        phase = 'tapering';
        waterIntake = baseWater * 0.5;
        sodiumMg = 1000;
        description = 'Deep taper - minimal sodium, reduced water';
      } else if (day === 1) {
        phase = 'cutting';
        waterIntake = baseWater * 0.25;
        sodiumMg = 500;
        description = 'Final cut - very limited water and sodium';
      } else {
        phase = 'cutting';
        waterIntake = 0;
        sodiumMg = 0;
        description = 'Weigh-in day - no water or sodium until after weigh-in';
      }

      schedule.push({
        daysOut: day,
        waterIntakeMl: Math.round(waterIntake),
        sodiumMg: Math.round(sodiumMg),
        phase,
        description,
      });
    }

    return schedule;
  }

  static generateWeightCutPlan(
    profile: UserProfile,
    fightDate: Date
  ): DailyWeightCutPlan[] {
    const now = new Date();
    const daysUntilFight = Math.ceil((fightDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeightToCut = profile.currentWeight - profile.targetWeight;

    if (daysUntilFight <= 0) return [];

    const metabolicData = this.getMetabolicData(profile);
    const waterSchedule = this.generateWaterLoadingSchedule(daysUntilFight, profile.currentWeight);

    const plan: DailyWeightCutPlan[] = [];
    const waterCutStartDay = 5;
    
    const fatLossDays = daysUntilFight > waterCutStartDay ? daysUntilFight - waterCutStartDay : 0;
    const dailyFatLoss = fatLossDays > 0 ? totalWeightToCut * 0.4 / fatLossDays : 0;

    for (let day = 0; day < daysUntilFight; day++) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const daysOut = daysUntilFight - day;
      const waterDay = waterSchedule.find(w => w.daysOut === daysOut);

      let targetWeight = profile.currentWeight - (dailyFatLoss * day);
      if (daysOut <= waterCutStartDay) {
        const waterCutProgress = (waterCutStartDay - daysOut) / waterCutStartDay;
        const waterCutAmount = totalWeightToCut * 0.6;
        targetWeight -= waterCutAmount * waterCutProgress;
      }

      const carbsMultiplier = daysOut <= 3 ? 0.5 : 1.0;
      const carbsGrams = Math.round((profile.currentWeight * 3 * carbsMultiplier));
      
      const calorieAdjustment = daysOut <= waterCutStartDay ? -300 : -500;
      const calorieTarget = Math.max(
        metabolicData.minCalories,
        metabolicData.tdee + calorieAdjustment
      );

      const recommendations: string[] = [];
      if (daysOut > 7) {
        recommendations.push('Maintain training intensity and normal nutrition');
        recommendations.push('Focus on technique and conditioning');
      } else if (daysOut > 5) {
        recommendations.push('Start water loading protocol');
        recommendations.push('Keep sodium normal to retain water');
      } else if (daysOut > 3) {
        recommendations.push('Continue water loading at peak levels');
        recommendations.push('Monitor body weight daily');
      } else if (daysOut === 3) {
        recommendations.push('Begin sodium reduction immediately');
        recommendations.push('Start carbohydrate depletion');
      } else if (daysOut === 2) {
        recommendations.push('Minimal sodium intake');
        recommendations.push('Light training only - preserve energy');
      } else if (daysOut === 1) {
        recommendations.push('Final water cut - sipping only if needed');
        recommendations.push('Consider hot bath or sauna if needed');
      } else {
        recommendations.push('Weigh-in day - no food or water until after weigh-in');
        recommendations.push('Have rehydration plan ready immediately after');
      }

      plan.push({
        date,
        targetWeight: parseFloat(targetWeight.toFixed(2)),
        waterIntake: waterDay?.waterIntakeMl || 0,
        sodiumLimit: waterDay?.sodiumMg || 0,
        carbsGrams,
        calorieTarget: Math.round(calorieTarget),
        recommendations,
      });
    }

    return plan;
  }

  static assessSafetyStatus(
    profile: UserProfile,
    recentWeightLogs: WeightLog[],
    daysUntilFight: number
  ): SafetyStatus {
    if (recentWeightLogs.length < 2) {
      return {
        level: 'safe',
        message: 'Not enough data to assess safety',
        recommendations: ['Continue logging weight daily for accurate tracking'],
      };
    }

    const sortedLogs = [...recentWeightLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestWeight = sortedLogs[0].weight;
    const previousWeight = sortedLogs[1].weight;
    
    const daysBetween = Math.ceil(
      (sortedLogs[0].date.getTime() - sortedLogs[1].date.getTime()) / (1000 * 60 * 60 * 24)
    ) || 1;
    
    const weightChange = previousWeight - latestWeight;
    const weeklyRate = (weightChange / daysBetween) * 7;
    const safeRate = this.getSafeWeightLossRate(latestWeight, profile.hasPreviousExperience);

    const totalWeightToCut = latestWeight - profile.targetWeight;
    const composition = this.estimateBodyComposition(
      latestWeight,
      profile.height,
      profile.age,
      profile.gender
    );

    const recommendations: string[] = [];
    let level: 'safe' | 'caution' | 'danger' = 'safe';
    let message = 'Weight cut is progressing safely';

    if (weeklyRate > safeRate * 1.5) {
      level = 'danger';
      message = 'Weight loss is too rapid - high risk of performance loss';
      recommendations.push('Immediately increase calorie intake');
      recommendations.push('Consult with a nutritionist or coach');
      recommendations.push('Consider adjusting target weight or timeline');
    } else if (weeklyRate > safeRate * 1.2) {
      level = 'caution';
      message = 'Weight loss rate is higher than recommended';
      recommendations.push('Slightly increase daily calories');
      recommendations.push('Monitor energy levels and performance closely');
    }

    if (daysUntilFight <= 7 && totalWeightToCut > latestWeight * 0.08) {
      level = level === 'danger' ? 'danger' : 'caution';
      message = 'Large weight cut remaining with limited time';
      recommendations.push('Begin aggressive water manipulation protocol');
      recommendations.push('Reduce training volume to preserve energy');
      recommendations.push('Consider professional supervision');
    }

    if (composition.bodyFatPercentage < 8 && profile.gender === 'male') {
      level = 'caution';
      recommendations.push('Body fat is very low - be cautious with further cutting');
    }

    if (daysUntilFight > 7 && totalWeightToCut <= 0) {
      message = 'Weight goal achieved - focus on maintenance';
      recommendations.push('Maintain current weight until water cut phase');
      recommendations.push('Keep nutrition consistent and balanced');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current protocol');
      recommendations.push('Maintain consistent hydration and nutrition');
      recommendations.push('Monitor daily weight at the same time each morning');
    }

    return { level, message, recommendations };
  }

  static generateRecoveryProtocol(
    profile: UserProfile,
    hoursUntilFight: number
  ): {
    timeline: {
      hour: number;
      action: string;
      details: string;
    }[];
    totalFluidMl: number;
    totalCalories: number;
  } {
    const timeline = [];
    const weightCut = profile.currentWeight - profile.targetWeight;
    const totalFluidNeeded = weightCut * 1500;

    if (hoursUntilFight >= 24) {
      timeline.push({
        hour: 0,
        action: 'Immediate rehydration',
        details: `Drink 500ml electrolyte solution (with sodium and potassium) immediately after weigh-in`,
      });
      timeline.push({
        hour: 1,
        action: 'First meal',
        details: 'Light meal: white rice, banana, lean protein. ~400 calories',
      });
      timeline.push({
        hour: 2,
        action: 'Hydration',
        details: 'Drink 500ml water with electrolytes',
      });
      timeline.push({
        hour: 4,
        action: 'Second meal',
        details: 'Moderate meal: pasta, lean meat, vegetables. ~600 calories',
      });
      timeline.push({
        hour: 6,
        action: 'Continuous hydration',
        details: 'Continue sipping water - aim for 250ml per hour',
      });
      timeline.push({
        hour: 8,
        action: 'Third meal',
        details: 'Full meal: complex carbs, protein, healthy fats. ~800 calories',
      });
      timeline.push({
        hour: 12,
        action: 'Pre-sleep snack',
        details: 'Light snack: Greek yogurt with honey. ~300 calories',
      });
      timeline.push({
        hour: 20,
        action: 'Fight day breakfast',
        details: 'Easy-to-digest meal: oatmeal, eggs, fruit. ~500 calories',
      });
      timeline.push({
        hour: 23,
        action: 'Pre-fight meal',
        details: 'Final light meal 1 hour before fight: banana, rice cakes. ~200 calories',
      });
    } else {
      timeline.push({
        hour: 0,
        action: 'Rapid rehydration',
        details: `Drink 750ml electrolyte solution immediately`,
      });
      timeline.push({
        hour: 1,
        action: 'Quick energy',
        details: 'Fast-digesting carbs: white bread, honey, banana. ~300 calories',
      });
      timeline.push({
        hour: 2,
        action: 'Continue hydration',
        details: 'Drink 500ml water with electrolytes',
      });
      timeline.push({
        hour: 4,
        action: 'Final pre-fight nutrition',
        details: 'Small meal: rice, chicken, minimal fiber. ~400 calories',
      });
    }

    return {
      timeline,
      totalFluidMl: Math.round(totalFluidNeeded),
      totalCalories: hoursUntilFight >= 24 ? 2800 : 1200,
    };
  }

  static getDailyHydrationGoal(
    bodyWeight: number,
    daysUntilWeighIn: number,
    trainingIntensity: string
  ): number {
    const schedule = this.generateWaterLoadingSchedule(daysUntilWeighIn, bodyWeight);
    const todaySchedule = schedule.find(s => s.daysOut === daysUntilWeighIn);
    
    if (!todaySchedule) {
      const baseWater = bodyWeight * 35;
      const trainingMultiplier = trainingIntensity === 'professional' || trainingIntensity === 'high' 
        ? 1.2 
        : 1.0;
      return Math.round(baseWater * trainingMultiplier);
    }

    return todaySchedule.waterIntakeMl;
  }

  static generateMacroCyclingPlan(
    profile: UserProfile,
    phase: PrepPhase,
    trainingLogs: TrainingLog[],
    daysToGenerate: number = 7
  ): MacroCyclingPlan[] {
    const plan: MacroCyclingPlan[] = [];
    const metabolicData = this.getMetabolicData(profile);
    
    const todayTraining = trainingLogs.filter(log => {
      const logDate = new Date(log.date);
      const today = new Date();
      logDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const avgIntensity: TrainingIntensityLevel = todayTraining.length > 0 
      ? todayTraining[0].intensity 
      : 'medium';

    for (let day = 0; day < daysToGenerate; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      
      const dayTrainings = trainingLogs.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return logDate.getTime() === date.getTime();
      });

      const dayIntensity: TrainingIntensityLevel = dayTrainings.length > 0
        ? dayTrainings[0].intensity
        : avgIntensity;

      let calorieTarget: number;
      let proteinG: number;
      let carbsG: number;
      let fatG: number;
      let carbPercentage: number;
      let fatPercentage: number;
      let reasoning: string;

      const proteinPerKg = 2.2;
      proteinG = profile.currentWeight * proteinPerKg;

      if (phase === 'GWL') {
        if (dayIntensity === 'high' || dayIntensity === 'extreme') {
          calorieTarget = metabolicData.tdee - 300;
          const proteinCals = proteinG * 4;
          const remainingCals = calorieTarget - proteinCals;
          carbPercentage = 60;
          fatPercentage = 40;
          carbsG = (remainingCals * (carbPercentage / 100)) / 4;
          fatG = (remainingCals * (fatPercentage / 100)) / 9;
          reasoning = 'Vysoká intenzita - Zvýšený podíl sacharidů (60%) pro energii a výkon. Snížené tuky.';
        } else if (dayIntensity === 'medium') {
          calorieTarget = metabolicData.tdee - 400;
          const proteinCals = proteinG * 4;
          const remainingCals = calorieTarget - proteinCals;
          carbPercentage = 45;
          fatPercentage = 55;
          carbsG = (remainingCals * (carbPercentage / 100)) / 4;
          fatG = (remainingCals * (fatPercentage / 100)) / 9;
          reasoning = 'Střední intenzita - Vyvážené makro (45% S / 55% T) pro stabilní energii.';
        } else {
          calorieTarget = metabolicData.tdee - 500;
          const proteinCals = proteinG * 4;
          const remainingCals = calorieTarget - proteinCals;
          carbPercentage = 30;
          fatPercentage = 70;
          carbsG = (remainingCals * (carbPercentage / 100)) / 4;
          fatG = (remainingCals * (fatPercentage / 100)) / 9;
          reasoning = 'Nízká/Rest den - Snížené sacharidy (30%), zvýšené tuky (70%) pro spalování tuků.';
        }
      } else if (phase === 'RWL') {
        calorieTarget = metabolicData.tdee * 0.7;
        const proteinCals = proteinG * 4;
        const remainingCals = calorieTarget - proteinCals;
        carbPercentage = 40;
        fatPercentage = 60;
        carbsG = (remainingCals * (carbPercentage / 100)) / 4;
        fatG = (remainingCals * (fatPercentage / 100)) / 9;
        reasoning = 'RWL fáze - Mírné snížení kalorií, priorita na proteiny a elektrolyty.';
      } else if (phase === 'REGEN') {
        calorieTarget = metabolicData.tdee + 500;
        const proteinCals = proteinG * 4;
        const remainingCals = calorieTarget - proteinCals;
        carbPercentage = 70;
        fatPercentage = 30;
        carbsG = (remainingCals * (carbPercentage / 100)) / 4;
        fatG = (remainingCals * (fatPercentage / 100)) / 9;
        reasoning = 'REGEN - Vysoké sacharidy (70%) pro rychlé doplnění glykogenu po cutu.';
      } else {
        calorieTarget = metabolicData.tdee;
        const proteinCals = proteinG * 4;
        const remainingCals = calorieTarget - proteinCals;
        carbPercentage = 50;
        fatPercentage = 50;
        carbsG = (remainingCals * (carbPercentage / 100)) / 4;
        fatG = (remainingCals * (fatPercentage / 100)) / 9;
        reasoning = 'Maintenance - Vyvážená strava pro udržení váhy a výkonu.';
      }

      plan.push({
        date,
        trainingIntensity: dayIntensity,
        calorieTarget: Math.round(calorieTarget),
        proteinG: Math.round(proteinG),
        carbsG: Math.round(carbsG),
        fatG: Math.round(fatG),
        carbPercentage,
        fatPercentage,
        reasoning,
      });
    }

    return plan;
  }

  static calculateWeeklyWeightLossRate(
    recentWeightLogs: WeightLog[],
    currentWeight: number
  ): number {
    if (recentWeightLogs.length < 2) return 0;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekLogs = recentWeightLogs.filter(log => new Date(log.date) >= weekAgo);
    if (weekLogs.length < 2) return 0;
    
    const sortedLogs = weekLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const oldestWeight = sortedLogs[0].weight;
    const latestWeight = sortedLogs[sortedLogs.length - 1].weight;
    
    return oldestWeight - latestWeight;
  }

  static checkSafetyThreshold(
    weeklyLoss: number,
    currentWeight: number
  ): { isSafe: boolean; message: string; recommendedAdjustment: number } {
    const percentageLoss = (weeklyLoss / currentWeight) * 100;
    
    if (percentageLoss > 1.0) {
      const excessLoss = weeklyLoss - (currentWeight * 0.01);
      const calorieAdjustment = Math.round(excessLoss * 7700);
      
      return {
        isSafe: false,
        message: `NEBEZPEČNÉ TEMPO: ${percentageLoss.toFixed(1)}% týdenní ztráty. Hrozí ztráta svalové hmoty a pokles výkonu.`,
        recommendedAdjustment: calorieAdjustment,
      };
    }
    
    if (percentageLoss > 0.75) {
      return {
        isSafe: true,
        message: `Mírně rychlé tempo: ${percentageLoss.toFixed(1)}% týdně. Monitorujte výkon a energii.`,
        recommendedAdjustment: 100,
      };
    }
    
    return {
      isSafe: true,
      message: `Bezpečné tempo: ${percentageLoss.toFixed(1)}% týdně. Pokračujte v současném protokolu.`,
      recommendedAdjustment: 0,
    };
  }
}
