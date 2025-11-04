import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

const fightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  opponent: z.string(),
  weightClass: z.string(),
  targetWeightForFight: z.number(),
  date: z.date(),
  weighInTime: z.date().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const addFightProcedure = publicProcedure
  .input(fightSchema.omit({ id: true }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('fights')
      .insert({
        user_id: input.userId,
        name: input.name,
        opponent: input.opponent,
        weight_class: input.weightClass,
        target_weight_for_fight: input.targetWeightForFight,
        date: input.date,
        weigh_in_time: input.weighInTime,
        location: input.location,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding fight:', error);
      throw new Error(`Failed to add fight: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      opponent: data.opponent,
      weightClass: data.weight_class,
      targetWeightForFight: data.target_weight_for_fight,
      date: new Date(data.date),
      weighInTime: data.weigh_in_time ? new Date(data.weigh_in_time) : undefined,
      location: data.location,
      notes: data.notes,
    };
  });

export const updateFightProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(),
    updates: fightSchema.omit({ id: true, userId: true }).partial(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const updateData: Record<string, unknown> = {};
    if (input.updates.name) updateData.name = input.updates.name;
    if (input.updates.opponent) updateData.opponent = input.updates.opponent;
    if (input.updates.weightClass) updateData.weight_class = input.updates.weightClass;
    if (input.updates.targetWeightForFight !== undefined) updateData.target_weight_for_fight = input.updates.targetWeightForFight;
    if (input.updates.date) updateData.date = input.updates.date;
    if (input.updates.weighInTime !== undefined) updateData.weigh_in_time = input.updates.weighInTime;
    if (input.updates.location !== undefined) updateData.location = input.updates.location;
    if (input.updates.notes !== undefined) updateData.notes = input.updates.notes;

    const { data, error } = await supabase
      .from('fights')
      .update(updateData)
      .eq('id', input.id)
      .eq('user_id', input.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating fight:', error);
      throw new Error(`Failed to update fight: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      opponent: data.opponent,
      weightClass: data.weight_class,
      targetWeightForFight: data.target_weight_for_fight,
      date: new Date(data.date),
      weighInTime: data.weigh_in_time ? new Date(data.weigh_in_time) : undefined,
      location: data.location,
      notes: data.notes,
    };
  });

export const deleteFightProcedure = publicProcedure
  .input(z.object({ id: z.string(), userId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from('fights')
      .delete()
      .eq('id', input.id)
      .eq('user_id', input.userId);

    if (error) {
      console.error('Error deleting fight:', error);
      throw new Error(`Failed to delete fight: ${error.message}`);
    }

    return { success: true };
  });

export const getFightsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const { supabase } = ctx;

    const { data, error } = await supabase
      .from('fights')
      .select('*')
      .eq('user_id', input.userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching fights:', error);
      throw new Error(`Failed to fetch fights: ${error.message}`);
    }

    return data.map((fight) => ({
      id: fight.id,
      name: fight.name,
      opponent: fight.opponent,
      weightClass: fight.weight_class,
      targetWeightForFight: fight.target_weight_for_fight,
      date: new Date(fight.date),
      weighInTime: fight.weigh_in_time ? new Date(fight.weigh_in_time) : undefined,
      location: fight.location,
      notes: fight.notes,
    }));
  });
