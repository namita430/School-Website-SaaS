import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import { API_BASE_URL } from './api/client';
import { useAuthStore } from './store/authStore';
import type { AuthResponse } from './types/auth';
// aaa
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  // Same silent-resume pattern as school-admin: try the refresh cookie once
  // on load before rendering any protected route. A resumed session that
  // turns out not to be SUPER_ADMIN just falls through to ProtectedRoute's
  // redirect, same as a fresh non-admin login attempt.
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
      <BrowserRouter basename="/super-admin">
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
