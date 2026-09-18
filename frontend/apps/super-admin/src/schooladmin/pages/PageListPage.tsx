import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPage, deletePage, listPages, setHomePage } from '../api/pages';
import { generateSite, type GenerateSiteResult } from '../api/ai';
import { ApiError } from '../../api/client';

function AiGeneratorPanel({ onGenerated }: { onGenerated: () => void }) {
  const [schoolType, setSchoolType] = useState('');
  const [location, setLocation] = useState('');
  const [style, setStyle] = useState('modern');
  const [result, setResult] = useState<GenerateSiteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => generateSite({ schoolType: schoolType || undefined, location: location || undefined, style }),
    onSuccess: (r) => {
      setResult(r);
      setError(null);
      onGenerated();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not generate site'),
  });

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
      <p className="text-sm font-medium text-gray-700 mb-1">Generate a starter site</p>
      <p className="text-xs text-gray-400 mb-3">
        Creates Home, About, Academics, Admissions, Teachers, Facilities, Gallery, Events, News, and Contact
        pages (skipping any that already exist) plus a matching theme. Everything is a draft you can edit
        and publish yourself.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">School type</label>
          <input
            value={schoolType}
            onChange={(e) => setSchoolType(e.target.value)}
            placeholder="Secondary School"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kathmandu"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="playful">Playful</option>
          </select>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-md bg-secondary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result && (
        <p className="mt-2 text-xs text-green-600">
          Created {result.createdPageSlugs.length} page(s)
          {result.skippedPageSlugs.length > 0 && ` (skipped ${result.skippedPageSlugs.length} that already existed)`}
          {result.themeApplied && ' and applied a matching theme'}.
        </p>
      )}
    </div>
  );
}

export default function PageListPage() {
  const queryClient = useQueryClient();
  const pagesQuery = useQuery({ queryKey: ['pages'], queryFn: listPages });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pages'] });
    queryClient.invalidateQueries({ queryKey: ['theme', 'me'] });
  };

  const createMutation = useMutation({
    mutationFn: () => createPage(title, slug),
    onSuccess: () => {
      setTitle('');
      setSlug('');
      setFormError(null);
      invalidate();
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not create page'),
  });

  const setHomeMutation = useMutation({ mutationFn: setHomePage, onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: deletePage, onSuccess: invalidate });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-6">Pages</h1>

      <AiGeneratorPanel onGenerated={invalidate} />

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">New page</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="About Us"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="about-us"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !title || !slug}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
      </div>

      {pagesQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {pagesQuery.data?.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-secondary">
                {page.title}
                {page.isHome && (
                  <span className="ml-2 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">Home</span>
                )}
                <span
                  className={`ml-2 rounded-full text-xs px-2 py-0.5 ${
                    page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {page.isPublished ? 'Published' : 'Unpublished'}
                </span>
              </p>
              <p className="text-xs text-gray-400">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              {!page.isHome && (
                <button
                  onClick={() => setHomeMutation.mutate(page.id)}
                  className="text-xs text-gray-500 hover:text-secondary"
                >
                  Set as home
                </button>
              )}
              <Link to={`/schooladmin/website/builder/${page.id}`} className="text-xs text-primary font-medium">
                Edit
              </Link>
              {!page.isHome && (
                <button
                  onClick={() => deleteMutation.mutate(page.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {pagesQuery.data?.length === 0 && (
        <p className="text-sm text-gray-400">No pages yet — create one above.</p>
      )}
    </div>
  );
}
