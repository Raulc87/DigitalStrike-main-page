import { describe, expect, it } from 'vitest';
import { es } from '../../src/i18n/es/content';
import { en } from '../../src/i18n/en/content';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';
import { fill, t } from '../../src/i18n';
import { withBase } from '../../src/lib/i18n/url';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('dictionaries', () => {
  it.each([
    ['content', es, en],
    ['form', esForm, enForm],
  ])('%s: ES and EN have identical keys', (_name, spanish, english) => {
    expect(Object.keys(english).sort()).toEqual(Object.keys(spanish).sort());
  });

  it('has no empty strings and the same {placeholders} in both languages', () => {
    for (const key of Object.keys(es) as (keyof typeof es)[]) {
      expect(es[key].trim(), `es ${key}`).not.toBe('');
      expect(en[key].trim(), `en ${key}`).not.toBe('');
      expect(placeholders(en[key]), key).toEqual(placeholders(es[key]));
    }
  });

  it('t() returns the localized string', () => {
    expect(t('es', 'nav.services')).toBe('Servicios');
    expect(t('en', 'nav.services')).toBe('Services');
  });

  it('fill() replaces {placeholders} from vars and keeps unknown ones', () => {
    expect(fill('Hola, {name} {other}', { name: 'Ana' })).toBe('Hola, Ana {other}');
    expect(fill('sin variables', { name: 'Ana' })).toBe('sin variables');
  });

  it('t() applies vars through fill()', () => {
    expect(t('es', 'nav.services', { name: 'Ana' })).toBe('Servicios');
  });
});

describe('withBase', () => {
  it('honours the base path', () => {
    expect(withBase('es/', '/DigitalStrike-main-page/')).toBe('/DigitalStrike-main-page/es/');
    expect(withBase('/brand/x.svg', '/DigitalStrike-main-page')).toBe(
      '/DigitalStrike-main-page/brand/x.svg',
    );
    expect(withBase('es/', '/')).toBe('/es/');
  });
});
