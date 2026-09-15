import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMySchool, updateMySchool } from '../api/school';

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['schools', 'me'], queryFn: getMySchool });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (data) reset({ name: data.name });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (form: SettingsForm) => updateMySchool(form.name),
    onSuccess: (updated) => {
      queryClient.setQueryData(['schools', 'me'], updated);
      reset({ name: updated.name });
    },
  });

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-lg font-semibold text-secondary mb-6">Settings</h1>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      {data && (
        <form
          onSubmit={handleSubmit((form) => mutation.mutate(form))}
          className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School name</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <input
              disabled
              value={`${data.slug}.yoursaas.com`}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-400">Subdomain cannot be changed here.</p>
          </div>

          {mutation.isSuccess && !isDirty && (
            <p className="text-sm text-green-600">Saved.</p>
          )}
          {mutation.isError && <p className="text-sm text-red-600">Could not save changes.</p>}

          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </div>
  );
}
