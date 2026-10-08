import {
  countUnreadNotificationsRequest,
  getNotificationsRequest,
  markNotificationsReadRequest,
} from '@/network/requests/notifications';

export async function getNotifications(userId: string, limit: number, unreadOnly: boolean) {
  const response = await getNotificationsRequest(userId, limit, unreadOnly);
  return response.data;
}

export async function countUnreadNotifications(userId: string) {
  const response = await countUnreadNotificationsRequest(userId);
  const total = String(response.headers['content-range'] ?? '').split('/')[1];
  return Number(total) || 0;
}

export async function markNotificationsRead(userId: string, notificationId?: string) {
  await markNotificationsReadRequest(userId, notificationId);
}
