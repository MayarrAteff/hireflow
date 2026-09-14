import { axiosInstance } from '@/network/interceptor';
import type { Profile, ProfileUpdatePayload } from '@/types/auth.types';

/** Header that makes PostgREST return a single object instead of an array. */
export const SINGLE_OBJECT_HEADERS = { Accept: 'application/vnd.pgrst.object+json' };

const PROFILE_SELECT = '*,company:companies(*)';

export function getProfileRequest(userId: string) {
  return axiosInstance.get<Profile>('/profiles', {
    params: { id: `eq.${userId}`, select: PROFILE_SELECT },
    headers: SINGLE_OBJECT_HEADERS,
  });
}

export function updateProfileRequest(userId: string, payload: ProfileUpdatePayload) {
  return axiosInstance.patch<Profile>('/profiles', payload, {
    params: { id: `eq.${userId}`, select: PROFILE_SELECT },
    headers: { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' },
  });
}
