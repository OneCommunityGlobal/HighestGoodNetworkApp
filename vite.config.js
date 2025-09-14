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
    // https://stackoverflow.com/a/77824845
    define: {
      ...Object.keys(env).reduce((prev, key) => {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');

        // eslint-disable-next-line no-param-reassign
        prev[`process.env.${sanitizedKey}`] = JSON.stringify(env[key]);

        return prev;
      }, {}),
    },
    server: {
      proxy: {
        '/api': 'http://localhost:4500',
      },
    },
    build: {
      outDir: 'build',
    },
    plugins: [react()],
  };
});
