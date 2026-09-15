import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CONTENT_MODULES } from '../features/content/contentConfig';
import { type ContentItem, createContent, deleteContent, listContent, updateContent } from '../api/content';
import { ApiError } from '../api/client';

/**
 * One generic page driven by CONTENT_MODULES[slug], rendering all 8 Phase 8
 * content types (notices/events/news/teachers/gallery/testimonials/
 * facilities/downloads) - see contentConfig.ts for why this isn't 8
 * separate hand-written pages.
 */
export default function ContentPage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const config = moduleSlug ? CONTENT_MODULES[moduleSlug] : undefined;
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ['content', config?.slug],
    queryFn: () => listContent(config!.apiPath),
    enabled: !!config,
  });

  useEffect(() => {
    // Reset the form whenever the module changes (navigating between content pages).
    setEditingId(null);
    setForm({});
    setFormError(null);
  }, [moduleSlug]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['content', config?.slug] });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId ? updateContent(config!.apiPath, editingId, form) : createContent(config!.apiPath, form),
    onSuccess: () => {
      setForm({});
      setEditingId(null);
      setFormError(null);
      invalidate();
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContent(config!.apiPath, id),
    onSuccess: invalidate,
  });

  if (!config) {
    return <div className="p-8 text-sm text-red-600">Unknown content module.</div>;
  }

  const startEdit = (item: ContentItem) => {
    setEditingId(item.id);
    const next: Record<string, unknown> = {};
    for (const field of config.fields) next[field.key] = item[field.key] ?? (field.type === 'checkbox' ? false : '');
    setForm(next);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-6">{config.title}</h1>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">{editingId ? 'Edit item' : 'New item'}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-3"
        >
          {config.fields.map((field) => (
            <div key={field.key}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.checked }))}
                  />
                  {field.label}
                </label>
              ) : (
                <>
                  <label className="block text-xs text-gray-500 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={(form[field.key] as string) ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  ) : (
                    <input
                      type={field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
                      value={(form[field.key] as string) ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  )}
                </>
              )}
            </div>
          ))}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {listQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {listQuery.data?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
          >
            <p className="text-sm font-medium text-secondary truncate">
              {String(item[config.titleField] ?? `#${item.id}`)}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => startEdit(item)} className="text-xs text-primary font-medium">
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {listQuery.data?.length === 0 && <p className="text-sm text-gray-400">Nothing here yet.</p>}
    </div>
  );
}
