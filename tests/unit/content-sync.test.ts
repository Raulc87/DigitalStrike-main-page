import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { es } from '../../src/i18n/es/content';
import { en } from '../../src/i18n/en/content';

// AC-UI1: every string matches docs/ux/CONTENT.md verbatim in ES and EN.
const doc = readFileSync(new URL('../../docs/ux/CONTENT.md', import.meta.url), 'utf8');

const rows = new Map<string, [string, string]>();
for (const m of doc.matchAll(/^\| `([^`]+)` \| (.*?) \| (.*?) \|\s*$/gm)) {
  rows.set(m[1]!, [m[2]!.trim(), m[3]!.trim()]);
}

describe('dictionaries match CONTENT.md', () => {
  it('finds the key/ES/EN table rows', () => {
    expect(rows.size).toBeGreaterThan(50);
  });

  it.each(Object.keys(es).filter((key) => rows.has(key)))('%s (table row)', (key) => {
    const [esText, enText] = rows.get(key)!;
    expect(es[key as keyof typeof es]).toBe(esText);
    expect(en[key as keyof typeof en]).toBe(enText);
  });

  // Strings that live in multi-column tables (cards, projects, chips, menu labels): each must
  // appear verbatim somewhere in the document.
  it.each(Object.keys(es).filter((key) => !rows.has(key)))('%s (verbatim in document)', (key) => {
    expect(doc).toContain(es[key as keyof typeof es]);
    expect(doc).toContain(en[key as keyof typeof en]);
  });
});
