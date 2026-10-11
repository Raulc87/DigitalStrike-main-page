import { describe, expect, it } from 'vitest';
import {
  buildPayload,
  firstName,
  validateCompany,
  validateConsent,
  validateElapsedMs,
  validateEmail,
  validateForm,
  validateMessage,
  validateName,
  validateOption,
  validatePhone,
  validateSubmissionId,
} from '../../src/lib/lead/validation';
import { BUDGET_RANGES, LANGUAGES, PROJECT_TYPES, TIMELINES } from '../../src/lib/lead/types';
import type { LeadFormValues } from '../../src/lib/lead/types';

// Contract v1.0 §3 rules: a valid and an invalid case per rule, with the server's normalization.

const valid: LeadFormValues = {
  name: '  Ana   María  Pérez ',
  email: ' Ana.Perez@Example.COM ',
  phone: '+506 8888-0000',
  company: '  Panadería La Esquina ',
  project_type: 'web_app',
  budget_range: 'from_1000_to_3000',
  timeline: 'within_3_months',
  message: '  Quiero un catálogo en línea con pedidos por WhatsApp.  ',
  consent: true,
};

const ctx = {
  language: 'es',
  privacyNoticeVersion: '2026-10-14-v1',
  submissionId: '8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21',
  website: '',
  elapsedMs: 48250,
};

describe('name', () => {
  it("trims, collapses whitespace and accepts letters, spaces and ' ’ - .", () => {
    expect(validateName('  Ana   María  Pérez ')).toEqual({ ok: true, value: 'Ana María Pérez' });
    expect(validateName("O'Neil D’Arcy-Smith Jr.")).toEqual({
      ok: true,
      value: "O'Neil D’Arcy-Smith Jr.",
    });
    expect(validateName('Zoë Ñúñez')).toMatchObject({ ok: true });
  });
  it('required', () => {
    expect(validateName('   ')).toEqual({ ok: false, error: 'required' });
  });
  it('2–100 characters after normalization', () => {
    expect(validateName('Al')).toMatchObject({ ok: true });
    expect(validateName(' A ')).toEqual({ ok: false, error: 'too_short' });
    expect(validateName('a'.repeat(100))).toMatchObject({ ok: true });
    expect(validateName('a'.repeat(101))).toEqual({ ok: false, error: 'too_long' });
  });
  it('rejects other characters', () => {
    expect(validateName('Ana 2')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateName('Ana <b>')).toEqual({ ok: false, error: 'invalid_format' });
  });
});

describe('email', () => {
  it('trims and lowercases', () => {
    expect(validateEmail(' Ana.Perez@Example.COM ')).toEqual({
      ok: true,
      value: 'ana.perez@example.com',
    });
  });
  it('required', () => {
    expect(validateEmail('  ')).toEqual({ ok: false, error: 'required' });
  });
  it('at most 254 characters', () => {
    const at254 = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`;
    expect(at254.length).toBe(254);
    expect(validateEmail(at254)).toMatchObject({ ok: true });
    expect(validateEmail(`x${at254}`)).toEqual({ ok: false, error: 'too_long' });
  });
  it('matches the contract pattern', () => {
    expect(validateEmail('a+tag@sub.example.co')).toMatchObject({ ok: true });
    expect(validateEmail('ana@example')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateEmail('ana@-example.com')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateEmail('ana perez@example.com')).toEqual({ ok: false, error: 'invalid_format' });
  });
  it('local part does not start/end with "." or contain ".."', () => {
    expect(validateEmail('a.b@example.com')).toMatchObject({ ok: true });
    expect(validateEmail('.ana@example.com')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateEmail('ana.@example.com')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateEmail('an..a@example.com')).toEqual({ ok: false, error: 'invalid_format' });
  });
});

describe('phone (optional)', () => {
  it('empty → ""', () => {
    expect(validatePhone('')).toEqual({ ok: true, value: '' });
    expect(validatePhone('   ')).toEqual({ ok: true, value: '' });
  });
  it('strips spaces, -, (, ), . and checks ^\\+?[0-9]{7,15}$', () => {
    expect(validatePhone('+506 (8888) 00.00')).toEqual({ ok: true, value: '+50688880000' });
    expect(validatePhone('8888-000')).toEqual({ ok: true, value: '8888000' });
    expect(validatePhone('123456')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validatePhone('+1234567890123456')).toEqual({ ok: false, error: 'invalid_format' });
    expect(validatePhone('+506 8888 abcd')).toEqual({ ok: false, error: 'invalid_format' });
  });
});

describe('company (optional)', () => {
  it('trims; empty → ""', () => {
    expect(validateCompany('  Panadería ')).toEqual({ ok: true, value: 'Panadería' });
    expect(validateCompany('')).toEqual({ ok: true, value: '' });
  });
  it('at most 100 characters', () => {
    expect(validateCompany('c'.repeat(100))).toMatchObject({ ok: true });
    expect(validateCompany('c'.repeat(101))).toEqual({ ok: false, error: 'too_long' });
  });
});

describe.each([
  ['project_type', PROJECT_TYPES],
  ['budget_range', BUDGET_RANGES],
  ['timeline', TIMELINES],
  ['language', LANGUAGES],
] as const)('%s enum', (_name, list) => {
  it('accepts every code', () => {
    for (const code of list) expect(validateOption(list, code)).toEqual({ ok: true, value: code });
  });
  it('required and invalid_option', () => {
    expect(validateOption(list, '')).toEqual({ ok: false, error: 'required' });
    expect(validateOption(list, 'Website')).toEqual({ ok: false, error: 'invalid_option' });
  });
});

describe('enumerations match contract §4', () => {
  it('codes', () => {
    expect(PROJECT_TYPES).toEqual([
      'website',
      'web_app',
      'business_system',
      'custom_solution',
      'not_sure',
    ]);
    expect(BUDGET_RANGES).toEqual([
      'under_1000',
      'from_1000_to_3000',
      'from_3000_to_10000',
      'from_10000_to_25000',
      'over_25000',
      'not_sure',
    ]);
    expect(TIMELINES).toEqual(['asap', 'within_1_month', 'within_3_months', 'flexible']);
  });
});

describe('message', () => {
  it('trims, keeps line breaks, 20–2000 characters', () => {
    expect(validateMessage('  línea uno\nlínea dos, más texto  ')).toEqual({
      ok: true,
      value: 'línea uno\nlínea dos, más texto',
    });
    expect(validateMessage('m'.repeat(20))).toMatchObject({ ok: true });
    expect(validateMessage('m'.repeat(2000))).toMatchObject({ ok: true });
  });
  it('required, too_short, too_long', () => {
    expect(validateMessage('  ')).toEqual({ ok: false, error: 'required' });
    expect(validateMessage(` ${'m'.repeat(19)} `)).toEqual({ ok: false, error: 'too_short' });
    expect(validateMessage('m'.repeat(2001))).toEqual({ ok: false, error: 'too_long' });
  });
});

describe('consent', () => {
  it('must be true', () => {
    expect(validateConsent(true)).toEqual({ ok: true, value: true });
    expect(validateConsent(false)).toEqual({ ok: false, error: 'must_be_true' });
  });
});

describe('submission_id', () => {
  it('lowercase UUID v4', () => {
    expect(validateSubmissionId('8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21')).toMatchObject({
      ok: true,
    });
    expect(validateSubmissionId(crypto.randomUUID())).toMatchObject({ ok: true });
    expect(validateSubmissionId('')).toEqual({ ok: false, error: 'required' });
    expect(validateSubmissionId('8F14E45F-CEEA-4E7A-9B1C-3F0A2D5C7E21')).toEqual({
      ok: false,
      error: 'invalid_format',
    });
    expect(validateSubmissionId('8f14e45f-ceea-1e7a-9b1c-3f0a2d5c7e21')).toEqual({
      ok: false,
      error: 'invalid_format',
    });
  });
});

describe('elapsed_ms', () => {
  it('integer 0 – 86 400 000', () => {
    expect(validateElapsedMs(0)).toMatchObject({ ok: true });
    expect(validateElapsedMs(86_400_000)).toMatchObject({ ok: true });
    expect(validateElapsedMs(-1)).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateElapsedMs(86_400_001)).toEqual({ ok: false, error: 'invalid_format' });
    expect(validateElapsedMs(12.5)).toEqual({ ok: false, error: 'invalid_type' });
  });
});

describe('validateForm', () => {
  it('no errors for a valid form', () => {
    expect(validateForm(valid)).toEqual({});
  });
  it('every field error at once', () => {
    expect(
      validateForm({
        name: '',
        email: 'x',
        phone: '12',
        company: 'c'.repeat(101),
        project_type: '',
        budget_range: 'nope',
        timeline: '',
        message: 'short',
        consent: false,
      }),
    ).toEqual({
      name: 'required',
      email: 'invalid_format',
      phone: 'invalid_format',
      company: 'too_long',
      project_type: 'required',
      budget_range: 'invalid_option',
      timeline: 'required',
      message: 'too_short',
      consent: 'must_be_true',
    });
  });
});

describe('buildPayload', () => {
  it('produces the normalized §3 body', () => {
    expect(buildPayload(valid, ctx)).toEqual({
      ok: true,
      payload: {
        name: 'Ana María Pérez',
        email: 'ana.perez@example.com',
        phone: '+50688880000',
        company: 'Panadería La Esquina',
        project_type: 'web_app',
        budget_range: 'from_1000_to_3000',
        timeline: 'within_3_months',
        message: 'Quiero un catálogo en línea con pedidos por WhatsApp.',
        language: 'es',
        consent: true,
        privacy_notice_version: '2026-10-14-v1',
        submission_id: '8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21',
        website: '',
        elapsed_ms: 48250,
      },
    });
  });
  it('passes the honeypot value through as `website`', () => {
    const result = buildPayload(valid, { ...ctx, website: 'https://spam.example' });
    expect(result.ok && result.payload.website).toBe('https://spam.example');
  });
  it('reports context errors (language, version, id, elapsed)', () => {
    expect(
      buildPayload(valid, {
        language: 'fr',
        privacyNoticeVersion: ' ',
        submissionId: 'x',
        website: '',
        elapsedMs: -5,
      }),
    ).toEqual({
      ok: false,
      fieldErrors: {
        language: 'invalid_option',
        privacy_notice_version: 'required',
        submission_id: 'invalid_format',
        elapsed_ms: 'invalid_format',
      },
    });
  });
});

describe('firstName', () => {
  it('is the first word of the normalized name', () => {
    expect(firstName('  Ana   María Pérez')).toBe('Ana');
    expect(firstName('Zoë')).toBe('Zoë');
  });
});
