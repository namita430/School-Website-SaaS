import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activateSchool, createSchool, listSchools, suspendSchool } from '../api/schools';
import { ApiError } from '../api/client';

export default function SchoolsPage() {
  const queryClient = useQueryClient();
  const schoolsQuery = useQuery({ queryKey: ['schools'], queryFn: listSchools });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['schools'] });

  const createMutation = useMutation({
    mutationFn: () => createSchool(name, slug),
    onSuccess: () => {
      setName('');
      setSlug('');
      setFormError(null);
      invalidate();
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not create school'),
  });

  const suspendMutation = useMutation({ mutationFn: suspendSchool, onSuccess: invalidate });
  const activateMutation = useMutation({ mutationFn: activateSchool, onSuccess: invalidate });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-6">Schools</h1>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">New school</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Greenfield Academy"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="greenfield"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !name || !slug}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
        <p className="mt-2 text-xs text-gray-400">
          Creates the school only - no owner user is created here (no invitation flow exists yet).
        </p>
      </div>

      {schoolsQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {schoolsQuery.data?.content.map((school) => (
          <div
            key={school.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-secondary">{school.name}</p>
              <p className="text-xs text-gray-400">{school.slug}.yoursaas.com</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full text-xs px-2 py-0.5 ${
                  school.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {school.status}
              </span>
              {school.status === 'ACTIVE' ? (
                <button
                  onClick={() => suspendMutation.mutate(school.id)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => activateMutation.mutate(school.id)}
                  className="text-xs text-gray-500 hover:text-green-600"
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
