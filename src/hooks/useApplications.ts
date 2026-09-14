import { useQuery } from '@tanstack/react-query';

import { getCandidateApplicationForJob, getCandidateApplications } from '@/services/applications.service';

export const applicationsQueryKey = ['applications'] as const;

export function useCandidateApplications(candidateId: string | undefined) {
  return useQuery({
    queryKey: [...applicationsQueryKey, 'candidate', candidateId],
    queryFn: () => getCandidateApplications(candidateId as string),
    enabled: Boolean(candidateId),
  });
}

export function useCandidateApplicationForJob(candidateId: string | undefined, jobId: string) {
  return useQuery({
    queryKey: [...applicationsQueryKey, 'candidate', candidateId, 'job', jobId],
    queryFn: () => getCandidateApplicationForJob(candidateId as string, jobId),
    enabled: Boolean(candidateId),
  });
}
