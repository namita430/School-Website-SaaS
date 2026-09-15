import { apiFetch } from './client';

/** A content item's shape varies per module (see contentConfig.ts) - only id/timestamps are guaranteed. */
export interface ContentItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export function listContent(apiPath: string) {
  return apiFetch<ContentItem[]>(apiPath);
}

export function createContent(apiPath: string, body: Record<string, unknown>) {
  return apiFetch<ContentItem>(apiPath, { method: 'POST', body });
}

export function updateContent(apiPath: string, id: number, body: Record<string, unknown>) {
  return apiFetch<ContentItem>(`${apiPath}/${id}`, { method: 'PUT', body });
}

export function deleteContent(apiPath: string, id: number) {
  return apiFetch<void>(`${apiPath}/${id}`, { method: 'DELETE' });
}
