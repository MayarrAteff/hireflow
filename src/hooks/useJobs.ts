import { useQuery } from '@tanstack/react-query';

import { getCompanyJobs, getJob } from '@/services/jobs.service';

export const jobsQueryKey = ['jobs'] as const;

export function useCompanyJobs(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'company', companyId],
    queryFn: () => getCompanyJobs(companyId as string),
    enabled: Boolean(companyId),
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'detail', jobId],
    queryFn: () => getJob(jobId),
  });
}
