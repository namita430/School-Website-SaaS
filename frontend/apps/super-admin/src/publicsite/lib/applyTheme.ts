import type { ThemeTokens } from '../types/content';


const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  colorPrimary: '--color-primary',
  colorSecondary: '--color-secondary',
  colorAccent: '--color-accent',
  colorBackground: '--color-background',
  colorText: '--color-text',
  fontHeading: '--font-heading',
  fontBody: '--font-body',
  radius: '--radius',
};

export function applyTheme(tokens: ThemeTokens | undefined) {
  if (!tokens) return;
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(TOKEN_TO_CSS_VAR)) {
    const value = tokens[key];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
}
