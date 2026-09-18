import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getSite } from './api/site';
import { applyTheme } from './lib/applyTheme';
import { applySiteHead } from './lib/applySeo';
import { SiteContext } from './context/SiteContext';
import SitePage from './pages/SitePage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

/**
 * A bare host (no school subdomain, e.g. "localhost" in dev or the apex
 * domain in production) never resolves a tenant - TenantResolutionFilter
 * only matches subdomains of PUBLIC_BASE_DOMAIN. Rather than let that hit
 * the API and render as a generic 404, treat it as the platform's own
 * landing page instead: same shape as production's yoursaas.com (apex) vs
 * {school}.yoursaas.com (a tenant) split.
 */
const PUBLIC_BASE_DOMAIN = import.meta.env.VITE_PUBLIC_BASE_DOMAIN ?? 'localhost';

function isBareHost(): boolean {
  const hostname = window.location.hostname;
  return hostname === PUBLIC_BASE_DOMAIN || hostname === '127.0.0.1';
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
    return <LandingPage />;
  }

  if (siteQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading…</div>;
  }
  if (siteQuery.isError || !siteQuery.data) {
    return <NotFoundPage message="This site could not be found." />;
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
