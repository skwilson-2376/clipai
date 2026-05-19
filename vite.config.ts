import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isMobile = process.env.CAP_BUILD === '1';

  return {
    plugins: [react()],
    // Capacitor loads the app from the filesystem so base must be './'
    base: isMobile ? './' : '/',
    server: {
      port: 3000,
      proxy: {
        // Forward API calls to the Rust backend in dev
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      // Keep sourcemaps for easier debugging
      sourcemap: mode === 'development',
    },
  };
});
