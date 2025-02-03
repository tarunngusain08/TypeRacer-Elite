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
        target: 'http://localhost:8080', // Change 'backend' to 'localhost'
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8080', // Change 'backend' to 'localhost'
        ws: true,
      },
    },
  },
});
