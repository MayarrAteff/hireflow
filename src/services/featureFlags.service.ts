import { getFeatureFlagsRequest } from '@/network/requests/featureFlags';

export async function getFeatureFlags() {
  const response = await getFeatureFlagsRequest();
  return Object.fromEntries(response.data.map((flag) => [flag.key, flag.enabled]));
}
