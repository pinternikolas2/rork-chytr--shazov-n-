import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const profileSchema = z.object({
  id: z.string(),
  role: z.enum(['fighter']),
  fullName: z.string(),
  age: z.number(),
  height: z.number(),
  gender: z.enum(['male', 'female', 'other']),
  discipline: z.enum(['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing']),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  startingWeight: z.number().optional(),
  targetFightDate: z.date().optional(),
  cuttingStartDate: z.date().optional(),
  dietType: z.enum(['standard', 'keto', 'paleo', 'vegetarian', 'vegan', 'other']).optional(),
  trainingIntensity: z.enum(['low', 'moderate', 'high', 'professional']).optional(),
  trainingsPerWeek: z.number().optional(),
  hasPreviousExperience: z.boolean().optional(),
  trainerName: z.string().optional(),
  profilePhotoUri: z.string().optional(),
});

export const syncProfileProcedure = publicProcedure
  .input(profileSchema)
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: input.id,
        role: input.role,
        full_name: input.fullName,
        age: input.age,
        height: input.height,
        gender: input.gender,
        discipline: input.discipline,
        current_weight: input.currentWeight,
        target_weight: input.targetWeight,
        starting_weight: input.startingWeight,
        target_fight_date: input.targetFightDate,
        cutting_start_date: input.cuttingStartDate,
        diet_type: input.dietType,
        training_intensity: input.trainingIntensity,
        trainings_per_week: input.trainingsPerWeek,
        has_previous_experience: input.hasPreviousExperience,
        trainer_name: input.trainerName,
        profile_photo_uri: input.profilePhotoUri,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing profile:', error);
      throw new Error(`Failed to sync profile: ${error.message}`);
    }

    return data;
  });

export const getProfileProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', input.userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      role: data.role,
      fullName: data.full_name,
      age: data.age,
      height: data.height,
      gender: data.gender,
      discipline: data.discipline,
      currentWeight: data.current_weight,
      targetWeight: data.target_weight,
      startingWeight: data.starting_weight,
      targetFightDate: data.target_fight_date ? new Date(data.target_fight_date) : undefined,
      cuttingStartDate: data.cutting_start_date ? new Date(data.cutting_start_date) : undefined,
      dietType: data.diet_type,
      trainingIntensity: data.training_intensity,
      trainingsPerWeek: data.trainings_per_week,
      hasPreviousExperience: data.has_previous_experience,
      trainerName: data.trainer_name,
      profilePhotoUri: data.profile_photo_uri,
    };
  });
