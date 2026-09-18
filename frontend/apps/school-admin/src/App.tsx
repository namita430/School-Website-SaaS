import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import { API_BASE_URL } from './api/client';
import { useAuthStore } from './store/authStore';
import type { AuthResponse } from './types/auth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  // On load, the in-memory access token is gone (page was reloaded) but the
  // httpOnly refresh cookie may still be valid - try to silently resume the
  // session before rendering any protected route.
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
      <BrowserRouter basename="/admin">
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
