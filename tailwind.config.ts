import type { Config } from 'tailwindcss';
import tailwindcssRtl from 'tailwindcss-rtl';
import { createThemes } from 'tw-colors';

import { portalThemeColors } from './src/styles/themes/portalThemeColors';

export default {
  prefix: 'tw-',
  important: 'body',
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindcssRtl,
    createThemes(portalThemeColors, {
      produceThemeClass: (themeName) => `theme-${themeName}`,
    }),
  ],
} satisfies Config;
