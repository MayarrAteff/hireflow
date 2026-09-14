import { createClient } from '@supabase/supabase-js';

import { config } from '@/config';

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

/**
 * Supabase client for auth, storage and realtime.
 * Table data goes through the axios instance in `interceptor.ts` (PostgREST), same layering as Quotem.
 */
export const supabase = createClient(
  config.supabaseUrl || 'http://localhost:54321',
  config.supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
