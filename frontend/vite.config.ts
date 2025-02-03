import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-router-dom'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://backend:8080',
        ws: true
      }
    },
  },
});
