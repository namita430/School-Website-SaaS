import { useQuery } from '@tanstack/react-query';
import { getContentList, type EventItem } from '../../api/content';

export default function EventsBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Upcoming Events';
  const limit = typeof props.limit === 'number' ? props.limit : 6;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'events', limit],
    queryFn: () => getContentList<EventItem>('/api/v1/public/events', limit),
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-theme p-6 text-center">
          No upcoming events.
        </p>
      )}
      <ul className="space-y-3">
        {data?.map((event) => (
          <li key={event.id} className="border border-gray-100 rounded-theme p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-secondary">{event.title}</p>
              {event.eventDate && <span className="text-xs text-gray-400 shrink-0">{event.eventDate}</span>}
            </div>
            {event.location && <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>}
            {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
