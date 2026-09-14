import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';
import type { UserRole } from '@/types/auth.types';
import type { Direction, Locale } from '@/types/general.types';

export const localeMessages: Record<Locale, Record<string, string>> = { en, ar };

export const appDirection: Record<Locale, Direction> = {
  en: 'ltr',
  ar: 'rtl',
};

export const roleHomePath: Record<UserRole, string> = {
  recruiter: '/recruiter/dashboard',
  candidate: '/candidate/dashboard',
  admin: '/admin/dashboard',
};

export const STORAGE_KEYS = {
  locale: 'hireflow-locale',
  themeMode: 'hireflow-theme-mode',
  sidebarActive: 'hireflow-sidebar-active',
} as const;

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
export const CV_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const DRAWER_WIDTH = 264;
export const PASSWORD_MIN_LENGTH = 8;
export const SNACKBAR_MAX = 3;
