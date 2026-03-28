import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const hydrationLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  amount: z.number(),
  sodiumMg: z.number().optional(),
});

export const addHydrationLogProcedure = protectedProcedure
  .input(hydrationLogSchema.omit({ id: true }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('hydration_logs')
      .insert({
        user_id: input.userId,
        date: input.date,
        amount: input.amount,
        sodium_mg: input.sodiumMg,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding hydration log:', error);
      throw new Error(`Failed to add hydration log: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      amount: data.amount,
      sodiumMg: data.sodium_mg,
    };
  });

export const getHydrationLogsProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', input.userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching hydration logs:', error);
      throw new Error(`Failed to fetch hydration logs: ${error.message}`);
    }

    return data.map((log) => ({
      id: log.id,
      date: new Date(log.date),
      amount: log.amount,
      sodiumMg: log.sodium_mg,
    }));
  });

export const deleteHydrationLogProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from('hydration_logs')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('Error deleting hydration log:', error);
      throw new Error(`Failed to delete hydration log: ${error.message}`);
    }

    return { success: true };
  });
