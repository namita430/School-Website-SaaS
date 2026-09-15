import { useQuery } from '@tanstack/react-query';
import { listContent, type ContentItem } from '../api/content';
import { useAuthStore } from '../store/authStore';

function Section({ title, items, isLoading, renderItem }: {
  title: string;
  items: ContentItem[] | undefined;
  isLoading: boolean;
  renderItem: (item: ContentItem) => React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-secondary mb-3">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      <div className="space-y-2">
        {items?.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3">
            {renderItem(item)}
          </div>
        ))}
        {items?.length === 0 && <p className="text-sm text-gray-400">Nothing here yet.</p>}
      </div>
    </div>
  );
}

/** Read-only by design - the STUDENT role only has WEBSITE_VIEW (V14), no create/edit UI is offered. */
export default function StudentDashboardPage() {
  const fullName = useAuthStore((s) => s.fullName);

  const notices = useQuery({ queryKey: ['content', 'notices'], queryFn: () => listContent('/api/v1/notices') });
  const events = useQuery({ queryKey: ['content', 'events'], queryFn: () => listContent('/api/v1/events') });
  const downloads = useQuery({ queryKey: ['content', 'downloads'], queryFn: () => listContent('/api/v1/downloads') });

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-secondary">Welcome, {fullName ?? 'Student'}</h1>
        <p className="text-sm text-gray-500">Notices, events, and downloads from your school.</p>
      </div>

      <Section
        title="Notices"
        items={notices.data}
        isLoading={notices.isLoading}
        renderItem={(n) => (
          <>
            <p className="text-sm font-medium text-secondary">
              {n.pinned ? <span className="text-accent mr-1">★</span> : null}
              {String(n.title)}
            </p>
            {n.body ? <p className="text-sm text-gray-600 mt-1">{String(n.body)}</p> : null}
          </>
        )}
      />

      <Section
        title="Events"
        items={events.data}
        isLoading={events.isLoading}
        renderItem={(e) => (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-secondary">{String(e.title)}</p>
            {e.eventDate ? <span className="text-xs text-gray-400">{String(e.eventDate)}</span> : null}
          </div>
        )}
      />

      <Section
        title="Downloads"
        items={downloads.data}
        isLoading={downloads.isLoading}
        renderItem={(d) => (
          <a href={String(d.fileUrl)} target="_blank" rel="noreferrer" className="text-sm text-primary font-medium">
            {String(d.title)}
          </a>
        )}
      />
    </div>
  );
}
