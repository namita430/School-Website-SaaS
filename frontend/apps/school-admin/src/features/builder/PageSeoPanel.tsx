import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePageSeo } from '../../api/seo';
import type { PageSummary } from '../../types/builder';
import { ApiError } from '../../api/client';

/** Per-page SEO override editor - leaving a field blank falls back to the site-wide default (SeoPage). */
export default function PageSeoPanel({ page, onClose }: { page: PageSummary; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [metaDescription, setMetaDescription] = useState(page.metaDescription ?? '');
  const [ogImageUrl, setOgImageUrl] = useState(page.ogImageUrl ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMetaDescription(page.metaDescription ?? '');
    setOgImageUrl(page.ogImageUrl ?? '');
  }, [page.id]);

  const mutation = useMutation({
    mutationFn: () => updatePageSeo(page.id, metaDescription || null, ogImageUrl || null),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['pages', page.id] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not save SEO'),
  });

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-secondary">Page SEO</p>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-secondary">
          Close
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Meta description (overrides site default)</label>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Open Graph image URL (overrides site default)</label>
          <input
            type="url"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="mt-3 rounded-md bg-secondary text-white text-xs font-medium px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Save SEO'}
      </button>
    </div>
  );
}
