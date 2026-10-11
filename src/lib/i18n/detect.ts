import { LOCALES } from './url';
import type { Locale } from './url';

/** localStorage key holding the visitor's language choice (ADR-003). */
export const LANG_STORAGE_KEY = 'ds_lang';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Saved preference, or null when absent, invalid or storage is unavailable (private mode). */
export function readSavedLanguage(storage?: ReadableStorage): Locale | null {
  try {
    const value = storage?.getItem(LANG_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/** Persist the choice; storage failures are ignored. */
export function saveLanguage(lang: Locale, storage?: WritableStorage): void {
  try {
    storage?.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // ignored: the toggle still navigates
  }
}

/**
 * Language for `/` (US-002 AC1): the saved `ds_lang` wins; otherwise Spanish when the first
 * preferred browser language starts with `es`, otherwise English.
 */
export function detectLanguage(
  languages: readonly string[] | undefined,
  storage?: ReadableStorage,
): Locale {
  const saved = readSavedLanguage(storage);
  if (saved) return saved;
  const first = languages?.[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('es') ? 'es' : 'en';
}
