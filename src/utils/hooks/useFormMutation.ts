import { type MutationFunction, useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useState } from 'react';

import type { PostgrestErrorResponse } from '@/network/interceptor';

type ServerErrors = Record<string, string>;

interface UseFormMutationProps<TData, TVariables> {
  mutationFn: MutationFunction<TData, TVariables>;
  mutationKey: string[];
  onSuccess?: (data: TData, variables: TVariables) => void;
}

/** Maps an error from PostgREST (axios) or Supabase auth into `{ general: message }`. */
function toServerErrors(error: unknown): ServerErrors {
  if (isAxiosError<PostgrestErrorResponse>(error)) {
    return { general: error.response?.data?.message ?? error.message };
  }
  if (error instanceof Error) {
    return { general: error.message };
  }
  return {};
}

/** `useMutation` plus server errors ready to show next to the form (same idea as Quotem). */
export function useFormMutation<TData = unknown, TVariables = void>({
  mutationFn,
  mutationKey,
  onSuccess,
}: UseFormMutationProps<TData, TVariables>) {
  const [serverErrors, setServerErrors] = useState<ServerErrors>({});

  const mutation = useMutation({
    mutationKey,
    mutationFn,
    onMutate: () => setServerErrors({}),
    onError: (error) => setServerErrors(toServerErrors(error)),
    onSuccess,
  });

  return { ...mutation, serverErrors };
}
