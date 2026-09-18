import { apiFetch } from '../../api/client';

export interface SchoolResponse {
  id: number;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  planId: number | null;
  createdAt: string;
  updatedAt: string;
}

export function getMySchool() {
  return apiFetch<SchoolResponse>('/api/v1/schools/me');
}

export function updateMySchool(name: string) {
  return apiFetch<SchoolResponse>('/api/v1/schools/me', {
    method: 'PUT',
    body: { name },
  });
}
