import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The whole platform is this one app on this one port: the platform itself
// (landing page, login, Super Admin, School Admin) on localhost:5173, and
// each school's public website on its own subdomain of the same port
// (demo.localhost:5173, ...) - see src/App.tsx. /api is proxied to the
// backend so the browser only ever talks to this origin. strictPort makes a
// busy 5173 an error instead of silently moving to a different port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
