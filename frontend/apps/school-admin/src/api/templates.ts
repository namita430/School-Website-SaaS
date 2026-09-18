import { apiFetch } from './client';

/** IDs are granted by Super Admin through the school’s assigned plan. */
export function listAvailableTemplates() {
  return apiFetch<string[]>('/api/v1/school/templates');
}
