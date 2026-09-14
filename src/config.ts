export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  restBaseUrl: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
} as const;
