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
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4500', //  backend port
          changeOrigin: true, //  ensures proper Host header forwarding
          secure: false, //  skip HTTPS verification if local
        },
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
    plugins: [react()],
  };
});
