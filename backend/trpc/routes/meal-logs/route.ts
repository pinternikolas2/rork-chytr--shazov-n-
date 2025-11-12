import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

const mealLogSchema = z.object({
  userId: z.string(),
  date: z.date(),
  name: z.string(),
  mealType: mealTypeSchema,
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  sodiumMg: z.number(),
  fiber: z.number().optional(),
  customFoodId: z.string().optional(),
  notes: z.string().optional(),
});

export const addMealLogProcedure = protectedProcedure
  .input(mealLogSchema)
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: input.userId,
        date: input.date.toISOString(),
        name: input.name,
        meal_type: input.mealType,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        sodium_mg: input.sodiumMg,
        fiber: input.fiber,
        custom_food_id: input.customFoodId,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding meal log:', error);
      throw new Error(`Failed to add meal log: ${error.message}`);
    }

    return data;
  });

export const getMealLogsProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', input.userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching meal logs:', error);
      throw new Error(`Failed to fetch meal logs: ${error.message}`);
    }

    return data.map((log) => ({
      id: log.id,
      userId: log.user_id,
      date: new Date(log.date),
      name: log.name,
      mealType: log.meal_type,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      sodiumMg: log.sodium_mg,
      fiber: log.fiber,
      customFoodId: log.custom_food_id,
      notes: log.notes,
      createdAt: new Date(log.created_at),
    }));
  });

export const updateMealLogProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      updates: mealLogSchema.partial().omit({ userId: true }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('meal_logs')
      .update({
        ...(input.updates.date && { date: input.updates.date.toISOString() }),
        ...(input.updates.name && { name: input.updates.name }),
        ...(input.updates.mealType && { meal_type: input.updates.mealType }),
        ...(input.updates.calories !== undefined && { calories: input.updates.calories }),
        ...(input.updates.protein !== undefined && { protein: input.updates.protein }),
        ...(input.updates.carbs !== undefined && { carbs: input.updates.carbs }),
        ...(input.updates.fat !== undefined && { fat: input.updates.fat }),
        ...(input.updates.sodiumMg !== undefined && { sodium_mg: input.updates.sodiumMg }),
        ...(input.updates.fiber !== undefined && { fiber: input.updates.fiber }),
        ...(input.updates.customFoodId && { custom_food_id: input.updates.customFoodId }),
        ...(input.updates.notes !== undefined && { notes: input.updates.notes }),
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal log:', error);
      throw new Error(`Failed to update meal log: ${error.message}`);
    }

    return data;
  });

export const deleteMealLogProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('Error deleting meal log:', error);
      throw new Error(`Failed to delete meal log: ${error.message}`);
    }

    return { success: true };
  });
