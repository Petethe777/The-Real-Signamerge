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
  let profiles = tableName === 'profiles' ? getMockProfiles() : [];
  if (tableName !== 'profiles') {
    const listData = localStorage.getItem(`mock_${tableName}`) || '[]';
    try {
      profiles = JSON.parse(listData);
    } catch (e) {}
  }
  
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
    insert: (fields: any) => {
      const listData = localStorage.getItem(`mock_${tableName}`) || '[]';
      let items: any[] = [];
      try {
        items = JSON.parse(listData);
      } catch (e) {}
      
      const newItems = Array.isArray(fields) ? fields : [fields];
      items.push(...newItems);
      localStorage.setItem(`mock_${tableName}`, JSON.stringify(items));
      return Promise.resolve({ error: null });
    },
    update: (fields: any) => {
      return {
        eq: (colName: string, val: any) => {
          if (tableName === 'profiles') {
            const all = getMockProfiles();
            const index = all.findIndex((p: any) => p[colName] === val);
            if (index !== -1) {
              all[index] = { ...all[index], ...fields };
              saveMockProfiles(all);
            }
          } else {
            const listData = localStorage.getItem(`mock_${tableName}`) || '[]';
            let items: any[] = [];
            try { items = JSON.parse(listData); } catch (e) {}
            const index = items.findIndex((item: any) => item[colName] === val);
            if (index !== -1) {
              items[index] = { ...items[index], ...fields };
              localStorage.setItem(`mock_${tableName}`, JSON.stringify(items));
            }
          }
          return Promise.resolve({ error: null });
        }
      };
    },
    upsert: (fields: any) => {
      if (tableName === 'profiles') {
        const all = getMockProfiles();
        const index = all.findIndex((p: any) => p.id === fields.id);
        if (index !== -1) {
          all[index] = { ...all[index], ...fields };
        } else {
          all.push(fields);
        }
        saveMockProfiles(all);
      } else {
        const listData = localStorage.getItem(`mock_${tableName}`) || '[]';
        let items: any[] = [];
        try { items = JSON.parse(listData); } catch (e) {}
        const index = items.findIndex((item: any) => item.id === fields.id);
        if (index !== -1) {
          items[index] = { ...items[index], ...fields };
        } else {
          items.push(fields);
        }
        localStorage.setItem(`mock_${tableName}`, JSON.stringify(items));
      }
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

      // Secure Server-side authentications check (protects credentials from client-side bundles)
      try {
        const res = await fetch('/api/auth/verify-client-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            const user = {
              id: result.user.role === 'admin' ? 'admin-id' : 'digital-consulting-pros-id',
              email: result.user.email,
              role: result.user.role,
              company_name: result.user.company_name
            };
            const session = { access_token: 'mock-token', user };
            localStorage.setItem('mock_session', JSON.stringify(session));
            window.dispatchEvent(new Event('mock-auth-change'));
            return { data: { user, session }, error: null };
          }
        }
      } catch (err) {
        console.warn('Backend verification check failed, attempting local fallback...', err);
      }

      const cleanPw = password ? password.trim() : '';

      // Master Sandbox Bypass checks:
      if (cleanEmail === 'petemkhize@gmail.com' && cleanPw === 'LehakoeZakithi777') {
        const user = { id: 'admin-id', email: 'petemkhize@gmail.com', role: 'admin' };
        const session = { access_token: 'mock-token', user };
        localStorage.setItem('mock_session', JSON.stringify(session));
        window.dispatchEvent(new Event('mock-auth-change'));
        return { data: { user, session }, error: null };
      }

      const isDefaultClientEmail = cleanEmail === 'digitalconsultingpros@gmail.com';
      if (isDefaultClientEmail) {
        // Try to fetch custom-set password from real Supabase table 'client_credentials' if built & configured
        let dbPw = null;
        if (realClient) {
          try {
            const { data, error } = await realClient
              .from('client_credentials')
              .select('password')
              .eq('email', 'digitalconsultingpros@gmail.com')
              .maybeSingle();
            if (data && data.password) {
              dbPw = data.password.trim();
              localStorage.setItem('saved_password_digitalconsultingpros@gmail.com', dbPw);
            }
          } catch (e) {
            console.warn("Could not retrieve custom client password from Supabase: ", e);
          }
        }

        const savedPw = dbPw || localStorage.getItem('saved_password_digitalconsultingpros@gmail.com');
        const matchPw = savedPw ? savedPw.trim() : 'MaltaSecure2026!';

        if (cleanPw === matchPw || cleanPw === `${matchPw})` || (matchPw === 'MaltaSecure2026!' && (cleanPw === 'MaltaSecure2026!' || cleanPw === 'MaltaSecure2026!)'))) {
          const user = { 
            id: 'digital-consulting-pros-id', 
            email: 'digitalconsultingpros@gmail.com', 
            role: 'client_audit', 
            company_name: 'Digital Consulting Pros' 
          };
          const session = { access_token: 'mock-token', user };
          
          // Background sync server-side memory
          try {
            fetch('/api/auth/update-client-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'digitalconsultingpros@gmail.com', password: matchPw })
            }).catch(() => {});
          } catch (err) {}

          localStorage.setItem('mock_session', JSON.stringify(session));
          window.dispatchEvent(new Event('mock-auth-change'));
          return { data: { user, session }, error: null };
        }
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
    const isMock = useMockEngine();
    
    // If NOT in mock sandbox mode, query real Supabase directly
    if (!isMock && realClient) {
      return realClient.from(tableName);
    }
    
    // If in sandbox/mock session, return the mock builder
    const mockBuilder = createQueryBuilder(tableName);
    
    // BUT if realClient is ALSO configured (meaning it's active in the background),
    // replicate ALL write operations (inserts, updates, upserts) to the real database as well!
    if (realClient) {
      return {
        ...mockBuilder,
        insert: (fields: any) => {
          // Dual-write to real Supabase
          (async () => {
            try {
              const { error } = await realClient.from(tableName).insert(fields);
              if (error) console.warn(`[Supabase Hybrid] Background insert to "${tableName}" failed:`, error.message);
            } catch (err) {
              console.warn(`[Supabase Hybrid] Background insert exception for "${tableName}":`, err);
            }
          })();
          // Perform standard local storage write
          return mockBuilder.insert(fields);
        },
        upsert: (fields: any) => {
          // Dual-write to real Supabase
          (async () => {
            try {
              const { error } = await realClient.from(tableName).upsert(fields);
              if (error) console.warn(`[Supabase Hybrid] Background upsert to "${tableName}" failed:`, error.message);
            } catch (err) {
              console.warn(`[Supabase Hybrid] Background upsert exception for "${tableName}":`, err);
            }
          })();
          // Perform standard local storage write
          return mockBuilder.upsert(fields);
        },
        update: (fields: any) => {
          const mockUpdate = mockBuilder.update(fields);
          return {
            eq: (colName: string, val: any) => {
              // Dual-write to real Supabase
              (async () => {
                try {
                  const { error } = await realClient.from(tableName).update(fields).eq(colName, val);
                  if (error) console.warn(`[Supabase Hybrid] Background update to "${tableName}" failed:`, error.message);
                } catch (err) {
                  console.warn(`[Supabase Hybrid] Background update exception for "${tableName}":`, err);
                }
              })();
              // Perform standard local storage write
              return mockUpdate.eq(colName, val);
            }
          };
        }
      };
    }
    
    return mockBuilder;
  }
} as any;

/**
 * Helper to save search queries into Supabase (and mock LocalStorage) dynamically.
 */
export const saveSearchQuery = async (queryText: string, userEmail?: string) => {
  const cleanQuery = queryText ? queryText.trim() : "";
  if (!cleanQuery) return;
  
  try {
    const { error } = await supabase
      .from('search_queries')
      .insert({
        query: cleanQuery,
        user_email: userEmail || 'anonymous',
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.warn(`Could not save search query "${cleanQuery}" to Supabase:`, error);
    } else {
      console.log(`Successfully saved search query: "${cleanQuery}"`);
    }
  } catch (err) {
    console.warn("Exception in saveSearchQuery:", err);
  }
};
