import { loginRequest, logoutRequest, registerRequest } from '@/network/requests/auth';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';

/** Supabase auth returns `{ data, error }` instead of throwing; services turn errors into rejections. */
export async function login(payload: LoginPayload) {
  const { data, error } = await loginRequest(payload);
  if (error) throw error;
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data, error } = await registerRequest(payload);
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await logoutRequest();
  if (error) throw error;
}
