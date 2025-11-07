import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const weightLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  weight: z.number(),
  time: z.enum(['morning', 'evening']),
  bodyFatPercentage: z.number().optional(),
  notes: z.string().optional(),
});

export const addWeightLogProcedure = publicProcedure
  .input(weightLogSchema.omit({ id: true }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: input.userId,
        date: input.date,
        weight: input.weight,
        time: input.time,
        body_fat_percentage: input.bodyFatPercentage,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding weight log:', error);
      throw new Error(`Failed to add weight log: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      weight: data.weight,
      time: data.time,
      bodyFatPercentage: data.body_fat_percentage,
      notes: data.notes,
    };
  });

export const getWeightLogsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', input.userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weight logs:', error);
      throw new Error(`Failed to fetch weight logs: ${error.message}`);
    }

    return data.map((log) => ({
      id: log.id,
      date: new Date(log.date),
      weight: log.weight,
      time: log.time,
      bodyFatPercentage: log.body_fat_percentage,
      notes: log.notes,
    }));
  });

export const deleteWeightLogProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('Error deleting weight log:', error);
      throw new Error(`Failed to delete weight log: ${error.message}`);
    }

    return { success: true };
  });
