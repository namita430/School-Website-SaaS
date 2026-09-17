import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type NavItem, createNavItem, deleteNavItem, listNavItems, updateNavItem } from '../api/navigation';
import { listPages } from '../api/pages';
import { ApiError } from '../api/client';

/**
 * Manages the public site's persistent nav links. If this list is empty, the
 * public site automatically falls back to listing every published page
 * (see PublicSiteService.getNavigation() on the backend) - so a school never
 * needs to visit this page just to get a basic clickable site; it's only
 * needed to customize the order, labels, or which pages show up in the menu.
 */
export default function NavigationPage() {
  const queryClient = useQueryClient();
  const listQuery = useQuery({ queryKey: ['navigation'], queryFn: listNavItems });
  const pagesQuery = useQuery({ queryKey: ['pages', 'nav-picker'], queryFn: listPages });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditingId(null);
    setLabel('');
    setUrl('');
  }, []);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['navigation'] });

  const nextSortOrder = (listQuery.data?.length ?? 0) * 10;

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? updateNavItem(editingId, label, url, listQuery.data?.find((n) => n.id === editingId)?.sortOrder ?? 0)
        : createNavItem(label, url, nextSortOrder),
    onSuccess: () => {
      setLabel('');
      setUrl('');
      setEditingId(null);
      setError(null);
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not save'),
  });

  const deleteMutation = useMutation({ mutationFn: deleteNavItem, onSuccess: invalidate });

  const moveMutation = useMutation({
    mutationFn: ({ a, b }: { a: NavItem; b: NavItem }) =>
      Promise.all([updateNavItem(a.id, a.label, a.url, b.sortOrder), updateNavItem(b.id, b.label, b.url, a.sortOrder)]),
    onSuccess: invalidate,
  });

  const items = listQuery.data ?? [];

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    moveMutation.mutate({ a: items[index], b: items[target] });
  };

  const startEdit = (item: NavItem) => {
    setEditingId(item.id);
    setLabel(item.label);
    setUrl(item.url);
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">Navigation</h1>
      <p className="text-sm text-gray-500 mb-6">
        Links shown in the public site's header. Leave empty and every published page is listed automatically,
        home page first.
      </p>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">{editingId ? 'Edit link' : 'New link'}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="About"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/about"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {!!pagesQuery.data?.length && (
            <div className="flex flex-wrap gap-1.5">
              {pagesQuery.data.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setLabel(p.title);
                    setUrl(p.isHome ? '/' : `/${p.slug}`);
                  }}
                  className="text-xs rounded-full border border-gray-200 px-2.5 py-1 text-gray-500 hover:border-primary hover:text-primary"
                >
                  {p.title}
                  {!p.isPublished && ' (draft)'}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saveMutation.isPending || !label || !url}
              className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : editingId ? 'Save changes' : 'Add link'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setLabel('');
                  setUrl('');
                }}
                className="text-sm text-gray-500 hover:text-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {listQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-secondary truncate">{item.label}</p>
              <p className="text-xs text-gray-400 truncate">{item.url}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-xs text-gray-400 hover:text-secondary disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="text-xs text-gray-400 hover:text-secondary disabled:opacity-30"
              >
                ↓
              </button>
              <button onClick={() => startEdit(item)} className="text-xs text-primary font-medium">
                Edit
              </button>
              <button onClick={() => deleteMutation.mutate(item.id)} className="text-xs text-gray-400 hover:text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !listQuery.isLoading && (
        <p className="text-sm text-gray-400">
          No custom links yet — the public site is showing every published page automatically.
        </p>
      )}
    </div>
  );
}
