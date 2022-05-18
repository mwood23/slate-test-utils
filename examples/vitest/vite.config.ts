/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react({
      jsxRuntime: mode == 'test' ? 'classic' : 'automatic'
    })],
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
      globals: true,
      setupFiles: ['./config/setupTests.js'],

    }
  }
})
