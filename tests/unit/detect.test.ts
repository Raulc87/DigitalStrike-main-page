import { describe, expect, it } from 'vitest';
import { detectLanguage, readSavedLanguage, saveLanguage } from '../../src/lib/i18n/detect';

const store = (value: string | null) => ({ getItem: () => value });
const throwing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('detectLanguage (US-002 AC1, AC5)', () => {
  it.each([
    [['es-CR'], 'es'],
    [['es'], 'es'],
    [['es-419'], 'es'],
    [['ES-mx'], 'es'],
    [['en-US'], 'en'],
    [['fr-FR'], 'en'],
    [[], 'en'],
    [['en-US', 'es'], 'en'],
    [['es-CR', 'en'], 'es'],
  ] as const)('%j without saved preference → %s', (languages, expected) => {
    expect(detectLanguage(languages, store(null))).toBe(expected);
  });

  it('handles undefined languages and missing storage', () => {
    expect(detectLanguage(undefined)).toBe('en');
    expect(detectLanguage(['es'], undefined)).toBe('es');
  });

  it('saved preference wins over the browser language', () => {
    expect(detectLanguage(['es-CR'], store('en'))).toBe('en');
    expect(detectLanguage(['en-US'], store('es'))).toBe('es');
  });

  it('ignores an invalid saved value', () => {
    expect(detectLanguage(['es-CR'], store('fr'))).toBe('es');
  });

  it('falls back to the browser language when storage throws', () => {
    expect(detectLanguage(['es-CR'], throwing)).toBe('es');
    expect(detectLanguage(['en-US'], throwing)).toBe('en');
    expect(readSavedLanguage(throwing)).toBeNull();
  });
});

describe('saveLanguage', () => {
  it('stores ds_lang and swallows storage errors', () => {
    const data: Record<string, string> = {};
    saveLanguage('en', { setItem: (k, v) => void (data[k] = v) });
    expect(data).toEqual({ ds_lang: 'en' });
    expect(() => saveLanguage('es', throwing)).not.toThrow();
  });
});
