import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import { syncProfileProcedure, getProfileProcedure } from "@/backend/trpc/routes/profile/sync/route";
import { addFightProcedure, updateFightProcedure, deleteFightProcedure, getFightsProcedure } from "@/backend/trpc/routes/fights/route";
import { addWeightLogProcedure, getWeightLogsProcedure } from "@/backend/trpc/routes/weight-logs/route";
import { addHydrationLogProcedure, getHydrationLogsProcedure } from "@/backend/trpc/routes/hydration-logs/route";

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
});

export type AppRouter = typeof appRouter;
