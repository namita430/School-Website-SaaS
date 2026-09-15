import { useQuery } from '@tanstack/react-query';
import { getMySchool } from '../api/school';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schools', 'me'],
    queryFn: getMySchool,
  });

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold text-secondary mb-6">Dashboard</h1>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {isError && <p className="text-sm text-red-600">Could not load your school.</p>}

      {data && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 max-w-md">
          <p className="text-sm text-gray-400 mb-1">School</p>
          <p className="text-xl font-semibold text-secondary">{data.name}</p>
          <p className="text-sm text-gray-500 mt-1">{data.slug}.yoursaas.com</p>
          <span
            className={`inline-block mt-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              data.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {data.status}
          </span>
        </div>
      )}
    </div>
  );
}
