import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': resolve('src/'),
      __tests__: resolve('src/__tests__'),
    },
  },

  test: {
    environment: 'jsdom',
    environmentOptions: {
      url: 'http://localhost/',
    },
    globals: true,
    setupFiles: ['./src/setupTests.js'],

    // Timeout configurations to prevent premature failures
    testTimeout: 30000, // 30 seconds per test (increased for complex tests)
    hookTimeout: 30000, // 30 seconds for hooks
    teardownTimeout: 10000, // 10 seconds for teardown

    // Clear mocks automatically between tests
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Isolate tests to prevent memory leaks
    isolate: true,

    // Use forks instead of threads for better memory cleanup
    pool: 'forks',
    poolOptions: {
      forks: {
        // Allow multiple forks in CI to speed up execution while maintaining isolation
        // singleFork: true is too slow for 294+ test files
        singleFork: false,
      },
    },

    // CI memory management - allow limited concurrency for better performance
    // With 294+ test files, sequential execution is too slow
    maxConcurrency: process.env.CI ? 2 : 5, // 2 concurrent test files in CI, 5 locally
    sequence: {
      concurrent: true, // Allow concurrent execution (controlled by maxConcurrency)
      shuffle: false, // Keep deterministic test order
    },

    // INCLUDE ALL YOUR TEST PATTERNS
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/__tests__/**/*.{js,jsx,ts,tsx}',
      'src/components/__tests__/**/*.{js,jsx,ts,tsx}',
      'src/components/**/__tests__/**/*.{js,jsx,ts,tsx}', // BMDashboard style
      'src/components/**/tests/**/*.{js,jsx,ts,tsx}', // Your mentioned tests folders
    ],

    coverage: {
      provider: 'v8',

      // COLLECT FROM ALL SOURCE FILES
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/**',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/__tests__/**',
        'src/components/__tests__/**',
        'src/components/**/__tests__/**',
        'src/components/**/tests/**',
        'src/**/*MockData.{js,jsx}',
        'src/setupTests.js',
        'src/index.js',
        'src/reportWebVitals.js',
        'src/components/Badge/**',
        'src/components/UserProfile/**',
      ],

      // START LOWER THEN INCREASE GRADUALLY
      thresholds: {
        lines: 34, // Start realistic
        functions: 42,
        branches: 69,
        statements: 34,
        autoUpdate: false,
        perFile: false,
      },

      reporter: ['text', 'text-summary', 'html', 'lcov', 'json'],
      all: true,
      reportsDirectory: './coverage',
    },
  },
});
