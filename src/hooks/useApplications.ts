import { useQuery } from '@tanstack/react-query';

import { getCandidateApplications } from '@/services/applications.service';

export const applicationsQueryKey = ['applications'] as const;

export function useCandidateApplications(candidateId: string | undefined) {
  return useQuery({
    queryKey: [...applicationsQueryKey, 'candidate', candidateId],
    queryFn: () => getCandidateApplications(candidateId as string),
    enabled: Boolean(candidateId),
  });
}
