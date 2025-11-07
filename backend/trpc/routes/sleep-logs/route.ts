import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const sleepLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  hours: z.number(),
  quality: z.number().min(1).max(5),
  notes: z.string().optional(),
});

export const addSleepLogProcedure = publicProcedure
  .input(sleepLogSchema.omit({ id: true }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert({
        user_id: input.userId,
        date: input.date,
        hours: input.hours,
        quality: input.quality,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding sleep log:', error);
      throw new Error(`Failed to add sleep log: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      hours: data.hours,
      quality: data.quality,
      notes: data.notes,
    };
  });

export const getSleepLogsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', input.userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching sleep logs:', error);
      throw new Error(`Failed to fetch sleep logs: ${error.message}`);
    }

    return data.map((log) => ({
      id: log.id,
      date: new Date(log.date),
      hours: log.hours,
      quality: log.quality,
      notes: log.notes,
    }));
  });

export const deleteSleepLogProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('Error deleting sleep log:', error);
      throw new Error(`Failed to delete sleep log: ${error.message}`);
    }

    return { success: true };
  });
