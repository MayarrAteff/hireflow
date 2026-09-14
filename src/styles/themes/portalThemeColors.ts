import type { PortalTheme } from '../../types/general.types';

/** Per-portal brand colours. Consumed by tw-colors (`tw-bg-primary`) and by the MUI palette. */
export const portalThemeColors: Record<
  PortalTheme,
  { primary: string; 'primary-dark': string; 'primary-light': string }
> = {
  recruiter: { primary: '#4F46E5', 'primary-dark': '#4338CA', 'primary-light': '#EEF2FF' },
  candidate: { primary: '#0D9488', 'primary-dark': '#0F766E', 'primary-light': '#F0FDFA' },
  admin: { primary: '#DB2777', 'primary-dark': '#BE185D', 'primary-light': '#FDF2F8' },
};
