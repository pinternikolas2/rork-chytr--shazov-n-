import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vpnhstzpljtimwftwmrr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbmhzdHpwbGp0aW13ZnR3bXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTk3MTYsImV4cCI6MjA3ODM5NTcxNn0.QHcP0q2L0YKp3S4p4S-cNY0CwV1XJS3M4UGkwqWzyho';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let userId: string | null = null;
  let userSupabase: SupabaseClient;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    
    userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user } } = await userSupabase.auth.getUser();
    userId = user?.id || null;
  } else {
    userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return {
    req: opts.req,
    supabase: userSupabase,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
