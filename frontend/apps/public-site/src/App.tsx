import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getSite } from './api/site';
import { applyTheme } from './lib/applyTheme';
import { applySiteHead } from './lib/applySeo';
import { SiteContext } from './context/SiteContext';
import SitePage from './pages/SitePage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function SiteTitleSync() {
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
