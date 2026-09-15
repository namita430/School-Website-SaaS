export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold text-secondary">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">This module is not built yet — coming in a later phase.</p>
    </div>
  );
}
