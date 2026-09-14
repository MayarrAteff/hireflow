import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import type { Company, Profile } from '@/types/auth.types';
import { profileQueryKey } from '@/utils/context/AuthProvider';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';

import { jobsQueryKey } from './useJobs';

type UseCompanyMutationProps<TVariables> = {
  mutationKey: string[];
  mutationFn: (companyId: string, variables: TVariables) => Promise<Company>;
  successMessageId?: string;
  onSuccess?: (company: Company, variables: TVariables) => void;
};

/** Saves part of the recruiter's company and swaps the fresh row into the auth profile, which embeds it. */
export function useCompanyMutation<TVariables>({
  mutationKey,
  mutationFn,
  successMessageId = 'company.saved',
  onSuccess,
}: UseCompanyMutationProps<TVariables>) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useFormMutation<Company, TVariables>({
    mutationKey: ['company', ...mutationKey],
    mutationFn: (variables) => mutationFn(profile?.company_id as string, variables),
    onSuccess: (company, variables) => {
      queryClient.setQueryData<Profile>(profileQueryKey(profile?.id), (current) =>
        current ? { ...current, company } : current,
      );
      // Job pages embed the company name and logo.
      queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      enqueueSnackbar($t({ id: successMessageId }), { variant: 'success' });
      onSuccess?.(company, variables);
    },
  });
}
