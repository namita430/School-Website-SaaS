import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This app is the single port the browser talks to: it owns "/" (the
// tenant's public site) and proxies /admin and /super-admin through to
// those apps' own dev servers, plus /api to the backend - so the whole
// platform is reachable from one origin (http://localhost:5175) instead of
// three. Each of those apps still runs its own `npm run dev` process; this
// just fronts them.
export default defineConfig({
  plugins: [
    react(),
    {
      // The target dev servers (base: '/admin/', '/super-admin/') only
      // recognize their own base WITH the trailing slash - "/admin" alone
      // 404s there. Redirect the bare form before the proxy forwards it, so
      // typing the prefix without a trailing slash still works.
      name: 'admin-path-trailing-slash-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin' || req.url === '/super-admin') {
            res.writeHead(302, { Location: `${req.url}/` });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5175,
    proxy: {
      '/admin': { target: 'http://localhost:5174', changeOrigin: true, ws: true },
      '/super-admin': { target: 'http://localhost:5173', changeOrigin: true, ws: true },
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
