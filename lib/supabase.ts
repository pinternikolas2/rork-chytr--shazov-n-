import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vfgoizqsdljodwffcgyi.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZ29penFzZGxqb2R3ZmZjZ3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MzU4MzAsImV4cCI6MjA1MzIxMTgzMH0.Pr3LdSJn6KeWL4mRaZRzyPkUqMLrfFWQjOXqsqvUSPY';

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
  },
  global: {
    headers: {
      'x-client-info': `rork-app-${Platform.OS}`,
    },
  },
});

console.log('[Supabase] Client initialized successfully');

supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase] Auth state changed:', event);
  console.log('[Supabase] Session present:', !!session);
});
