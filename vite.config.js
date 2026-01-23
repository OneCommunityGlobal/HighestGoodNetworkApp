import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    resolve: {
      alias: {
        '~': resolve('src/'),
      },
    },
    define: {
      ...Object.keys(env).reduce((prev, key) => {
        const sanitizedKey = key.replace(/^a-zA-Z0-9_]/g, '_');

        // eslint-disable-next-line no-param-reassign
        prev[`process.env.${sanitizedKey}`] = JSON.stringify(env[key]);
        return prev;
      }, {}),
    },
    build: {
      outDir: 'build',
    },
    plugins: [
      react({
        babel: {
          plugins: ['@babel/plugin-proposal-logical-assignment-operators'],
        },
      }),
    ],
    optimizeDeps: {
      include: ['react-popper'], // helps with old reactstrap dependency
    },
  };
});
