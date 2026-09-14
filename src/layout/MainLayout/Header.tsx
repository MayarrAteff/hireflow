import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { MdLogout, MdMenu } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { ThemeModeToggle } from '@/components/UI/ThemeModeToggle';
import { logout } from '@/services/auth.service';
import { brandGradient } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';

type HeaderProps = {
  onToggleSidebar: () => void;
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const initials = (profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={(theme) => ({
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        backdropFilter: 'blur(12px)',
      })}
    >
      <Toolbar className="tw-gap-2">
        <IconButton edge="start" aria-label={$t({ id: 'header.toggleSidebar' })} onClick={onToggleSidebar}>
          <MdMenu />
        </IconButton>

        <Box className="tw-flex-1" />

        <LanguageSwitcher />
        <ThemeModeToggle />

        <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} className="tw-ms-1">
          <Avatar sx={(theme) => ({ background: brandGradient(theme), color: '#fff', width: 36, height: 36 })}>
            {initials}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { className: 'tw-min-w-56' } }}
        >
          <Box className="tw-px-4 tw-py-2">
            <Typography fontWeight={600}>{profile?.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.email}
            </Typography>
            {profile && (
              <Chip size="small" color="primary" className="tw-mt-2" label={$t({ id: `role.${profile.role}` })} />
            )}
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <MdLogout />
            </ListItemIcon>
            {$t({ id: 'auth.logout' })}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
