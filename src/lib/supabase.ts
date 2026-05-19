import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey);

if (isSupabaseConfigured) {
  console.log('Supabase initialized with URL:', supabaseUrl.substring(0, 10) + '...');
} else {
  console.warn('Supabase configuration missing or invalid URL');
}

// If keys are missing, we still want to avoid crashing the app on load.
// We'll export the real client if possible, otherwise a proxy that warns.
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({
              data: { subscription: { unsubscribe: () => {} } },
            }),
            signInWithOtp: () => {
              console.warn('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your settings.');
              return Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase URL/Key missing in settings') });
            },
            signOut: () => Promise.resolve({ error: null }),
          };
        }
        return () => {
          console.warn(`Supabase ${String(prop)} called but VITE_SUPABASE_URL is missing.`);
          return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
        };
      }
    });
