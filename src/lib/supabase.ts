import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../supabase-config/keys';

const rawUrl = SUPABASE_CONFIG.supabaseUrl || '';
const rawAnonKey = SUPABASE_CONFIG.supabaseAnonKey || '';

// Ensure we have a valid URL and is not a generic placeholder
export const isSupabaseConfigured = !!(
  rawUrl && 
  rawUrl.startsWith('http') && 
  !rawUrl.includes('your-project-url') &&
  rawAnonKey && 
  !rawAnonKey.includes('your-anon-key-here')
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : '';
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey : '';

if (isSupabaseConfigured) {
  console.log('Supabase initialized with URL:', supabaseUrl.substring(0, 10) + '...');
} else {
  console.warn('Supabase configuration missing or invalid URL placeholders detected');
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
