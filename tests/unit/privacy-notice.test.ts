import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';
import { fill } from '../../src/i18n';

// US-018 AC1: the notice is CONTENT §13 verbatim, in ES and EN.

const content = readFileSync(new URL('../../docs/ux/CONTENT.md', import.meta.url), 'utf8');
const section = content.slice(content.indexOf('## 13. Privacy notice'), content.indexOf('## 14.'));

function block(lang: 'ES' | 'EN'): string[] {
  const start = section.indexOf(`### ${lang}`);
  const end = lang === 'ES' ? section.indexOf('### EN') : section.length;
  return section
    .slice(start, end)
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean);
}

const sections = ['controller', 'data', 'use', 'storage', 'retention', 'rights', 'consent'];

describe.each([
  ['ES', esForm],
  ['EN', enForm],
] as const)('privacy notice %s', (lang, dict) => {
  const d = dict as Record<string, string>;
  const lines = block(lang);

  it('title and version line', () => {
    expect(lines[0]).toBe(`**${d['privacy.title']}**`);
    expect(lines[1]).toBe(fill(d['privacy.version']!, { version: '2026-10-14-v1' }));
  });

  it('every paragraph, in order', () => {
    expect(lines.slice(2)).toEqual(
      sections.map((s) => `**${d[`privacy.${s}.title`]}** ${d[`privacy.${s}.body`]}`),
    );
  });
});
