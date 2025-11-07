import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const dailyNoteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  note: z.string(),
  energyLevel: z.number().min(1).max(5).optional(),
  waterRetention: z.number().min(1).max(5).optional(),
});

export const addDailyNoteProcedure = publicProcedure
  .input(dailyNoteSchema.omit({ id: true }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('daily_notes')
      .insert({
        user_id: input.userId,
        date: input.date,
        note: input.note,
        energy_level: input.energyLevel,
        water_retention: input.waterRetention,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding daily note:', error);
      throw new Error(`Failed to add daily note: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      note: data.note,
      energyLevel: data.energy_level,
      waterRetention: data.water_retention,
    };
  });

export const updateDailyNoteProcedure = publicProcedure
  .input(dailyNoteSchema)
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('daily_notes')
      .update({
        note: input.note,
        energy_level: input.energyLevel,
        water_retention: input.waterRetention,
      })
      .eq('id', input.id)
      .eq('user_id', input.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating daily note:', error);
      throw new Error(`Failed to update daily note: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      note: data.note,
      energyLevel: data.energy_level,
      waterRetention: data.water_retention,
    };
  });

export const getDailyNotesProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', input.userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching daily notes:', error);
      throw new Error(`Failed to fetch daily notes: ${error.message}`);
    }

    return data.map((note) => ({
      id: note.id,
      date: new Date(note.date),
      note: note.note,
      energyLevel: note.energy_level,
      waterRetention: note.water_retention,
    }));
  });

export const deleteDailyNoteProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from('daily_notes')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('Error deleting daily note:', error);
      throw new Error(`Failed to delete daily note: ${error.message}`);
    }

    return { success: true };
  });
