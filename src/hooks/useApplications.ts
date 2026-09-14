import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/network/supabase';
import {
  getCandidateApplicationForJob,
  getCandidateApplications,
  getJobApplications,
} from '@/services/applications.service';

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

export const jobApplicationsQueryKey = (jobId: string) => [...applicationsQueryKey, 'job', jobId] as const;

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: jobApplicationsQueryKey(jobId),
    queryFn: () => getJobApplications(jobId),
  });
}

/**
 * Refetches a job's applicants when anyone changes them (new applications, another recruiter moving cards).
 * Skips refetching while this tab's own board moves are still saving, so cards don't jump back mid-save.
 */
export function useJobApplicationsRealtime(jobId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`applications:job:${jobId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications', filter: `job_id=eq.${jobId}` },
        () => {
          if (queryClient.isMutating({ mutationKey: ['board', jobId] })) return;
          queryClient.invalidateQueries({ queryKey: jobApplicationsQueryKey(jobId) });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, queryClient]);
}
