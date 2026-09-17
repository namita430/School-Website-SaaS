import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMySeoSettings, updateMySeoSettings, type SeoSettings } from '../api/seo';
import ImageUploadField from '../components/ImageUploadField';

/** RHF's uncontrolled inputs don't like a `null` string value - substitute '' for the form. */
function withDefaults(settings: SeoSettings): SeoSettings {
  return {
    ...settings,
    defaultMetaDescription: settings.defaultMetaDescription ?? '',
    defaultOgImageUrl: settings.defaultOgImageUrl ?? '',
    faviconUrl: settings.faviconUrl ?? '',
  };
}

export default function SeoPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['seo', 'me'], queryFn: getMySeoSettings });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<SeoSettings>();

  useEffect(() => {
    if (data) reset(withDefaults(data));
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (settings: SeoSettings) => updateMySeoSettings(settings),
    onSuccess: (updated) => {
      queryClient.setQueryData(['seo', 'me'], updated);
      reset(withDefaults(updated));
    },
  });

  if (isLoading || !data) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">SEO</h1>
      <p className="text-sm text-gray-500 mb-6">
        Site-wide defaults, used whenever a page doesn't set its own. Per-page overrides live in
        each page's builder.
      </p>

      <form
        onSubmit={handleSubmit((settings) => mutation.mutate(settings))}
        className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default meta description</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            {...register('defaultMetaDescription')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Open Graph image</label>
          <ImageUploadField
            value={watch('defaultOgImageUrl') ?? ''}
            onChange={(url) => setValue('defaultOgImageUrl', url, { shouldDirty: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
          <ImageUploadField
            value={watch('faviconUrl') ?? ''}
            onChange={(url) => setValue('faviconUrl', url, { shouldDirty: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('robotsIndexable')} />
          Allow search engines to index this site
        </label>

        {mutation.isSuccess && !isDirty && <p className="text-sm text-green-600">Saved.</p>}
        {mutation.isError && <p className="text-sm text-red-600">Could not save.</p>}

        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
