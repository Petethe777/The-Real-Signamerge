import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../supabase-config/keys';

const rawUrl = SUPABASE_CONFIG.supabaseUrl || '';
const rawAnonKey = SUPABASE_CONFIG.supabaseAnonKey || '';

// Ensure we have a valid URL and it isn't a generic placeholder
export const isSupabaseConfigured = !!(
  rawUrl &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your-project-url') &&
  rawAnonKey &&
  !rawAnonKey.includes('your-anon-key-here')
);

if (isSupabaseConfigured) {
  console.log('Supabase initialized with URL:', rawUrl.substring(0, 20) + '...');
} else {
  console.error('Supabase configuration missing or invalid. Auth and database calls will fail.');
}

/**
 * Real Supabase client — no mock engine, no localStorage fallback.
 * If configuration is missing, calls throw loudly instead of silently
 * returning fake local data.
 */
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey)
  : (new Proxy({}, {
      get() {
        throw new Error(
          'Supabase is not configured (missing/invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).'
        );
      }
    }) as ReturnType<typeof createClient>);

/**
 * Logs a search query to the backend (which writes it to Supabase server-side).
 * No client-side localStorage mock copy — Exa + the real database are the
 * only sources of truth now.
 */
export const saveSearchQuery = async (queryText: string, userEmail?: string) => {
  const cleanQuery = queryText ? queryText.trim() : '';
  if (!cleanQuery) return;

  try {
    const response = await fetch('/api/search/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanQuery,
        email: userEmail || 'anonymous'
      })
    });

    if (!response.ok) {
      console.warn(`Could not save search query "${cleanQuery}" on backend:`, response.statusText);
    }
  } catch (err) {
    console.warn('Network error in saveSearchQuery server sync:', err);
  }
};
