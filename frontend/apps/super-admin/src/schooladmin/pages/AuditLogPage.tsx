import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../api/auditLogs';

const ACTION_LABELS: Record<string, string> = {
  SCHOOL_SUSPENDED: 'School suspended',
  SCHOOL_ACTIVATED: 'School activated',
  DOMAIN_ADDED: 'Domain added',
  DOMAIN_VERIFY_ATTEMPTED: 'Domain verification attempted',
  DOMAIN_SET_PRIMARY: 'Primary domain changed',
  DOMAIN_REMOVED: 'Domain removed',
  THEME_UPDATED: 'Theme updated',
  PAGE_PUBLISHED: 'Page published',
  PAGE_UNPUBLISHED: 'Page unpublished',
  SUBSCRIPTION_CHANGED: 'Subscription changed',
  SUBSCRIPTION_CANCELED: 'Subscription canceled',
};

export default function AuditLogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['audit-logs'], queryFn: getAuditLogs });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">Audit Log</h1>
      <p className="text-sm text-gray-500 mb-6">A record of sensitive actions taken on your school's account.</p>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {data?.content.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">
                {ACTION_LABELS[entry.action] ?? entry.action}
              </span>
              <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {Object.entries(entry.metadata)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {data?.content.length === 0 && <p className="text-sm text-gray-400">No activity recorded yet.</p>}
    </div>
  );
}
