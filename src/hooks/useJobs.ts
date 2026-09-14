import { useQuery } from '@tanstack/react-query';

import { countPublishedJobs, getCompanyJobs, getJob, getLatestPublishedJobs } from '@/services/jobs.service';

export const jobsQueryKey = ['jobs'] as const;

export function useCompanyJobs(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'company', companyId],
    queryFn: () => getCompanyJobs(companyId as string),
    enabled: Boolean(companyId),
  });
}

export function useLatestPublishedJobs(limit: number) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'published', 'latest', limit],
    queryFn: () => getLatestPublishedJobs(limit),
  });
}

export function usePublishedJobsCount() {
  return useQuery({
    queryKey: [...jobsQueryKey, 'published', 'count'],
    queryFn: countPublishedJobs,
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'detail', jobId],
    queryFn: () => getJob(jobId),
  });
}
