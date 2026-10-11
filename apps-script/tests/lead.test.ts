import { describe, expect, it } from 'vitest';
import { loadAppsScript } from './helpers/loadAppsScript';
import { validBody, PRIVACY_VERSION } from './helpers/fixtures';

const gs = loadAppsScript();

describe('Costa Rica time (UTC-06:00, contract §6 column A)', () => {
  it('formats submitted_at as yyyy-MM-dd HH:mm:ss in Costa Rica time', () => {
    expect(gs.formatCostaRicaDateTime(new Date('2026-10-14T05:07:09Z'))).toBe('2026-10-13 23:07:09');
    expect(gs.formatCostaRicaDateTime(new Date('2026-10-14T16:00:00Z'))).toBe('2026-10-14 10:00:00');
  });
  it('parses column A back to the same instant', () => {
    const t = new Date('2026-10-14T05:07:09Z');
    expect(gs.parseCostaRicaDateTime(gs.formatCostaRicaDateTime(t))).toBe(t.getTime());
    expect(gs.parseCostaRicaDateTime('garbage')).toBeNaN();
  });
  it('finds the next Costa Rica midnight', () => {
    expect(gs.nextCostaRicaMidnightMs(new Date('2026-10-14T05:00:00Z'))).toBe(Date.parse('2026-10-14T06:00:00Z'));
    expect(gs.nextCostaRicaMidnightMs(new Date('2026-10-14T06:00:00Z'))).toBe(Date.parse('2026-10-15T06:00:00Z'));
  });
});

describe('generateLeadId (contract §6 column C)', () => {
  it('is DS-yyyyMMdd-XXXXXX with the Costa Rica date', () => {
    let i = 0;
    const seq = [0, 0.99, 0.5, 0.72, 0.1, 0.35];
    const id = gs.generateLeadId(new Date('2026-10-15T03:00:00Z'), () => seq[i++]);
    expect(id).toBe('DS-20261014-A9SZDM');
  });
  it('matches the format with Math.random', () => {
    for (let n = 0; n < 50; n++) {
      expect(gs.generateLeadId(new Date(), Math.random)).toMatch(/^DS-\d{8}-[A-Z0-9]{6}$/);
    }
  });
});

describe('guardFormula (contract §3 formula injection)', () => {
  it.each([['=SUM(A1)'], ['+50688880000'], ['-1'], ['@me']])('prefixes %j with an apostrophe', (v) => {
    expect(gs.guardFormula(v)).toBe(`'${v}`);
  });
  it.each([['Ana'], [''], ['a=b'], [true]])('leaves %j unchanged', (v) => {
    expect(gs.guardFormula(v)).toBe(v);
  });
});

describe('buildLeadRow (contract §6)', () => {
  const lead = gs.validateLead(
    validBody({ message: '=HYPERLINK("http://evil")  is my message', company: '@corp', email: '+tag@example.com' }),
    [PRIVACY_VERSION],
  ).lead;

  it('has the 19 columns A–S in contract order, statuses pending', () => {
    const row = gs.buildLeadRow(lead, 'DS-20261014-K7Q2XM', '2026-10-14 10:00:00');
    expect([...gs.SHEET_COLUMNS]).toEqual([
      'submitted_at', 'status', 'lead_id', 'name', 'email', 'phone', 'company', 'project_type',
      'budget_range', 'timeline', 'message', 'language', 'consent', 'privacy_notice_version',
      'owner_email_status', 'confirmation_email_status', 'notes', 'submission_id', 'last_contact_at',
    ]);
    expect([...row]).toEqual([
      '2026-10-14 10:00:00',
      'new',
      'DS-20261014-K7Q2XM',
      'Ana María Pérez',
      "'+tag@example.com",
      "'+50688880000",
      "'@corp",
      'web_app',
      'from_1000_to_3000',
      'within_3_months',
      `'=HYPERLINK("http://evil")  is my message`,
      'es',
      true,
      PRIVACY_VERSION,
      'pending',
      'pending',
      '',
      '8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21',
      '',
    ]);
  });

  it('reads a stored row back (leadFromRow), dropping a guard apostrophe', () => {
    const row = gs.buildLeadRow(lead, 'DS-20261014-K7Q2XM', '2026-10-14 10:00:00');
    const back = gs.leadFromRow(row);
    expect(back.leadId).toBe('DS-20261014-K7Q2XM');
    expect(back.ownerEmailStatus).toBe('pending');
    expect(back.lead.phone).toBe('+50688880000');
    expect(back.lead.company).toBe('@corp');
    expect(back.lead.email).toBe('+tag@example.com');
  });
});
