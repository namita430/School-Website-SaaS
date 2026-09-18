import { apiFetch } from './client';

export interface PublicNavItem {
  label: string;
  url: string;
}

export function getNavigation() {
  return apiFetch<PublicNavItem[]>('/api/v1/public/navigation');
}
