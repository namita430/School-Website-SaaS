import type { Highlight } from './types';

export default function HighlightsSection({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <section className="bg-primary/5 py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="bg-white rounded-theme border border-gray-100 shadow-sm py-8 px-4 text-center hover:shadow-md transition-shadow"
          >
            <p className="font-heading font-bold text-3xl sm:text-4xl text-primary mb-1">{h.value}</p>
            <p className="text-sm text-gray-500">{h.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
