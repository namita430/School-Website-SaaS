import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHomePage, getPageBySlug } from '../api/site';
import { ApiError } from '../api/client';
import { applyPageHead } from '../lib/applySeo';
import { useSite } from '../context/SiteContext';
import PageRenderer from '../components/renderer/PageRenderer';
import NotFoundPage from './NotFoundPage';

/** Renders the home page at "/" or a specific page at "/:slug" - same component either way. */
export default function SitePage() {
  const { slug } = useParams<{ slug?: string }>();
  const site = useSite();

  const pageQuery = useQuery({
    queryKey: ['public-page', slug ?? 'home'],
    queryFn: () => (slug ? getPageBySlug(slug) : getHomePage()),
    retry: false,
  });

  useEffect(() => {
    if (pageQuery.data) {
      applyPageHead(pageQuery.data, site.schoolName);
    }
  }, [pageQuery.data, site.schoolName]);

  if (pageQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading…</div>;
  }

  if (pageQuery.isError || !pageQuery.data) {
    const message = pageQuery.error instanceof ApiError ? pageQuery.error.message : 'This page could not be loaded.';
    return <NotFoundPage message={message} />;
  }

  return <PageRenderer content={pageQuery.data.contentJson} />;
}
