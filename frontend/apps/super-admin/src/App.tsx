import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import PublicSiteApp from './publicsite/PublicSiteApp';
import { isPlatformHost } from './publicsite/lib/hosts';
import { API_BASE_URL } from './api/client';
import { useAuthStore } from './store/authStore';
import type { AuthResponse } from './types/auth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function PlatformApp() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  // Try the refresh cookie once on load before rendering any protected
  // route, so a reload silently resumes an existing session.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (res.ok) setSession((await res.json()) as AuthResponse);
      })
      .catch(() => undefined)
      .finally(() => setBootstrapped(true));
  }, [setSession]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * One app, one port. The address decides what you see: the platform host
 * (localhost / the apex domain) shows the login and the Super
 * Admin / School Admin dashboards; a school's address (demo.localhost, ...)
 * is that school's public website.
 */
export default function App() {
  return isPlatformHost() ? <PlatformApp /> : <PublicSiteApp />;
}
