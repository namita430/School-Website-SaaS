import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served under /admin behind the public-site gateway (see public-site's
// vite.config.ts proxy) - base and the router's basename must match that
// prefix so asset URLs and client-side routes resolve correctly both behind
// the gateway and when this app is run standalone on its own port.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
