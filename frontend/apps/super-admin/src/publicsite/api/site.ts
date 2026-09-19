import { apiFetch } from './client';
import type { PublicPage, PublicSite } from '../types/content';

export function getSite() {
  return apiFetch<PublicSite>('/api/v1/public/site');
}

export function getHomePage() {
  return apiFetch<PublicPage>('/api/v1/public/pages/home');
}

export function getPageBySlug(slug: string) {
  return apiFetch<PublicPage>(`/api/v1/public/pages/${slug}`);
}
