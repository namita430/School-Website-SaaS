import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../api/auditLogs';

export default function AuditLogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['audit-logs'], queryFn: getAuditLogs });

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">Platform Audit Log</h1>
      <p className="text-sm text-gray-500 mb-6">Every sensitive action across every school, unfiltered.</p>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {data?.content.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">{entry.action}</span>
              <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              actor user #{entry.actorUserId ?? '—'} · school #{entry.schoolId ?? '—'}
              {entry.entityType && ` · ${entry.entityType} #${entry.entityId}`}
            </p>
            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
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
