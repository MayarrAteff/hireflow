import { axiosInstance } from '@/network/interceptor';
import type { Profile } from '@/types/auth.types';

/** Header that makes PostgREST return a single object instead of an array. */
export const SINGLE_OBJECT_HEADERS = { Accept: 'application/vnd.pgrst.object+json' };

export function getProfileRequest(userId: string) {
  return axiosInstance.get<Profile>('/profiles', {
    params: { id: `eq.${userId}`, select: '*,company:companies(*)' },
    headers: SINGLE_OBJECT_HEADERS,
  });
}
