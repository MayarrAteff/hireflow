import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import type { Profile } from '@/types/auth.types';
import { profileQueryKey } from '@/utils/context/AuthProvider';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';

type UseProfileMutationProps<TVariables> = {
  mutationKey: string[];
  mutationFn: (userId: string, variables: TVariables) => Promise<Profile>;
  successMessageId?: string;
  onSuccess?: (profile: Profile, variables: TVariables) => void;
};

/** Saves part of the signed-in user's profile and swaps the fresh row into the auth profile cache. */
export function useProfileMutation<TVariables>({
  mutationKey,
  mutationFn,
  successMessageId = 'profile.saved',
  onSuccess,
}: UseProfileMutationProps<TVariables>) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useFormMutation<Profile, TVariables>({
    mutationKey: ['profile', ...mutationKey],
    mutationFn: (variables) => mutationFn(user?.id as string, variables),
    onSuccess: (profile, variables) => {
      queryClient.setQueryData(profileQueryKey(profile.id), profile);
      enqueueSnackbar($t({ id: successMessageId }), { variant: 'success' });
      onSuccess?.(profile, variables);
    },
  });
}
