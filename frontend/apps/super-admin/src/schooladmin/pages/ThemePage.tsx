import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyTheme, updateMyTheme, type ThemeTokens } from '../api/theme';

const COLOR_FIELDS: { key: keyof ThemeTokens; label: string }[] = [
  { key: 'colorPrimary', label: 'Primary' },
  { key: 'colorSecondary', label: 'Secondary' },
  { key: 'colorAccent', label: 'Accent' },
  { key: 'colorBackground', label: 'Background' },
  { key: 'colorText', label: 'Text' },
];

export default function ThemePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['theme', 'me'], queryFn: getMyTheme });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ThemeTokens>();

  useEffect(() => {
    if (data) reset(data.tokens);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (tokens: ThemeTokens) => updateMyTheme(tokens),
    onSuccess: (updated) => {
      queryClient.setQueryData(['theme', 'me'], updated);
      reset(updated.tokens);
    },
  });

  if (isLoading || !data) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">Theme</h1>
      <p className="text-sm text-gray-500 mb-6">
        These design tokens apply across your entire public website — colors, fonts, and corner
        roundness are never set per-component.
      </p>

      <form
        onSubmit={handleSubmit((tokens) => mutation.mutate(tokens))}
        className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 space-y-6"
      >
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Colors</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-9 w-9 rounded border border-gray-300" {...register(key)} />
                  <input
                    type="text"
                    className="flex-1 min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-mono"
                    {...register(key)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Typography</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading font</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                {...register('fontHeading')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Body font</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                {...register('fontBody')}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Shape</p>
          <div className="max-w-xs">
            <label className="block text-xs text-gray-500 mb-1">Corner radius (CSS value, e.g. 0.5rem)</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              {...register('radius')}
            />
          </div>
        </div>

        {mutation.isSuccess && !isDirty && <p className="text-sm text-green-600">Saved.</p>}
        {mutation.isError && <p className="text-sm text-red-600">Could not save theme.</p>}

        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save theme'}
        </button>
      </form>
    </div>
  );
}
