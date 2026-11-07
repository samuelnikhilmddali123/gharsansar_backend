import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback-products-fix',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/products' || req.url?.startsWith('/products?')) {
            req.url = '/index.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      },
      '^/products/.+': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      },
      '^/blogs/.+': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      },
      '^/profile_pictures/.+': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      },
      '^/return%20gifts/.+': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
