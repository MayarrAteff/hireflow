import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet } from '@tanstack/react-router';
import { MotionConfig } from 'framer-motion';
import { useState } from 'react';

import { DecorativeBackground } from '@/components/UI/DecorativeBackground';
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
    // Floating illustrations and entrance animations stay still for users who prefer reduced motion.
    <MotionConfig reducedMotion="user">
      <Box className="flex min-h-screen" sx={{ bgcolor: 'background.default' }}>
        <DecorativeBackground />
        <Sidebar
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : sidebarActive}
          onClose={() => setMobileOpen(false)}
        />
        <Box className="relative z-[1] flex min-w-0 flex-1 flex-col">
          <Header onToggleSidebar={toggleSidebar} />
          <Box component="main" className="flex-1 p-4 md:p-8">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </MotionConfig>
  );
}
