import { describe, expect, it } from 'vitest';
import { loadAppsScript } from './helpers/loadAppsScript';
import { PRIVACY_VERSION, validBody } from './helpers/fixtures';

const gs = loadAppsScript();
const accepted = [PRIVACY_VERSION];

function errorsFor(overrides: Record<string, unknown>) {
  const result = gs.validateLead(validBody(overrides), accepted);
  return result.ok ? {} : { ...result.fieldErrors };
}

function valueOf(field: string, overrides: Record<string, unknown>) {
  const result = gs.validateLead(validBody(overrides), accepted);
  expect(result.ok).toBe(true);
  return result.lead[field];
}

describe('parseRequestBody (contract §5 steps 1–2)', () => {
  it('accepts a JSON object', () => {
    const r = gs.parseRequestBody(JSON.stringify(validBody()));
    expect(r.ok).toBe(true);
    expect(r.body.name).toBe('Ana María Pérez');
  });

  it('rejects a body over 10 KB as payload_too_large, counting UTF-8 bytes', () => {
    expect(gs.parseRequestBody('x'.repeat(10240)).errorCode).toBe('invalid_json');
    expect(gs.parseRequestBody('x'.repeat(10241)).errorCode).toBe('payload_too_large');
    // 5121 two-byte characters = 10242 bytes although only 5121 UTF-16 units.
    expect(gs.parseRequestBody('é'.repeat(5121)).errorCode).toBe('payload_too_large');
  });

  it.each([['not json'], ['[]'], ['null'], ['42'], ['"text"'], ['']])(
    'rejects %j as invalid_json',
    (raw) => {
      expect(gs.parseRequestBody(raw)).toEqual({ ok: false, errorCode: 'invalid_json' });
    },
  );

  it('rejects a missing body as invalid_json', () => {
    expect(gs.parseRequestBody(undefined).errorCode).toBe('invalid_json');
  });

  it('measures UTF-8 length including surrogate pairs', () => {
    expect(gs.utf8ByteLength('aé€😀')).toBe(1 + 2 + 3 + 4);
  });
});

describe('honeypot (§5.1) and fill time (§5.2)', () => {
  it.each([[undefined], [null], [''], ['   ']])('treats website=%j as human', (website) => {
    expect(gs.isHoneypotFilled(validBody({ website }))).toBe(false);
  });

  it.each([['http://spam.example'], ['x'], [0], [false], [{}], [[]]])(
    'treats website=%j as a bot',
    (website) => {
      expect(gs.isHoneypotFilled(validBody({ website }))).toBe(true);
    },
  );

  it('flags elapsed_ms below 3000', () => {
    expect(gs.isTooFast(0)).toBe(true);
    expect(gs.isTooFast(2999)).toBe(true);
    expect(gs.isTooFast(3000)).toBe(false);
  });
});

describe('validateLead (contract §3)', () => {
  it('accepts the contract example and normalizes it', () => {
    const result = gs.validateLead(validBody(), accepted);
    expect(result.ok).toBe(true);
    expect({ ...result.lead }).toEqual({
      name: 'Ana María Pérez',
      email: 'ana.perez@example.com',
      phone: '+50688880000',
      company: 'Panadería La Esquina',
      project_type: 'web_app',
      budget_range: 'from_1000_to_3000',
      timeline: 'within_3_months',
      message: 'Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería.',
      language: 'es',
      consent: true,
      privacy_notice_version: PRIVACY_VERSION,
      submission_id: '8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21',
    });
    expect(result.elapsedMs).toBe(48250);
  });

  it('ignores unknown fields', () => {
    expect(gs.validateLead(validBody({ extra: 'x', ip: '1.2.3.4' }), accepted).ok).toBe(true);
  });

  it('reports every field error at once', () => {
    const errors = errorsFor({ email: 'bad', message: 'short', consent: false });
    expect(errors).toEqual({
      email: 'invalid_format',
      message: 'too_short',
      consent: 'must_be_true',
    });
  });

  describe('name', () => {
    it('trims and collapses inner whitespace', () => {
      expect(valueOf('name', { name: '  Ana \t  María\n Pérez ' })).toBe('Ana María Pérez');
    });
    it.each([["O'Neil"], ['Jean-Luc'], ['J. R. Tolkien'], ['Zoë ’Ásh'], ['李小龍'], ['Ño']])(
      'accepts %j',
      (name) => {
        expect(errorsFor({ name })).toEqual({});
      },
    );
    it.each([
      [undefined, 'required'],
      [null, 'required'],
      ['   ', 'required'],
      [42, 'invalid_type'],
      ['A', 'too_short'],
      ['A'.repeat(101), 'too_long'],
      ['Ana2', 'invalid_format'],
      ['<script>', 'invalid_format'],
      ['=HYPERLINK', 'invalid_format'],
    ])('%j → %s', (name, code) => {
      expect(errorsFor({ name })).toEqual({ name: code });
    });
    it('accepts exactly 2 and 100 characters', () => {
      expect(errorsFor({ name: 'Al' })).toEqual({});
      expect(errorsFor({ name: 'A'.repeat(100) })).toEqual({});
    });
  });

  describe('email', () => {
    it('trims and lowercases', () => {
      expect(valueOf('email', { email: '  Ana.Perez@Example.COM ' })).toBe('ana.perez@example.com');
    });
    it.each([['a+tag@sub.example.co'], ['a_b%c@x-y.example.org'], ['-ana@example.com']])(
      'accepts %j',
      (email) => {
        expect(errorsFor({ email })).toEqual({});
      },
    );
    it.each([
      [undefined, 'required'],
      ['', 'required'],
      [true, 'invalid_type'],
      ['ana@example', 'invalid_format'],
      ['ana@@example.com', 'invalid_format'],
      ['ana perez@example.com', 'invalid_format'],
      ['.ana@example.com', 'invalid_format'],
      ['ana.@example.com', 'invalid_format'],
      ['an..a@example.com', 'invalid_format'],
      ['ana@-example.com', 'invalid_format'],
      ['ana@example.c', 'invalid_format'],
      [`${'a'.repeat(245)}@example.com`, 'too_long'],
    ])('%j → %s', (email, code) => {
      expect(errorsFor({ email })).toEqual({ email: code });
    });
  });

  describe('phone', () => {
    it.each([[undefined], [null], [''], ['  ']])('stores %j as empty', (phone) => {
      expect(valueOf('phone', { phone })).toBe('');
    });
    it('strips spaces, hyphens, parentheses and dots', () => {
      expect(valueOf('phone', { phone: '+1 (555) 123-45.67' })).toBe('+15551234567');
    });
    it.each([['1234567'], ['+123456789012345']])('accepts %j', (phone) => {
      expect(errorsFor({ phone })).toEqual({});
    });
    it.each([
      [8888, 'invalid_type'],
      ['123456', 'invalid_format'],
      ['+1234567890123456', 'invalid_format'],
      ['8888-ABCD', 'invalid_format'],
      ['++50688880000', 'invalid_format'],
    ])('%j → %s', (phone, code) => {
      expect(errorsFor({ phone })).toEqual({ phone: code });
    });
  });

  describe('company', () => {
    it.each([[undefined], [null], ['   ']])('stores %j as empty', (company) => {
      expect(valueOf('company', { company })).toBe('');
    });
    it('trims and allows 100 characters', () => {
      expect(valueOf('company', { company: '  ACME  ' })).toBe('ACME');
      expect(errorsFor({ company: 'C'.repeat(100) })).toEqual({});
    });
    it.each([
      [5, 'invalid_type'],
      ['C'.repeat(101), 'too_long'],
    ])('%j → %s', (company, code) => {
      expect(errorsFor({ company })).toEqual({ company: code });
    });
  });

  describe.each([
    ['project_type', ['website', 'web_app', 'business_system', 'custom_solution', 'not_sure']],
    [
      'budget_range',
      [
        'under_1000',
        'from_1000_to_3000',
        'from_3000_to_10000',
        'from_10000_to_25000',
        'over_25000',
        'not_sure',
      ],
    ],
    ['timeline', ['asap', 'within_1_month', 'within_3_months', 'flexible']],
    ['language', ['es', 'en']],
  ])('%s (§4)', (field, codes) => {
    it.each(codes.map((c) => [c]))('accepts %j', (code) => {
      expect(errorsFor({ [field]: code })).toEqual({});
    });
    it.each([
      [undefined, 'required'],
      ['', 'required'],
      [1, 'invalid_type'],
      ['Website', 'invalid_option'],
      ['other', 'invalid_option'],
    ])('%j → %s', (value, code) => {
      expect(errorsFor({ [field]: value })).toEqual({ [field]: code });
    });
  });

  describe('message', () => {
    it('trims and keeps line breaks', () => {
      expect(valueOf('message', { message: '  Line one is here\nline two is here  ' })).toBe(
        'Line one is here\nline two is here',
      );
    });
    it('accepts 20 and 2000 characters', () => {
      expect(errorsFor({ message: 'm'.repeat(20) })).toEqual({});
      expect(errorsFor({ message: 'm'.repeat(2000) })).toEqual({});
    });
    it.each([
      [undefined, 'required'],
      ['    ', 'required'],
      [['text'], 'invalid_type'],
      ['m'.repeat(19), 'too_short'],
      [`   ${'m'.repeat(19)}   `, 'too_short'],
      ['m'.repeat(2001), 'too_long'],
    ])('%j → %s', (message, code) => {
      expect(errorsFor({ message })).toEqual({ message: code });
    });
  });

  describe('consent', () => {
    it.each([
      [undefined, 'required'],
      [null, 'required'],
      ['true', 'invalid_type'],
      [1, 'invalid_type'],
      [false, 'must_be_true'],
    ])('%j → %s', (consent, code) => {
      expect(errorsFor({ consent })).toEqual({ consent: code });
    });
  });

  describe('privacy_notice_version', () => {
    it('accepts any version listed in ACCEPTED_PRIVACY_NOTICE_VERSIONS', () => {
      const result = gs.validateLead(validBody({ privacy_notice_version: '2027-01-01-v2' }), [
        PRIVACY_VERSION,
        '2027-01-01-v2',
      ]);
      expect(result.ok).toBe(true);
    });
    it.each([
      [undefined, 'required'],
      [7, 'invalid_type'],
      ['2026-01-01-v0', 'invalid_option'],
    ])('%j → %s', (version, code) => {
      expect(errorsFor({ privacy_notice_version: version })).toEqual({
        privacy_notice_version: code,
      });
    });
    it('rejects every version when none is configured', () => {
      const result = gs.validateLead(validBody(), []);
      expect({ ...result.fieldErrors }).toEqual({ privacy_notice_version: 'invalid_option' });
    });
  });

  describe('submission_id', () => {
    it.each([
      [undefined, 'required'],
      ['', 'required'],
      [123, 'invalid_type'],
      ['8F14E45F-CEEA-4E7A-9B1C-3F0A2D5C7E21', 'invalid_format'],
      ['8f14e45f-ceea-1e7a-9b1c-3f0a2d5c7e21', 'invalid_format'],
      ['8f14e45f-ceea-4e7a-7b1c-3f0a2d5c7e21', 'invalid_format'],
      ['not-a-uuid', 'invalid_format'],
    ])('%j → %s', (id, code) => {
      expect(errorsFor({ submission_id: id })).toEqual({ submission_id: code });
    });
  });

  describe('elapsed_ms', () => {
    it.each([[0], [86400000]])('accepts %j', (elapsed) => {
      expect(errorsFor({ elapsed_ms: elapsed })).toEqual({});
    });
    it.each([
      [undefined, 'required'],
      [null, 'required'],
      ['48250', 'invalid_type'],
      [1.5, 'invalid_type'],
      [-1, 'invalid_format'],
      [86400001, 'invalid_format'],
    ])('%j → %s', (elapsed, code) => {
      expect(errorsFor({ elapsed_ms: elapsed })).toEqual({ elapsed_ms: code });
    });
    it('is never part of the stored lead', () => {
      const result = gs.validateLead(validBody(), accepted);
      expect('elapsed_ms' in result.lead).toBe(false);
      expect('website' in result.lead).toBe(false);
    });
  });
});

describe('readConfig (contract §8)', () => {
  it('applies the defaults', () => {
    const c = gs.readConfig({});
    expect(c.sendEmails).toBe(true);
    expect([c.maxLeadsPerEmailPerHour, c.maxLeadsPerHour, c.maxLeadsPerDay]).toEqual([3, 20, 40]);
    expect([...c.acceptedPrivacyNoticeVersions]).toEqual([]);
  });
  it('parses versions, limits and SEND_EMAILS=false', () => {
    const c = gs.readConfig({
      ACCEPTED_PRIVACY_NOTICE_VERSIONS: ' 2026-10-14-v1 , 2027-01-01-v2,',
      SEND_EMAILS: 'FALSE',
      MAX_LEADS_PER_DAY: '10',
      MAX_LEADS_PER_HOUR: 'abc',
    });
    expect([...c.acceptedPrivacyNoticeVersions]).toEqual(['2026-10-14-v1', '2027-01-01-v2']);
    expect(c.sendEmails).toBe(false);
    expect(c.maxLeadsPerDay).toBe(10);
    expect(c.maxLeadsPerHour).toBe(20);
  });
});
