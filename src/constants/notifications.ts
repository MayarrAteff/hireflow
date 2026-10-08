import type { IconType } from 'react-icons';
import {
  MdCelebration,
  MdCheckCircle,
  MdEventAvailable,
  MdEventBusy,
  MdPersonAdd,
  MdThumbDown,
  MdTimeline,
  MdUpdate,
  MdWorkOutline,
} from 'react-icons/md';

import type { AccentColor } from '@/styles/themes/accents';

export const NOTIFICATIONS_LIMIT = 30;

type NotificationParam = 'job' | 'stage' | 'candidate' | 'at' | 'matched' | 'company';

type NotificationKind = {
  icon: IconType;
  color: AccentColor;
  /** The order the database joins the values in the notification body. */
  params: NotificationParam[];
};

/** Every notification the database writes, keyed by its `title`, which doubles as the i18n key of its headline. */
export const NOTIFICATION_KINDS: Record<string, NotificationKind> = {
  'notification.stageChanged': { icon: MdTimeline, color: 'violet', params: ['job', 'stage'] },
  'notification.offerReceived': { icon: MdCelebration, color: 'emerald', params: ['job'] },
  'notification.offerAccepted': { icon: MdCheckCircle, color: 'emerald', params: ['candidate', 'job'] },
  'notification.offerDeclined': { icon: MdThumbDown, color: 'rose', params: ['candidate', 'job'] },
  'notification.newApplication': { icon: MdPersonAdd, color: 'sky', params: ['candidate', 'job'] },
  'notification.interviewScheduled': { icon: MdEventAvailable, color: 'amber', params: ['at', 'job'] },
  'notification.interviewRescheduled': { icon: MdUpdate, color: 'amber', params: ['at', 'job'] },
  'notification.jobAlert': { icon: MdWorkOutline, color: 'sky', params: ['matched', 'company', 'job'] },
  'notification.interviewCancelled': { icon: MdEventBusy, color: 'rose', params: ['at', 'job'] },
};

/**
 * Splits a notification body back into named values. The job title is free text and may contain the separator
 * itself, so it takes whatever is left over once the other values are read from the opposite end.
 */
export function parseNotificationBody(body: string, params: NotificationParam[]) {
  const parts = body.split('|');
  const extra = Math.max(parts.length - params.length, 0);
  const jobIndex = params.indexOf('job');
  const values: Partial<Record<NotificationParam, string>> = {};

  params.forEach((param, index) => {
    if (index < jobIndex || jobIndex === -1) values[param] = parts[index];
    else if (index === jobIndex) values[param] = parts.slice(index, index + extra + 1).join('|');
    else values[param] = parts[index + extra];
  });

  return values;
}
