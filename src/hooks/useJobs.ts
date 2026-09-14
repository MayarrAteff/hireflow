import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  countPublishedJobs,
  getCompanyJobs,
  getJob,
  getLatestPublishedJobs,
  getPublishedJob,
  searchPublishedJobs,
} from '@/services/jobs.service';
import type { JobSearchFilters } from '@/types/job.types';

export const jobsQueryKey = ['jobs'] as const;

const JOB_SEARCH_PAGE_SIZE = 12;

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

export function usePublishedJobsSearch(filters: JobSearchFilters) {
  return useInfiniteQuery({
    queryKey: [...jobsQueryKey, 'published', 'search', filters],
    queryFn: ({ pageParam }) => searchPublishedJobs(filters, pageParam, JOB_SEARCH_PAGE_SIZE),
    initialPageParam: 0,
    // A full page means there may be more; the next page starts after everything loaded so far.
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === JOB_SEARCH_PAGE_SIZE ? pages.length * JOB_SEARCH_PAGE_SIZE : undefined,
  });
}

export function usePublishedJob(jobId: string) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'published', 'detail', jobId],
    queryFn: () => getPublishedJob(jobId),
    retry: false,
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: [...jobsQueryKey, 'detail', jobId],
    queryFn: () => getJob(jobId),
  });
}
