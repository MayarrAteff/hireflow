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

/** Readable message from a PostgREST/Storage (axios) or Supabase client error. */
export function getErrorMessage(error: unknown): string | undefined {
  if (isAxiosError<PostgrestErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return undefined;
}

function toServerErrors(error: unknown): ServerErrors {
  const message = getErrorMessage(error);
  return message ? { general: message } : {};
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
