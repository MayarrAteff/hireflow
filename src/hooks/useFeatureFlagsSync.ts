import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getFeatureFlags } from '@/services/featureFlags.service';
import { type FeatureFlagKey, setFeatureFlags } from '@/store/features/featureFlagsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Loads feature flags once per session and mirrors them into Redux. */
export function useFeatureFlagsSync() {
  const dispatch = useAppDispatch();
  const { data } = useQuery({ queryKey: ['featureFlags'], queryFn: getFeatureFlags, staleTime: Infinity });

  useEffect(() => {
    if (data) dispatch(setFeatureFlags(data));
  }, [data]);
}

export function useFeatureFlag(key: FeatureFlagKey) {
  return useAppSelector((state) => Boolean(state.featureFlags.flags[key]));
}
