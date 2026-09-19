import { useQuery } from '@tanstack/react-query';
import { getContentList, type NewsItem } from '../../api/content';

export default function NewsBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Latest News';
  const limit = typeof props.limit === 'number' ? props.limit : 6;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'news', limit],
    queryFn: () => getContentList<NewsItem>('/api/v1/public/news', limit),
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-theme p-6 text-center">
          No news yet.
        </p>
      )}
      <ul className="space-y-3">
        {data?.map((item) => (
          <li key={item.id} className="border border-gray-100 rounded-theme p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-secondary">{item.title}</p>
              {item.publishedDate && <span className="text-xs text-gray-400 shrink-0">{item.publishedDate}</span>}
            </div>
            {item.body && <p className="text-sm text-gray-600 mt-1">{item.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
