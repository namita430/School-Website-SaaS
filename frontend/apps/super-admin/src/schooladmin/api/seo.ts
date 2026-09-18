import { apiFetch } from '../../api/client';

export interface SeoSettings {
  defaultMetaDescription: string | null;
  defaultOgImageUrl: string | null;
  faviconUrl: string | null;
  robotsIndexable: boolean;
}

export function getMySeoSettings() {
  return apiFetch<SeoSettings>('/api/v1/seo/me');
}

export function updateMySeoSettings(settings: SeoSettings) {
  return apiFetch<SeoSettings>('/api/v1/seo/me', { method: 'PUT', body: settings });
}

export function updatePageSeo(pageId: number, metaDescription: string | null, ogImageUrl: string | null) {
  return apiFetch(`/api/v1/pages/${pageId}/seo`, {
    method: 'PUT',
    body: { metaDescription, ogImageUrl },
  });
}
