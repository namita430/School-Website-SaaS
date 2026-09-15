import { apiFetch } from './client';

export interface School {
  id: number;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  planId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export function listSchools() {
  return apiFetch<PageResponse<School>>('/api/v1/superadmin/schools?size=50');
}

export function createSchool(name: string, slug: string) {
  return apiFetch<School>('/api/v1/superadmin/schools', { method: 'POST', body: { name, slug } });
}

export function suspendSchool(id: number) {
  return apiFetch<School>(`/api/v1/superadmin/schools/${id}/suspend`, { method: 'POST' });
}

export function activateSchool(id: number) {
  return apiFetch<School>(`/api/v1/superadmin/schools/${id}/activate`, { method: 'POST' });
}
