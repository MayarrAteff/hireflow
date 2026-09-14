import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { markApplicationViewed, saveApplicationMoves } from '@/services/applications.service';
import type { ApplicationUpdatePayload, RecruiterApplication } from '@/types/application.types';
import { getErrorMessage } from '@/utils/hooks/useFormMutation';

import { applicationsQueryKey, jobApplicationsQueryKey } from './useApplications';
import { jobsQueryKey } from './useJobs';

export type ApplicationMove = { id: string; payload: ApplicationUpdatePayload };

/**
 * Stage, position and rating changes for a job's applicants. The cache updates immediately so the board and
 * drawer feel instant; if saving fails the previous state comes back and the error is shown.
 */
export function useApplicationMoves(jobId: string) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const queryKey = jobApplicationsQueryKey(jobId);

  return useMutation({
    // Shared with the realtime hook, which skips refetching while these are in flight.
    mutationKey: ['board', jobId],
    mutationFn: (moves: ApplicationMove[]) => saveApplicationMoves(moves),
    onMutate: async (moves) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RecruiterApplication[]>(queryKey);
      const changes = new Map(moves.map((move) => [move.id, move.payload]));
      queryClient.setQueryData<RecruiterApplication[]>(queryKey, (current) =>
        current?.map((application) =>
          changes.has(application.id) ? { ...application, ...changes.get(application.id) } : application,
        ),
      );
      return { previous };
    },
    onError: (error, _moves, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      enqueueSnackbar(getErrorMessage(error) ?? $t({ id: 'board.saveError' }), { variant: 'error' });
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['board', jobId] }) <= 1) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

/** Marks an applicant as seen by the company. Silent: a failed write just leaves the "new" badge in place. */
export function useMarkApplicationViewed(jobId: string) {
  const queryClient = useQueryClient();
  const queryKey = jobApplicationsQueryKey(jobId);

  return useMutation({
    mutationFn: markApplicationViewed,
    onMutate: (applicationId) => {
      const viewedAt = new Date().toISOString();
      queryClient.setQueryData<RecruiterApplication[]>(queryKey, (current) =>
        current?.map((application) =>
          application.id === applicationId ? { ...application, viewed_at: viewedAt } : application,
        ),
      );
    },
    // The jobs list and the dashboard count and list unseen applicants.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [...jobsQueryKey, 'company'] }),
        queryClient.invalidateQueries({ queryKey: [...applicationsQueryKey, 'company'] }),
      ]),
  });
}
