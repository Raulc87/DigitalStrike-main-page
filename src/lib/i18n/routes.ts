import type { Locale } from './url';

/** Pages that exist in both languages, with their path (without base) per language. */
export const routes = {
  home: { es: 'es/', en: 'en/' },
  privacy: { es: 'es/privacidad/', en: 'en/privacy/' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteName = keyof typeof routes;

export function otherLocale(lang: Locale): Locale {
  return lang === 'es' ? 'en' : 'es';
}
