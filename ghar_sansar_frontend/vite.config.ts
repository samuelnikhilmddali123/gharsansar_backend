import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '^/products/.+': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '^/blogs/.+': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '^/profile_pictures/.+': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '^/return%20gifts/.+': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
