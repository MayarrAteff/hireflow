import type { ReactNode } from 'react';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type ThemeMode = 'light' | 'dark';
export type PortalTheme = 'recruiter' | 'candidate' | 'admin';

export type ChildProp = {
  children: ReactNode;
};

export type SnackbarEvent = {
  message: string;
  variant: 'default' | 'error' | 'success' | 'warning' | 'info';
};
