import { useQuery } from '@tanstack/react-query';
import { getContentList, type Facility } from '../../api/content';

export default function FacilitiesBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Facilities';
  const limit = typeof props.limit === 'number' ? props.limit : 12;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'facilities', limit],
    queryFn: () => getContentList<Facility>('/api/v1/public/facilities', limit),
  });

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data?.map((f) => (
          <div key={f.id} className="border border-gray-100 rounded-theme overflow-hidden">
            {f.imageUrl && <img src={f.imageUrl} alt={f.title} className="w-full aspect-video object-cover" />}
            <div className="p-4">
              <p className="text-sm font-medium text-secondary">{f.title}</p>
              {f.description && <p className="text-sm text-gray-600 mt-1">{f.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
