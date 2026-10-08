import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { NOTIFICATION_KINDS, NOTIFICATIONS_LIMIT } from '@/constants/notifications';
import { supabase } from '@/network/supabase';
import { countUnreadNotifications, getNotifications, markNotificationsRead } from '@/services/notifications.service';
import type { AppNotification } from '@/types/notification.types';

export const notificationsQueryKey = ['notifications'] as const;

export type NotificationsFilter = 'all' | 'unread';

/** Unread ones are asked for separately, since they may sit beyond the newest page of the full list. */
export function useNotifications(userId: string | undefined, filter: NotificationsFilter) {
  return useQuery({
    queryKey: [...notificationsQueryKey, userId, 'list', filter],
    queryFn: () => getNotifications(userId as string, NOTIFICATIONS_LIMIT, filter === 'unread'),
    enabled: Boolean(userId),
  });
}

/** Counted separately from the list, which is capped. */
export function useUnreadNotificationsCount(userId: string | undefined) {
  return useQuery({
    queryKey: [...notificationsQueryKey, userId, 'unread'],
    queryFn: () => countUnreadNotifications(userId as string),
    enabled: Boolean(userId),
  });
}

/** Marks one notification read, or all of them when called without an id. */
export function useMarkNotificationsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...notificationsQueryKey, 'markRead'],
    mutationFn: (notificationId?: string) => markNotificationsRead(userId as string, notificationId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });
}

/** Refreshes the bell the moment a notification arrives, and announces it in a toast. */
export function useNotificationsRealtime(userId: string | undefined) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return undefined;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on<AppNotification>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
          if (payload.eventType === 'INSERT' && payload.new.title in NOTIFICATION_KINDS) {
            enqueueSnackbar($t({ id: payload.new.title }), { variant: 'info' });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, enqueueSnackbar, $t]);
}
