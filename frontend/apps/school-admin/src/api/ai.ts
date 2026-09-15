import { apiFetch } from './client';

export interface GenerateSiteRequest {
  schoolType?: string;
  location?: string;
  style?: string;
  primaryColor?: string;
}

export interface GenerateSiteResult {
  createdPageSlugs: string[];
  skippedPageSlugs: string[];
  themeApplied: boolean;
}

export function generateSite(request: GenerateSiteRequest) {
  return apiFetch<GenerateSiteResult>('/api/v1/ai/generate-site', { method: 'POST', body: request });
}
