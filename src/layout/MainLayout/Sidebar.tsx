import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import type { Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { useIntl } from 'react-intl';
import SimpleBar from 'simplebar-react';

import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from '@/constants/app';
import { Permission } from '@/enum/permissions';
import { useAuth } from '@/utils/hooks/useAuth';
import { usePermissions } from '@/utils/hooks/usePermissions';

import { menuItems } from './menuItems';
import { SidebarPromo } from './SidebarPromo';

const ListItemLink = createLink(ListItemButton);

type SidebarProps = {
  variant: 'permanent' | 'temporary';
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ variant, open, onClose }: SidebarProps) {
  const { $t } = useIntl();
  const { role } = useAuth();
  const { can } = usePermissions();

  const items = role ? menuItems[role].filter((item) => !item.permission || can(item.permission)) : [];

  // A permanent drawer is always mounted with a fixed paper, so "closed" on desktop means a collapsed icon rail.
  const collapsed = variant === 'permanent' && !open;
  const width = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;
  const widthTransition = (theme: Theme) => theme.transitions.create('width');

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width,
        flexShrink: 0,
        transition: widthTransition,
        '& .MuiDrawer-paper': { width, boxSizing: 'border-box', overflowX: 'hidden', transition: widthTransition },
      }}
    >
      <Box className={`tw-flex tw-h-16 tw-items-center tw-gap-2 ${collapsed ? 'tw-justify-center' : 'tw-px-5'}`}>
        <img src="/logo.svg" alt="" className="tw-h-8 tw-w-8" />
        {!collapsed && (
          <Typography variant="h5" component="span" noWrap>
            {$t({ id: 'app.name' })}
          </Typography>
        )}
      </Box>

      <SimpleBar style={{ flex: 1, minHeight: 0 }}>
        <List
          className="tw-px-3"
          subheader={
            collapsed ? undefined : <ListSubheader disableSticky>{$t({ id: 'menu.section.main' })}</ListSubheader>
          }
        >
          {items.map(({ labelId, to, icon: Icon }) => (
            <Tooltip key={labelId} title={collapsed ? $t({ id: labelId }) : ''} placement="right">
              <ListItemLink
                to={to}
                activeProps={{ className: 'active' }}
                onClick={variant === 'temporary' ? onClose : undefined}
                className={`tw-mb-1 ${collapsed ? 'tw-justify-center' : ''}`}
              >
                <ListItemIcon className={collapsed ? 'tw-min-w-0' : 'tw-min-w-10'}>
                  <Icon size={20} />
                </ListItemIcon>
                {!collapsed && <ListItemText primary={$t({ id: labelId })} />}
              </ListItemLink>
            </Tooltip>
          ))}
        </List>
      </SimpleBar>

      {!collapsed && role === 'recruiter' && can(Permission.ManageJobs) && (
        <SidebarPromo onNavigate={variant === 'temporary' ? onClose : undefined} />
      )}
    </Drawer>
  );
}
