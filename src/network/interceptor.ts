import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { config } from '@/config';
import { RequestErrors } from '@/enum/RequestErrors';
import { ResponseStatus } from '@/enum/ResponseStatus';
import { router } from '@/router';
import { store } from '@/store';
import { addLoading, removeLoading } from '@/store/features/loadingSlice';
import { eventEmitter } from '@/utils/eventEmitter';
import { getTranslation } from '@/utils/getTranslation';

import { supabase } from './supabase';

/** PostgREST error body. */
export type PostgrestErrorResponse = {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.restBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(async (requestConfig) => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  store.dispatch(addLoading(requestConfig.url));
  requestConfig.headers.apikey = config.supabaseAnonKey;
  requestConfig.headers.Authorization = `Bearer ${accessToken ?? config.supabaseAnonKey}`;

  return requestConfig;
});

axiosInstance.interceptors.response.use(
  (response) => {
    store.dispatch(removeLoading(response.config.url));
    return response;
  },
  async (error: AxiosError<PostgrestErrorResponse>) => {
    const requestConfig = error.config as RetriableConfig | undefined;
    store.dispatch(removeLoading(requestConfig?.url));

    if (error.code === RequestErrors.ERR_NETWORK) {
      notify('network.error');
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Expired JWT: refresh the Supabase session once and replay the request.
    if (status === ResponseStatus.Unauthorized && requestConfig && !requestConfig._retried) {
      requestConfig._retried = true;
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && data.session) {
        return axiosInstance(requestConfig);
      }
      await handleSessionExpired();
      return Promise.reject(error);
    }

    const handlers: Partial<Record<number, () => void>> = {
      [ResponseStatus.Forbidden]: () => notify('network.forbidden'),
      [ResponseStatus.ServerError]: () => notify('network.serverError'),
    };
    if (status) handlers[status]?.();

    return Promise.reject(error);
  },
);

function notify(messageId: string) {
  eventEmitter.emit('snackbar', { message: getTranslation(messageId), variant: 'error' });
}

async function handleSessionExpired() {
  await supabase.auth.signOut();
  notify('auth.session.expired');
  router.navigate({ to: '/login', search: { redirect: router.state.location.href } });
}
