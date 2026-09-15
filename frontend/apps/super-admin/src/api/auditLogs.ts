import { apiFetch } from './client';

export interface AuditLogEntry {
  id: number;
  actorUserId: number | null;
  schoolId: number | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

export function getAuditLogs() {
  return apiFetch<PageResponse<AuditLogEntry>>('/api/v1/superadmin/audit-logs?size=100&sort=createdAt,desc');
}
