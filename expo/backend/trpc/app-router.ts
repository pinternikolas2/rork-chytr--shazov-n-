import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import { syncProfileProcedure, getProfileProcedure } from "@/backend/trpc/routes/profile/sync/route";
import { addFightProcedure, updateFightProcedure, deleteFightProcedure, getFightsProcedure } from "@/backend/trpc/routes/fights/route";
import { addWeightLogProcedure, getWeightLogsProcedure, deleteWeightLogProcedure } from "@/backend/trpc/routes/weight-logs/route";
import { addHydrationLogProcedure, getHydrationLogsProcedure, deleteHydrationLogProcedure } from "@/backend/trpc/routes/hydration-logs/route";
import { addMealLogProcedure, getMealLogsProcedure, updateMealLogProcedure, deleteMealLogProcedure } from "@/backend/trpc/routes/meal-logs/route";
import { addSleepLogProcedure, getSleepLogsProcedure, deleteSleepLogProcedure } from "@/backend/trpc/routes/sleep-logs/route";
import { addDailyNoteProcedure, updateDailyNoteProcedure, getDailyNotesProcedure, deleteDailyNoteProcedure } from "@/backend/trpc/routes/daily-notes/route";

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
    delete: deleteWeightLogProcedure,
  }),
  hydrationLogs: createTRPCRouter({
    add: addHydrationLogProcedure,
    list: getHydrationLogsProcedure,
    delete: deleteHydrationLogProcedure,
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
    delete: deleteSleepLogProcedure,
  }),
  dailyNotes: createTRPCRouter({
    add: addDailyNoteProcedure,
    update: updateDailyNoteProcedure,
    list: getDailyNotesProcedure,
    delete: deleteDailyNoteProcedure,
  }),
});

export type AppRouter = typeof appRouter;
