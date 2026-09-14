import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), svgr(), react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3004,
  },
});
