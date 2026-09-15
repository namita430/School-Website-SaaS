import { useQuery } from '@tanstack/react-query';
import { listSchools } from '../api/schools';
import { listPlans } from '../api/plans';

export default function DashboardPage() {
  const schoolsQuery = useQuery({ queryKey: ['schools'], queryFn: listSchools });
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: listPlans });

  const activeSchools = schoolsQuery.data?.content.filter((s) => s.status === 'ACTIVE').length;
  const suspendedSchools = schoolsQuery.data?.content.filter((s) => s.status === 'SUSPENDED').length;

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold text-secondary mb-6">Platform Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
          <p className="text-sm text-gray-500">Total schools</p>
          <p className="text-2xl font-semibold text-secondary mt-1">{schoolsQuery.data?.totalElements ?? '—'}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{activeSchools ?? '—'}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
          <p className="text-sm text-gray-500">Suspended</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{suspendedSchools ?? '—'}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
          <p className="text-sm text-gray-500">Plans</p>
          <p className="text-2xl font-semibold text-secondary mt-1">{plansQuery.data?.length ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
