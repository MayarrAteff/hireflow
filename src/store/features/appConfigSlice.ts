import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { appDirection, STORAGE_KEYS } from '@/constants/app';
import { localStorage } from '@/services/localStorage.service';
import type { Direction, Locale, PortalTheme, ThemeMode } from '@/types/general.types';

type AppConfigState = {
  sidebarActive: boolean;
  portalTheme: PortalTheme;
  themeMode: ThemeMode;
  locale: Locale;
  dir: Direction;
};

function readLocale(): Locale {
  return localStorage.getItem(STORAGE_KEYS.locale) === 'ar' ? 'ar' : 'en';
}

function readThemeMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEYS.themeMode);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light';
}

/** `dir`, `lang` and the `dark` class live on <html>; portal colour tokens resolve from `.theme-<portal>` on <body>. */
function applyDocumentLocale(locale: Locale) {
  const html = document.documentElement;
  html.dir = appDirection[locale];
  html.lang = locale;
}

function applyDocumentThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

function applyPortalThemeClass(theme: PortalTheme) {
  document.body.className = `theme-${theme}`;
}

const initialLocale = readLocale();
const initialThemeMode = readThemeMode();

// Apply persisted preferences before first paint; the store is imported at bootstrap.
applyDocumentLocale(initialLocale);
applyDocumentThemeMode(initialThemeMode);
applyPortalThemeClass('candidate');

const initialState: AppConfigState = {
  sidebarActive: localStorage.getItem(STORAGE_KEYS.sidebarActive) !== 'false',
  portalTheme: 'candidate',
  themeMode: initialThemeMode,
  locale: initialLocale,
  dir: appDirection[initialLocale],
};

const appConfigSlice = createSlice({
  name: 'appConfig',
  initialState,
  reducers: {
    sidebarToggle(state) {
      state.sidebarActive = !state.sidebarActive;
      localStorage.setItem(STORAGE_KEYS.sidebarActive, `${state.sidebarActive}`);
    },
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
      state.dir = appDirection[action.payload];
      applyDocumentLocale(action.payload);
      localStorage.setItem(STORAGE_KEYS.locale, action.payload);
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      applyDocumentThemeMode(state.themeMode);
      localStorage.setItem(STORAGE_KEYS.themeMode, state.themeMode);
    },
    setPortalTheme(state, action: PayloadAction<PortalTheme>) {
      state.portalTheme = action.payload;
      applyPortalThemeClass(action.payload);
    },
  },
});

export const appConfigReducer = appConfigSlice.reducer;
export const { sidebarToggle, setLocale, toggleThemeMode, setPortalTheme } = appConfigSlice.actions;
