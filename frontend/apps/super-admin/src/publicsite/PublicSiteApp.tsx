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
 * A school's own public website. Rendered by the top-level App whenever the
 * browser is on a school's address (demo.localhost, riverside.localhost, or
 * the school's own domain) rather than the platform's own host - see
 * lib/hosts.ts. The whole platform is one app on one port: the hostname,
 * not a separate port or app, decides whether you see the platform
 * (landing, login, dashboards) or a specific school's site.
 */
function SiteRoutes() {
  const siteQuery = useQuery({ queryKey: ['public-site'], queryFn: getSite, retry: false });

  useEffect(() => {
    if (siteQuery.data) {
      applyTheme(siteQuery.data.themeTokens);
      applySiteHead(siteQuery.data);
    }
  }, [siteQuery.data]);

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

export default function PublicSiteApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
