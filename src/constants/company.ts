/** Headcount bands shown in the company size picker and on job pages ("{size} employees"). */
export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] as const;

export const COMPANY_LIMITS = {
  name: 100,
  industry: 60,
  about: 2000,
} as const;

export const MAX_LOGO_SOURCE_BYTES = 5 * 1024 * 1024;
export const LOGO_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
