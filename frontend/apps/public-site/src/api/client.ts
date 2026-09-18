// Relative by default so requests go through this app's own dev-server
// proxy (see vite.config.ts) to the backend on the same origin the browser
// loaded from. Override via VITE_API_BASE_URL for a build served from
// somewhere without that proxy in front (e.g. a real reverse proxy in
// production, which is expected to set X-Forwarded-Host itself).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Sends the browser's own hostname as X-Forwarded-Host so a single shared
 * backend (this app's own API_BASE_URL, e.g. localhost:8080) can resolve
 * which school's site this is - see TenantResolutionFilter on the backend.
 * In production this app is expected to be served FROM the tenant's actual
 * domain (behind a reverse proxy that sets this same header), so this is
 * mostly a local-dev convenience; it's harmless in production since a real
 * proxy's header takes precedence at the network level.
 */
export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'X-Forwarded-Host': window.location.hostname },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}
