import { supabase } from '@/network/supabase';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';

export function loginRequest({ email, password }: LoginPayload) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function registerRequest({ email, password, fullName, role }: RegisterPayload) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
}

export function logoutRequest() {
  return supabase.auth.signOut();
}
