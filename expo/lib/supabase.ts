import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vpnhstzpljtimwftwmrr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbmhzdHpwbGp0aW13ZnR3bXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTk3MTYsImV4cCI6MjA3ODM5NTcxNn0.QHcP0q2L0YKp3S4p4S-cNY0CwV1XJS3M4UGkwqWzyho';

console.log('[Supabase] Platform:', Platform.OS);
console.log('[Supabase] Initializing with URL:', supabaseUrl);
console.log('[Supabase] API Key present:', !!supabaseAnonKey);
console.log('[Supabase] API Key preview:', supabaseAnonKey?.substring(0, 20) + '...');
console.log('[Supabase] API Key length:', supabaseAnonKey?.length);

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': `rork-app-${Platform.OS}`,
    },
    fetch: (url, options = {}) => {
      console.log('[Supabase Fetch] URL:', url);
      console.log('[Supabase Fetch] Method:', options.method || 'GET');
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      }).catch((error) => {
        console.error('[Supabase Fetch] Network error:', error);
        console.error('[Supabase Fetch] URL was:', url);
        throw error;
      });
    },
  },
});

console.log('[Supabase] Client initialized successfully');

supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase] Auth state changed:', event);
  console.log('[Supabase] Session present:', !!session);
});
