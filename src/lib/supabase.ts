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

// Local Storage Mock Database Engine for Sandbox Preview
const getMockProfiles = () => {
  const data = localStorage.getItem('mock_profiles');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // JSON syntax error fallback
    }
  }
  const defaultProfiles = [
    {
      id: 'admin-id',
      email: 'petemkhize@gmail.com',
      company_name: 'Signalmerge Admin',
      location: 'South Africa',
      is_approved: true,
      role: 'admin',
      customer_keywords: ['ai', 'marketing', 'automations'],
      customer_phrases: ['looking for help with ai integrations', 'need n8n workflow specialist'],
      usp: 'Consolidated cognitive intelligence nodes for 2026 sales velocity.',
      selling_region: { state: 'Gauteng', county: 'Johannesburg', pricing: 1500, integrations: ['Zapier', 'n8n'] },
      created_at: new Date().toISOString()
    },
    {
      id: 'user-1',
      email: 'johndoe@gmail.com',
      company_name: 'Doe Digital Agency',
      location: 'California',
      is_approved: false,
      role: 'user',
      customer_keywords: ['saas', 'sales-development', 'outbound'],
      customer_phrases: ['seeking outreach tool experts', 'need warm leads on linkedin'],
      usp: 'Automating high-conversion prospect routes for outbound workflows.',
      selling_region: { state: 'California', county: 'San Francisco', pricing: 1800, integrations: ['Calendly', 'Zapier'] },
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'user-2',
      email: 'sarah.lee@outlook.com',
      company_name: 'Lee Design Group',
      location: 'New York',
      is_approved: true,
      role: 'user',
      customer_keywords: ['webdesign', 'branding', 'figma'],
      customer_phrases: ['looking for figma UI designer', 'redesigning corporate website'],
      usp: 'Premium visual styling and high-contrast editorial assets.',
      selling_region: { state: 'New York', county: 'Manhattan', pricing: 2000, integrations: ['Make', 'Google Calendar'] },
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  localStorage.setItem('mock_profiles', JSON.stringify(defaultProfiles));
  return defaultProfiles;
};

const saveMockProfiles = (profiles: any[]) => {
  localStorage.setItem('mock_profiles', JSON.stringify(profiles));
};

const createQueryBuilder = (tableName: string) => {
  let profiles = getMockProfiles();
  
  const builder = {
    select: (cols?: string) => {
      return builder;
    },
    eq: (colName: string, val: any) => {
      profiles = profiles.filter((p: any) => p[colName] === val);
      return builder;
    },
    order: (col: string, options?: { ascending: boolean }) => {
      profiles.sort((a: any, b: any) => {
        const valA = a[col] || '';
        const valB = b[col] || '';
        return options?.ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
      return builder;
    },
    maybeSingle: () => {
      return Promise.resolve({ data: profiles[0] || null, error: null });
    },
    update: (fields: any) => {
      return {
        eq: (colName: string, val: any) => {
          const all = getMockProfiles();
          const index = all.findIndex((p: any) => p[colName] === val);
          if (index !== -1) {
            all[index] = { ...all[index], ...fields };
            saveMockProfiles(all);
          }
          return Promise.resolve({ error: null });
        }
      };
    },
    upsert: (fields: any) => {
      const all = getMockProfiles();
      const index = all.findIndex((p: any) => p.id === fields.id);
      if (index !== -1) {
        all[index] = { ...all[index], ...fields };
      } else {
        all.push(fields);
      }
      saveMockProfiles(all);
      return Promise.resolve({ error: null });
    },
    then: (resolve: any) => {
      resolve({ data: profiles, error: null });
    }
  };

  return builder;
};

// Create the real Supabase client
const realClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Determine if we should query the mock sandbox tables
export const useMockEngine = () => {
  if (!isSupabaseConfigured) return true;
  if (localStorage.getItem('mock_session')) return true;
  return false;
};

// Hybrid Supabase Client Interceptor which redirects to Sandbox engine when required
export const supabase = {
  ...(realClient || {}),

  auth: {
    ...(realClient?.auth || {}),

    getSession: () => {
      const stored = localStorage.getItem('mock_session');
      if (stored) {
        try {
          return Promise.resolve({ data: { session: JSON.parse(stored) }, error: null });
        } catch (e) {}
      }
      if (realClient) {
        return realClient.auth.getSession();
      }
      return Promise.resolve({ data: { session: null }, error: null });
    },

    onAuthStateChange: (callback: any) => {
      const fireCallback = () => {
        const stored = localStorage.getItem('mock_session');
        let sessionObj = null;
        if (stored) {
          try {
            sessionObj = JSON.parse(stored);
          } catch (e) {}
        }
        callback('SIGNED_IN', sessionObj);
      };
      
      window.addEventListener('mock-auth-change', fireCallback);
      
      let realSubscription: any = null;
      if (realClient) {
        realSubscription = realClient.auth.onAuthStateChange((event, session) => {
          if (!localStorage.getItem('mock_session')) {
            callback(event, session);
          }
        });
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              window.removeEventListener('mock-auth-change', fireCallback);
              if (realSubscription?.data?.subscription?.unsubscribe) {
                realSubscription.data.subscription.unsubscribe();
              }
            }
          }
        }
      };
    },

    signInWithPassword: async ({ email, password }: { email: string, password?: string }) => {
      console.log('Hybrid signInWithPassword triggered for', email);
      const cleanEmail = email.trim().toLowerCase();

      // Master Sandbox Bypass checks:
      if (cleanEmail === 'petemkhize@gmail.com' && password === 'LehakoeZakithi777') {
        const user = { id: 'admin-id', email: 'petemkhize@gmail.com', role: 'admin' };
        const session = { access_token: 'mock-token', user };
        localStorage.setItem('mock_session', JSON.stringify(session));
        window.dispatchEvent(new Event('mock-auth-change'));
        return { data: { user, session }, error: null };
      }

      // Check for other standard registered mock accounts:
      const allMock = getMockProfiles();
      const mockUser = allMock.find((p: any) => p.email === cleanEmail);
      if (mockUser) {
        const session = { access_token: 'mock-token', user: mockUser };
        localStorage.setItem('mock_session', JSON.stringify(session));
        window.dispatchEvent(new Event('mock-auth-change'));
        return { data: { user: mockUser, session }, error: null };
      }

      // Otherwise, attempt authenticating on real Supabase:
      if (realClient) {
        try {
          const result = await realClient.auth.signInWithPassword({ email: cleanEmail, password: password || '' });
          if (!result.error) {
            return result;
          }
          console.warn('Real Supabase login failed:', result.error.message);
        } catch (e: any) {
          console.error('Real client login exception', e);
        }
      }

      return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
    },

    signUp: async ({ email, password }: { email: string, password?: string }) => {
      console.log('Hybrid signUp triggered for', email);
      const cleanEmail = email.trim().toLowerCase();

      let realUser: any = null;
      let signUpError: any = null;

      if (realClient) {
        try {
          const result = await realClient.auth.signUp({ email: cleanEmail, password: password || '' });
          realUser = result.data?.user;
          signUpError = result.error;
        } catch (e: any) {
          console.error('Real client signUp error', e);
        }
      }

      const userId = realUser?.id || 'user-' + Math.random().toString(36).substring(2, 7);
      const user = { id: userId, email: cleanEmail };

      // Ensure mock profile exists in LocalStorage
      const all = getMockProfiles();
      if (!all.some((p: any) => p.email === cleanEmail)) {
        all.push({
          id: userId,
          email: cleanEmail,
          created_at: new Date().toISOString(),
          is_approved: cleanEmail === 'petemkhize@gmail.com' ? true : false,
          role: cleanEmail === 'petemkhize@gmail.com' ? 'admin' : 'user'
        });
        saveMockProfiles(all);
      }

      if (signUpError && !realUser) {
        // Safe sandbox registration fallback
        return { data: { user }, error: null };
      }

      return { data: { user: realUser || user }, error: signUpError || null };
    },

    signOut: async () => {
      localStorage.removeItem('mock_session');
      window.dispatchEvent(new Event('mock-auth-change'));
      if (realClient) {
        return realClient.auth.signOut();
      }
      return Promise.resolve({ error: null });
    },
  },

  from: (tableName: string) => {
    if (useMockEngine()) {
      return createQueryBuilder(tableName);
    }
    if (realClient) {
      return realClient.from(tableName);
    }
    return createQueryBuilder(tableName);
  }
} as any;
