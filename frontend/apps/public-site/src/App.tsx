import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getSite } from './api/site';
import { applyTheme } from './lib/applyTheme';
import { applySiteHead } from './lib/applySeo';
import { SiteContext } from './context/SiteContext';
import SitePage from './pages/SitePage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

/**
 * The platform's one landing page (and the one login for Super Admin and
 * School Admin) lives in the merged app, not here - this app only renders a
 * specific school's own public site. A bare host (no school subdomain, e.g.
 * "localhost" in dev or the apex domain in production), or a host no school
 * resolves for, is therefore sent to that landing page instead of getting a
 * second copy of it.
 */
const APP_URL = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173';
const PUBLIC_BASE_DOMAIN = import.meta.env.VITE_PUBLIC_BASE_DOMAIN ?? 'localhost';

function isBareHost(): boolean {
  const hostname = window.location.hostname;
  return hostname === PUBLIC_BASE_DOMAIN || hostname === '127.0.0.1';
}

function RedirectToPlatform() {
  useEffect(() => {
    window.location.replace(`${APP_URL}/super-admin/`);
  }, []);
  return null;
}

function SiteTitleSync() {
  const siteQuery = useQuery({
    queryKey: ['public-site'],
    queryFn: getSite,
    retry: false,
    enabled: !isBareHost(),
  });

  useEffect(() => {
    if (siteQuery.data) {
      applyTheme(siteQuery.data.themeTokens);
      applySiteHead(siteQuery.data);
    }
  }, [siteQuery.data]);

  if (isBareHost()) {
    return <RedirectToPlatform />;
  }

  if (siteQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading…</div>;
  }
  if (siteQuery.isError || !siteQuery.data) {
    return <RedirectToPlatform />;
  }

  return (
    <SiteContext.Provider value={siteQuery.data}>
      <div className="min-h-screen bg-site-bg text-site-text font-body">
        <Header />
        <Routes>
          <Route path="/" element={<SitePage />} />
          <Route path="/:slug" element={<SitePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </SiteContext.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteTitleSync />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
