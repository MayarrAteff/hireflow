import type { TypographyVariantsOptions } from '@mui/material/styles';

import type { Locale } from '@/types/general.types';

export function Typography(locale: Locale): TypographyVariantsOptions {
  const fontFamily = locale === 'ar' ? `'Cairo', sans-serif` : `'Poppins', sans-serif`;

  return {
    fontFamily,
    h1: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.25 },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  };
}
