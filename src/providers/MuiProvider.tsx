import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMemo } from 'react';
import stylisRTLPlugin from 'stylis-plugin-rtl';

import { useAppSelector } from '@/store/hooks';
import { ComponentsOverrides } from '@/styles/themes/overrides';
import { Palette } from '@/styles/themes/palette';
import { Typography } from '@/styles/themes/typography';
import type { ChildProp } from '@/types/general.types';

// Created once at module level so emotion doesn't rebuild caches on every render.
const cacheRtl = createCache({ key: 'muirtl', stylisPlugins: [stylisRTLPlugin] });
const cacheLtr = createCache({ key: 'muiltr' });

export function MuiProvider({ children }: Readonly<ChildProp>) {
  const { dir, locale, themeMode, portalTheme } = useAppSelector((state) => state.appConfig);

  const theme = useMemo(() => {
    const base = createTheme({
      direction: dir,
      palette: Palette(themeMode, portalTheme),
      typography: Typography(locale),
      shape: { borderRadius: 10 },
      breakpoints: { values: { xs: 0, sm: 768, md: 1024, lg: 1266, xl: 1536 } },
    });
    return createTheme(base, { components: ComponentsOverrides(base) });
  }, [dir, locale, themeMode, portalTheme]);

  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={dir === 'rtl' ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
}
