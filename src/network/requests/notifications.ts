import { axiosInstance } from '@/network/interceptor';
import type { AppNotification } from '@/types/notification.types';

/** Row-level security already limits every request here to the signed-in user's own notifications. */
export function getNotificationsRequest(userId: string, limit: number, unreadOnly: boolean) {
  return axiosInstance.get<AppNotification[]>('/notifications', {
    params: { user_id: `eq.${userId}`, order: 'created_at.desc', limit, ...(unreadOnly && { read_at: 'is.null' }) },
  });
}

/** HEAD request: PostgREST puts the total after the slash in `Content-Range` without sending any rows. */
export function countUnreadNotificationsRequest(userId: string) {
  return axiosInstance.head('/notifications', {
    params: { user_id: `eq.${userId}`, read_at: 'is.null' },
    headers: { Prefer: 'count=exact' },
  });
}

/** Marks one notification read, or every unread one when no id is given. */
export function markNotificationsReadRequest(userId: string, notificationId?: string) {
  return axiosInstance.patch(
    '/notifications',
    { read_at: new Date().toISOString() },
    { params: { user_id: `eq.${userId}`, read_at: 'is.null', ...(notificationId && { id: `eq.${notificationId}` }) } },
  );
}
