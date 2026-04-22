import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-modules',
      enforce: 'pre',
      resolveId(id, importer) {
        if (id === '@tanstack/react-query') {
          return '\0' + id;
        }
        if (id === 'antd') {
          return '\0' + id;
        }
        // Handle react/jsx-runtime imports - check if it's being imported as a file path
        if (id === 'react/jsx-runtime' || id.endsWith('react/jsx-runtime')) {
          const jsPath = resolve('node_modules/react/jsx-runtime.js');
          return jsPath;
        }
        if (id === 'react/jsx-dev-runtime' || id.endsWith('react/jsx-dev-runtime')) {
          const jsPath = resolve('node_modules/react/jsx-dev-runtime.js');
          return jsPath;
        }
        return null;
      },
      load(id) {
        // Also handle loading react/jsx-runtime if it comes through as a file path
        if (
          id === resolve('node_modules/react/jsx-runtime.js') ||
          id.includes('react/jsx-runtime')
        ) {
          return null; // Let vite handle it normally
        }
        if (
          id === resolve('node_modules/react/jsx-dev-runtime.js') ||
          id.includes('react/jsx-dev-runtime')
        ) {
          return null; // Let vite handle it normally
        }
        if (id === '\0@tanstack/react-query') {
          return `
            export const useQuery = () => ({
              data: undefined,
              isLoading: false,
              isError: false,
              error: null,
              refetch: () => Promise.resolve(),
            });
            export const useMutation = () => ({
              mutate: () => {},
              mutateAsync: () => Promise.resolve(),
              isLoading: false,
              isError: false,
              error: null,
            });
            export class QueryClient {
              constructor() {
                this.setQueryData = () => {};
                this.getQueryData = () => {};
                this.invalidateQueries = () => {};
                this.refetchQueries = () => {};
              }
            }
            export const QueryClientProvider = ({ children }) => children;
          `;
        }
        if (id === '\0antd') {
          return `
            import React from 'react';
            export const Select = ({ children, ...props }) => React.createElement('select', props, children);
            export const DatePicker = (props) => React.createElement('input', { type: 'date', ...props });
            export const Spin = ({ children, ...props }) => React.createElement('div', props, children);
          `;
        }
      },
    },
  ],
  resolve: {
    alias: {
      '~': resolve('src/'),
      __tests__: resolve('src/__tests__'),
      'joi-browser': resolve('node_modules/joi'),
      'react/jsx-runtime$': resolve('node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime$': resolve('node_modules/react/jsx-dev-runtime.js'),
    },
  },
  css: {
    modules: {
      classNameStrategy: 'non-scoped',
    },
  },

  optimizeDeps: {
    include: ['react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
  },
});
