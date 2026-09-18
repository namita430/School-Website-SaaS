import { CalendarDays } from 'lucide-react';
import type { EventItem } from './types';

export default function EventsSection({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section id="events" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">What's Happening</p>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-secondary">Upcoming Events</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {events.map((event, i) => (
          <div
            key={i}
            className="rounded-theme border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-10 h-10 rounded-theme bg-primary/10 text-primary flex items-center justify-center mb-4">
              <CalendarDays className="w-5 h-5" />
            </div>
            <p className="font-heading font-semibold text-secondary mb-1">{event.title}</p>
            {event.date && <p className="text-xs text-gray-400 mb-2">{event.date}</p>}
            {event.description && <p className="text-sm text-gray-500">{event.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
