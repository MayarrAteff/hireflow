import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { MdDoneAll, MdNotificationsNone } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { NOTIFICATION_KINDS, parseNotificationBody } from '@/constants/notifications';
import {
  type NotificationsFilter,
  useMarkNotificationsRead,
  useNotifications,
  useNotificationsRealtime,
  useUnreadNotificationsCount,
} from '@/hooks/useNotifications';
import type { AppNotification } from '@/types/notification.types';
import { dayjs } from '@/utils/dayjs';
import { useAuth } from '@/utils/hooks/useAuth';

const MAX_BADGE_COUNT = 9;

/** The header bell: an unread count, and a list of recent notifications that open what they are about. */
export function NotificationBell() {
  const { $t, formatDate, formatRelativeTime } = useIntl();
  const router = useRouter();
  const { profile } = useAuth();
  const userId = profile?.id;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [filter, setFilter] = useState<NotificationsFilter>('all');

  const { data: notifications = [], isPending } = useNotifications(userId, filter);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(userId);
  const markRead = useMarkNotificationsRead(userId);
  useNotificationsRealtime(userId);

  const label = $t({ id: 'notifications.title' });

  /** "5 minutes ago", "2 hours ago", "yesterday"; the largest unit that fits. */
  const formatAge = (date: string) => {
    const minutes = dayjs(date).diff(dayjs(), 'minute');
    if (Math.abs(minutes) < 60) return formatRelativeTime(minutes, 'minute', { numeric: 'auto' });
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return formatRelativeTime(hours, 'hour', { numeric: 'auto' });
    return formatRelativeTime(Math.round(hours / 24), 'day', { numeric: 'auto' });
  };

  const describe = ({ title, body }: AppNotification) => {
    const kind = NOTIFICATION_KINDS[title];
    // A kind this build does not know yet is shown as stored rather than dropped.
    if (!kind) return { icon: MdNotificationsNone, color: 'sky' as const, headline: title, text: body };

    const values = parseNotificationBody(body, kind.params);
    return {
      icon: kind.icon,
      color: kind.color,
      headline: $t({ id: title }),
      text: $t(
        { id: `${title}.body` },
        {
          ...values,
          stage: values.stage && $t({ id: `application.stage.${values.stage}` }),
          at: values.at && formatDate(values.at, { dateStyle: 'medium', timeStyle: 'short' }),
        },
      ),
    };
  };

  const handleOpen = (notification: AppNotification) => {
    setAnchorEl(null);
    if (!notification.read_at) markRead.mutate(notification.id);
    // Links are written by the database as in-app paths; anything else is ignored.
    if (notification.link?.startsWith('/')) router.history.push(notification.link);
  };

  return (
    <>
      <Tooltip title={label}>
        <IconButton color="inherit" aria-label={label} onClick={(event) => setAnchorEl(event.currentTarget)}>
          <Badge badgeContent={unreadCount} max={MAX_BADGE_COUNT} color="error">
            <MdNotificationsNone />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: 'mt-1 w-96 max-w-[calc(100vw-32px)]' } }}
      >
        <Box className="flex items-center justify-between gap-2 px-4 py-3">
          <Typography variant="h6">{label}</Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<MdDoneAll />} onClick={() => markRead.mutate(undefined)}>
              {$t({ id: 'notifications.markAllRead' })}
            </Button>
          )}
        </Box>
        <Tabs
          value={filter}
          onChange={(_event, value: NotificationsFilter) => setFilter(value)}
          variant="fullWidth"
          className="min-h-10"
        >
          <Tab value="all" label={$t({ id: 'notifications.tab.all' })} className="min-h-10" />
          <Tab
            value="unread"
            label={$t({ id: 'notifications.tab.unread' }, { count: unreadCount })}
            className="min-h-10"
          />
        </Tabs>
        <Divider />

        {isPending && (
          <Box className="flex flex-col gap-2 p-4">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} variant="rounded" height={52} />
            ))}
          </Box>
        )}

        {!isPending && notifications.length === 0 && (
          <Box className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <IconTile icon={MdNotificationsNone} size="lg" />
            <Typography fontWeight={600}>{$t({ id: 'notifications.empty.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: filter === 'unread' ? 'notifications.empty.unread' : 'notifications.empty.body' })}
            </Typography>
          </Box>
        )}

        {notifications.length > 0 && (
          <Box component="ul" className="m-0 max-h-[26rem] list-none overflow-y-auto p-1">
            {notifications.map((notification) => {
              const { icon, color, headline, text } = describe(notification);
              const unread = !notification.read_at;
              return (
                <Box component="li" key={notification.id}>
                  <ListItemButton
                    onClick={() => handleOpen(notification)}
                    className="items-start gap-3 rounded-xl px-3 py-2.5"
                    sx={(theme) => ({ bgcolor: unread ? alpha(theme.palette.primary.main, 0.06) : 'transparent' })}
                  >
                    <IconTile icon={icon} color={color} size="sm" />
                    <Box className="min-w-0 flex-1">
                      <Typography variant="body2" fontWeight={unread ? 700 : 600}>
                        {headline}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="break-words">
                        {text}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatAge(notification.created_at)}
                      </Typography>
                    </Box>
                    {unread && (
                      <Box
                        aria-hidden
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        sx={{ bgcolor: 'primary.main' }}
                      />
                    )}
                  </ListItemButton>
                </Box>
              );
            })}
          </Box>
        )}
      </Popover>
    </>
  );
}
