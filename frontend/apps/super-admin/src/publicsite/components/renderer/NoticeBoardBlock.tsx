import { useQuery } from '@tanstack/react-query';
import { getContentList, type Notice } from '../../api/content';

/** Phase 8: now backed by real data (was a static stub through Phase 7). */
export default function NoticeBoardBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Notices';
  const limit = typeof props.limit === 'number' ? props.limit : 6;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'notices', limit],
    queryFn: () => getContentList<Notice>('/api/v1/public/notices', limit),
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>

      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      {!isLoading && (!data || data.length === 0) && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-theme p-6 text-center">
          No notices yet.
        </p>
      )}

      <ul className="space-y-3">
        {data?.map((notice) => (
          <li key={notice.id} className="border border-gray-100 rounded-theme p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-secondary">
                {notice.pinned && <span className="text-accent mr-1">★</span>}
                {notice.title}
              </p>
              {notice.noticeDate && <span className="text-xs text-gray-400 shrink-0">{notice.noticeDate}</span>}
            </div>
            {notice.body && <p className="text-sm text-gray-600 mt-1">{notice.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
