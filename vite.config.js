import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin xu ly CORS preflight (OPTIONS) truc tiep, khong qua proxy toi Odoo
function corsPreflightPlugin() {
  return {
    name: 'cors-preflight',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/') && req.method === 'OPTIONS') {
          const origin = req.headers.origin || 'http://localhost:3000';
          res.writeHead(204, {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept',
            'Access-Control-Max-Age': '86400',
          });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), corsPreflightPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        onProxyRes(_proxyRes, _req, res) {
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        },
      },
      '/web': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/im_livechat': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/web/static': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});