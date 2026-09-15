import { apiFetch } from './client';

export interface ThemeTokens {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  fontHeading: string;
  fontBody: string;
  radius: string;
}

export interface ThemeResponse {
  tokens: ThemeTokens;
}

export function getMyTheme() {
  return apiFetch<ThemeResponse>('/api/v1/themes/me');
}

export function updateMyTheme(tokens: ThemeTokens) {
  return apiFetch<ThemeResponse>('/api/v1/themes/me', {
    method: 'PUT',
    body: { tokens },
  });
}
