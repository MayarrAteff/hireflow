import { axiosInstance } from '@/network/interceptor';

export type FeatureFlagRow = {
  key: string;
  enabled: boolean;
  description: string | null;
};

export function getFeatureFlagsRequest() {
  return axiosInstance.get<FeatureFlagRow[]>('/feature_flags', { params: { select: 'key,enabled' } });
}
