import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { useIntl } from 'react-intl';
import SimpleBar from 'simplebar-react';

import { DRAWER_WIDTH } from '@/constants/app';
import { useAuth } from '@/utils/hooks/useAuth';
import { usePermissions } from '@/utils/hooks/usePermissions';

import { menuItems } from './menuItems';

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

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        transition: (theme) => theme.transitions.create('width'),
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Box className="tw-flex tw-h-16 tw-items-center tw-gap-2 tw-px-5">
        <img src="/logo.svg" alt="" className="tw-h-8 tw-w-8" />
        <Typography variant="h5" component="span">
          {$t({ id: 'app.name' })}
        </Typography>
      </Box>

      <SimpleBar style={{ maxHeight: 'calc(100vh - 64px)' }}>
        <List
          className="tw-px-3"
          subheader={<ListSubheader disableSticky>{$t({ id: 'menu.section.main' })}</ListSubheader>}
        >
          {items.map(({ labelId, to, icon: Icon }) => (
            <ListItemLink
              key={labelId}
              to={to}
              activeProps={{ className: 'active' }}
              onClick={variant === 'temporary' ? onClose : undefined}
              className="tw-mb-1"
            >
              <ListItemIcon className="tw-min-w-10">
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText primary={$t({ id: labelId })} />
            </ListItemLink>
          ))}
        </List>
      </SimpleBar>
    </Drawer>
  );
}
