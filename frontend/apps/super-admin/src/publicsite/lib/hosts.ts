/**
 * The platform's own host - "localhost" in dev, the apex domain in
 * production (yoursaas.com). Anything else is a school's own address
 * (demo.localhost / demo.yoursaas.com / the school's custom domain) and
 * shows that school's public website instead of the platform.
 */
const PLATFORM_HOST = import.meta.env.VITE_PUBLIC_BASE_DOMAIN ?? 'localhost';

export function isPlatformHost(): boolean {
  const hostname = window.location.hostname;
  return hostname === PLATFORM_HOST || hostname === '127.0.0.1';
}

/** URL on the platform host (same port/protocol), e.g. platformUrl('/login') from demo.localhost:5173 -> http://localhost:5173/login. */
export function platformUrl(path: string): string {
  const { protocol, port } = window.location;
  return `${protocol}//${PLATFORM_HOST}${port ? `:${port}` : ''}${path}`;
}
