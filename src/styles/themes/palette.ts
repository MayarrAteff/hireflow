import type { PaletteOptions } from '@mui/material/styles';

import type { PortalTheme, ThemeMode } from '@/types/general.types';

import { portalThemeColors } from './portalThemeColors';

export function Palette(mode: ThemeMode, portal: PortalTheme): PaletteOptions {
  const brand = portalThemeColors[portal];
  const isDark = mode === 'dark';

  return {
    mode,
    primary: {
      main: brand.primary,
      dark: brand['primary-dark'],
      light: brand['primary-light'],
      contrastText: '#FFFFFF',
    },
    secondary: { main: '#0EA5E9' },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
    error: { main: '#DC2626' },
    background: {
      default: isDark ? '#0B1120' : '#F6F7FB',
      paper: isDark ? '#111827' : '#FFFFFF',
    },
    text: {
      primary: isDark ? '#F3F4F6' : '#111827',
      secondary: isDark ? '#9CA3AF' : '#6B7280',
    },
    divider: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
  };
}
