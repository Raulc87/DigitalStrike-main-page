import { es } from './es/content';
import type { ContentKey } from './es/content';
import { en } from './en/content';
import type { Locale } from '../lib/i18n/url';

export type { ContentKey } from './es/content';
export type { Locale } from '../lib/i18n/url';

const dictionaries: Record<Locale, Record<ContentKey, string>> = { es, en };

/** Fill `{name}` placeholders from `vars`; unknown placeholders are left as they are. */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
}

/** Typed lookup: an unknown key is a compile error; `{name}` placeholders are filled from `vars`. */
export function t(lang: Locale, key: ContentKey, vars?: Record<string, string>): string {
  const text = dictionaries[lang][key];
  return vars ? fill(text, vars) : text;
}
