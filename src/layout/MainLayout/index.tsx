import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';

import { useFeatureFlagsSync } from '@/hooks/useFeatureFlagsSync';
import { sidebarToggle } from '@/store/features/appConfigSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const sidebarActive = useAppSelector((state) => state.appConfig.sidebarActive);
  const [mobileOpen, setMobileOpen] = useState(false);

  useFeatureFlagsSync();

  const toggleSidebar = () => (isMobile ? setMobileOpen((open) => !open) : dispatch(sidebarToggle()));

  return (
    <Box className="tw-flex tw-min-h-screen" sx={{ bgcolor: 'background.default' }}>
      <Sidebar
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : sidebarActive}
        onClose={() => setMobileOpen(false)}
      />
      <Box className="tw-flex tw-min-w-0 tw-flex-1 tw-flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <Box component="main" className="tw-flex-1 tw-p-4 md:tw-p-8">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
