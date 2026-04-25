import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const sanitizedEnvDefines = Object.keys(env).reduce((prev, key) => {
    const normalizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
    const sanitizedKey = /^[0-9]/.test(normalizedKey) ? `_${normalizedKey}` : normalizedKey;

    // eslint-disable-next-line no-param-reassign
    prev[`process.env.${sanitizedKey}`] = JSON.stringify(env[key]);

    return prev;
  }, {});

  return {
    base: '/',
    resolve: {
      alias: {
        '~': resolve('src/'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:4500',
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      ...sanitizedEnvDefines,
    },
    build: {
      outDir: 'build',
    },
    plugins: [
      react({
        babel: {
          plugins: ['@babel/plugin-transform-logical-assignment-operators'],
        },
      }),
    ],
    optimizeDeps: {
      include: [
        'react-popper',
        'react-datepicker',
        'react-tooltip',
        'react-bootstrap',
        'libphonenumber-js/max',
      ],
      force: true, // force re-bundle after cache issues; set to false once deps load
    },
  };
});
