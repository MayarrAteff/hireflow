import { alpha, lighten, type PaletteOptions } from '@mui/material/styles';

import type { PortalTheme, ThemeMode } from '@/types/general.types';

import { portalThemeColors } from './portalThemeColors';

/** Page and card surfaces carry a faint tint of the portal brand so each portal feels distinct. */
const surfaces: Record<PortalTheme, Record<ThemeMode, { default: string; paper: string }>> = {
  recruiter: { light: { default: '#F7F4FF', paper: '#FFFFFF' }, dark: { default: '#1C1A30', paper: '#262440' } },
  candidate: { light: { default: '#F1FAF8', paper: '#FFFFFF' }, dark: { default: '#16242A', paper: '#1F3138' } },
  admin: { light: { default: '#FFF5F7', paper: '#FFFFFF' }, dark: { default: '#271A24', paper: '#342431' } },
};

export function Palette(mode: ThemeMode, portal: PortalTheme): PaletteOptions {
  const brand = portalThemeColors[portal];
  const isDark = mode === 'dark';
  // Slightly lifted brand colours keep links and outlined text readable on dark surfaces.
  const main = isDark ? lighten(brand.primary, 0.18) : brand.primary;
  const accent = isDark ? lighten(brand.accent, 0.12) : brand.accent;

  return {
    mode,
    primary: {
      main,
      dark: brand['primary-dark'],
      // The pastel tint glares on dark surfaces, so dark mode uses a translucent brand tint instead.
      light: isDark ? alpha(brand.primary, 0.24) : brand['primary-light'],
      contrastText: '#FFFFFF',
    },
    secondary: { main: accent, contrastText: '#FFFFFF' },
    info: { main: '#0EA5E9' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    background: surfaces[portal][mode],
    text: {
      primary: isDark ? '#EDEBF7' : '#1E1B3A',
      secondary: isDark ? '#ADAAC4' : '#6B6784',
    },
    divider: isDark ? 'rgba(255,255,255,0.1)' : alpha(brand.primary, 0.12),
  };
}
