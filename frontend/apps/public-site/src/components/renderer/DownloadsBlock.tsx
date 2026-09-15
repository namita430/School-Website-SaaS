import { useQuery } from '@tanstack/react-query';
import { getContentList, type DownloadItem } from '../../api/content';

export default function DownloadsBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Downloads';
  const limit = typeof props.limit === 'number' ? props.limit : 50;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'downloads', limit],
    queryFn: () => getContentList<DownloadItem>('/api/v1/public/downloads', limit),
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-theme overflow-hidden">
        {data?.map((d) => (
          <li key={d.id}>
            <a
              href={d.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
            >
              <span className="text-secondary">{d.title}</span>
              {d.category && <span className="text-xs text-gray-400">{d.category}</span>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
