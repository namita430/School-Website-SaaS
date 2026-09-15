import { apiFetch, API_BASE_URL, ApiError } from './client';
import { useAuthStore } from '../store/authStore';

export interface MediaAsset {
  id: number;
  fileName: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export function listMedia() {
  return apiFetch<MediaAsset[]>('/api/v1/media');
}

export function deleteMedia(id: number) {
  return apiFetch<void>(`/api/v1/media/${id}`, { method: 'DELETE' });
}

/**
 * Not routed through apiFetch: uploads are multipart/form-data, and the
 * browser must set its own Content-Type (with the multipart boundary) -
 * apiFetch always forces application/json. Still attaches the same Bearer
 * token and surfaces failures as the same ApiError type.
 */
export async function uploadMedia(file: File): Promise<MediaAsset> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/media`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Upload failed');
  }
  return res.json() as Promise<MediaAsset>;
}
