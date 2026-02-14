import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src/'),
      __tests__: resolve(__dirname, 'src/__tests__'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(__dirname, 'src/setupTests.js')],
    testTimeout: 15000,
    hookTimeout: 15000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
