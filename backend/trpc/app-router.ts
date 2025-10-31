import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import { syncProfileProcedure, getProfileProcedure } from "@/backend/trpc/routes/profile/sync/route";
import { addFightProcedure, updateFightProcedure, deleteFightProcedure, getFightsProcedure } from "@/backend/trpc/routes/fights/route";
import { addWeightLogProcedure, getWeightLogsProcedure } from "@/backend/trpc/routes/weight-logs/route";
import { addHydrationLogProcedure, getHydrationLogsProcedure } from "@/backend/trpc/routes/hydration-logs/route";
import { addMealLogProcedure, getMealLogsProcedure, updateMealLogProcedure, deleteMealLogProcedure } from "@/backend/trpc/routes/meal-logs/route";
import { addSleepLogProcedure, getSleepLogsProcedure } from "@/backend/trpc/routes/sleep-logs/route";
import { addDailyNoteProcedure, updateDailyNoteProcedure, getDailyNotesProcedure } from "@/backend/trpc/routes/daily-notes/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  profile: createTRPCRouter({
    sync: syncProfileProcedure,
    get: getProfileProcedure,
  }),
  fights: createTRPCRouter({
    add: addFightProcedure,
    update: updateFightProcedure,
    delete: deleteFightProcedure,
    list: getFightsProcedure,
  }),
  weightLogs: createTRPCRouter({
    add: addWeightLogProcedure,
    list: getWeightLogsProcedure,
  }),
  hydrationLogs: createTRPCRouter({
    add: addHydrationLogProcedure,
    list: getHydrationLogsProcedure,
  }),
  mealLogs: createTRPCRouter({
    add: addMealLogProcedure,
    list: getMealLogsProcedure,
    update: updateMealLogProcedure,
    delete: deleteMealLogProcedure,
  }),
  sleepLogs: createTRPCRouter({
    add: addSleepLogProcedure,
    list: getSleepLogsProcedure,
  }),
  dailyNotes: createTRPCRouter({
    add: addDailyNoteProcedure,
    update: updateDailyNoteProcedure,
    list: getDailyNotesProcedure,
  }),
});

export type AppRouter = typeof appRouter;
