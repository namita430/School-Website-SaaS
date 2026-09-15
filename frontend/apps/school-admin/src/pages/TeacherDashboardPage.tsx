import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { listContent } from '../api/content';

export default function TeacherDashboardPage() {
  const fullName = useAuthStore((s) => s.fullName);

  const noticesQuery = useQuery({ queryKey: ['content', 'notices'], queryFn: () => listContent('/api/v1/notices') });
  const eventsQuery = useQuery({ queryKey: ['content', 'events'], queryFn: () => listContent('/api/v1/events') });

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold text-secondary mb-1">Welcome, {fullName ?? 'Teacher'}</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your school's notices and events from here.</p>

      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <Link
          to="/content/notices"
          className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 hover:border-primary/30 transition-colors"
        >
          <p className="text-sm text-gray-500">Notices</p>
          <p className="text-2xl font-semibold text-secondary mt-1">{noticesQuery.data?.length ?? '—'}</p>
          <p className="text-xs text-primary mt-2">Manage notices →</p>
        </Link>
        <Link
          to="/content/events"
          className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 hover:border-primary/30 transition-colors"
        >
          <p className="text-sm text-gray-500">Events</p>
          <p className="text-2xl font-semibold text-secondary mt-1">{eventsQuery.data?.length ?? '—'}</p>
          <p className="text-xs text-primary mt-2">Manage events →</p>
        </Link>
      </div>
    </div>
  );
}
