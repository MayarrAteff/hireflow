import { getProfileRequest } from '@/network/requests/profile';

export async function getProfile(userId: string) {
  const response = await getProfileRequest(userId);
  return response.data;
}
