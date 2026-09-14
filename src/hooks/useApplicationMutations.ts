import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { saveApplicationMoves } from '@/services/applications.service';
import type { ApplicationUpdatePayload, RecruiterApplication } from '@/types/application.types';
import { getErrorMessage } from '@/utils/hooks/useFormMutation';

import { jobApplicationsQueryKey } from './useApplications';

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
