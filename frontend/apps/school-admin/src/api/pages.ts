import { apiFetch } from './client';
import type { PageContent, PageSummary } from '../types/builder';

export function listPages() {
  return apiFetch<PageSummary[]>('/api/v1/pages');
}

export function getPage(id: number) {
  return apiFetch<PageSummary>(`/api/v1/pages/${id}`);
}

export function createPage(title: string, slug: string) {
  return apiFetch<PageSummary>('/api/v1/pages', { method: 'POST', body: { title, slug } });
}

export function updatePageContent(id: number, content: PageContent) {
  return apiFetch<PageSummary>(`/api/v1/pages/${id}/content`, { method: 'PUT', body: { content } });
}

export function publishPage(id: number) {
  return apiFetch<PageSummary>(`/api/v1/pages/${id}/publish`, { method: 'POST' });
}

export function unpublishPage(id: number) {
  return apiFetch<PageSummary>(`/api/v1/pages/${id}/unpublish`, { method: 'POST' });
}

export function setHomePage(id: number) {
  return apiFetch<PageSummary>(`/api/v1/pages/${id}/set-home`, { method: 'POST' });
}

export function deletePage(id: number) {
  return apiFetch<void>(`/api/v1/pages/${id}`, { method: 'DELETE' });
}
