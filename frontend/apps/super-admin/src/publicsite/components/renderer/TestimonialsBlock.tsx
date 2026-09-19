import { useQuery } from '@tanstack/react-query';
import { getContentList, type Testimonial } from '../../api/content';

export default function TestimonialsBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'What People Say';
  const limit = typeof props.limit === 'number' ? props.limit : 6;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'testimonials', limit],
    queryFn: () => getContentList<Testimonial>('/api/v1/public/testimonials', limit),
  });

  return (
    <section className="bg-primary/5 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold font-heading text-secondary mb-4 text-center">{title}</h2>
        {isLoading && <p className="text-sm text-gray-400 text-center">Loading…</p>}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data?.map((t) => (
            <div key={t.id} className="bg-white rounded-theme p-5 shadow-sm">
              <p className="text-sm text-gray-600 italic">"{t.quote}"</p>
              <div className="flex items-center gap-2 mt-3">
                {t.photoUrl && <img src={t.photoUrl} alt={t.authorName} className="w-8 h-8 rounded-full object-cover" />}
                <div>
                  <p className="text-sm font-medium text-secondary">{t.authorName}</p>
                  {t.authorRole && <p className="text-xs text-gray-400">{t.authorRole}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
