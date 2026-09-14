import { alpha, darken, lighten, type Theme } from '@mui/material/styles';

/** Playful colours for icon tiles, avatars and stats, independent of the portal brand. */
export const ACCENT_COLORS = {
  violet: '#8B5CF6',
  pink: '#EC4899',
  amber: '#F59E0B',
  emerald: '#10B981',
  sky: '#0EA5E9',
  rose: '#F43F5E',
} as const;

export type AccentColor = keyof typeof ACCENT_COLORS;

export const ACCENT_ORDER: AccentColor[] = ['violet', 'amber', 'emerald', 'sky', 'pink', 'rose'];

/** Soft background + readable foreground for a coloured tile, in either theme mode. */
export function accentSoftSx(theme: Theme, color: AccentColor) {
  const main = ACCENT_COLORS[color];
  const isDark = theme.palette.mode === 'dark';
  return {
    bgcolor: alpha(main, isDark ? 0.2 : 0.14),
    color: isDark ? lighten(main, 0.35) : darken(main, 0.15),
  };
}

/** Stable accent for any string, e.g. to colour a job's avatar by its title. */
export function accentFor(key: string): AccentColor {
  const hash = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ACCENT_ORDER[hash % ACCENT_ORDER.length];
}

export function brandGradient(theme: Theme, angle = 135) {
  return `linear-gradient(${angle}deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;
}
