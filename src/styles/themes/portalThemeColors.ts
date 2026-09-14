import type { PortalTheme } from '../../types/general.types';

/** Per-portal brand colours. Consumed by tw-colors (`tw-bg-primary`, `tw-bg-accent`) and by the MUI palette. */
export const portalThemeColors: Record<
  PortalTheme,
  { primary: string; 'primary-dark': string; 'primary-light': string; accent: string }
> = {
  recruiter: { primary: '#7C3AED', 'primary-dark': '#6D28D9', 'primary-light': '#F1EBFF', accent: '#DB2777' },
  candidate: { primary: '#0D9488', 'primary-dark': '#0F766E', 'primary-light': '#DDF6F1', accent: '#0284C7' },
  admin: { primary: '#E11D48', 'primary-dark': '#BE123C', 'primary-light': '#FFE8EE', accent: '#EA580C' },
};
