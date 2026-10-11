/** Locales served by the site (ADR-003). Spanish is the source language. */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Join a site-relative path to the configured base path (PUBLIC_BASE_PATH), so every internal link
 * and asset works on GitHub Pages (`/DigitalStrike-main-page/`) and on the root domain (`/`).
 */
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const root = base.replace(/\/+$/, '');
  const rest = path.replace(/^\/+/, '');
  return `${root}/${rest}`;
}
