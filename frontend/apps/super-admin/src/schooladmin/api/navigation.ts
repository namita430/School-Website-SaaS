import { apiFetch } from '../../api/client';

export interface NavItem {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function listNavItems() {
  return apiFetch<NavItem[]>('/api/v1/navigation');
}

export function createNavItem(label: string, url: string, sortOrder: number) {
  return apiFetch<NavItem>('/api/v1/navigation', { method: 'POST', body: { label, url, sortOrder } });
}

export function updateNavItem(id: number, label: string, url: string, sortOrder: number) {
  return apiFetch<NavItem>(`/api/v1/navigation/${id}`, { method: 'PUT', body: { label, url, sortOrder } });
}

export function deleteNavItem(id: number) {
  return apiFetch<void>(`/api/v1/navigation/${id}`, { method: 'DELETE' });
}
