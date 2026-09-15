import { apiFetch } from './client';
import type { AuthResponse } from '../types/auth';

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: { email, password } });
}

export function logout() {
  return apiFetch<void>('/api/v1/auth/logout', { method: 'POST' });
}
