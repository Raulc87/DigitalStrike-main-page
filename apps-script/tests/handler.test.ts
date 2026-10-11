import { beforeEach, describe, expect, it } from 'vitest';
import { loadAppsScript, type AppsScriptContext } from './helpers/loadAppsScript';
import {
  FakeLock,
  FakeMailer,
  FakeSpreadsheet,
  newDataValidation,
  type FakeSheet,
} from './helpers/fakes';
import { SCRIPT_PROPERTIES, uuid, validBody } from './helpers/fixtures';

const gs = loadAppsScript();
const NOW = new Date('2026-10-14T16:00:00Z'); // 10:00:00 in Costa Rica
const COL = gs.COLUMN;

interface Harness {
  sheet: FakeSheet;
  mailer: FakeMailer;
  lock: FakeLock;
  logs: AppsScriptContext[];
  deps: AppsScriptContext;
  post: (body: unknown) => AppsScriptContext;
}

function harness(props: Record<string, string> = {}): Harness {
  const spreadsheet = new FakeSpreadsheet();
  gs.setupLeadsSheet(spreadsheet, newDataValidation);
  const sheet = spreadsheet.getSheetByName('leads') as FakeSheet;
  const mailer = new FakeMailer();
  const lock = new FakeLock();
  const logs: AppsScriptContext[] = [];
  const store = gs.createSheetStore(spreadsheet, (d: Date) => gs.formatCostaRicaDateTime(d));
  const deps: AppsScriptContext = {
    config: gs.readConfig({ ...SCRIPT_PROPERTIES, ...props }),
    now: () => NOW,
    random: Math.random,
    lock,
    store,
    mailer,
    composeEmail: (kind: string, lead: AppsScriptContext, context: AppsScriptContext) => ({
      kind,
      to: kind === 'owner' ? context.config.ownerNotificationEmail : lead.email,
      leadId: context.leadId,
    }),
    log: (entry: AppsScriptContext) => logs.push(entry),
  };
  const post = (body: unknown) => {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    // Round-trip through JSON like the HTTP response, so results compare as plain objects.
    return JSON.parse(JSON.stringify(gs.handleLeadRequest(raw, deps)));
  };
  return { sheet, mailer, lock, logs, deps, post };
}

function dataRows(h: Harness) {
  return h.sheet.rows.slice(1);
}

let h: Harness;
beforeEach(() => {
  h = harness();
});

describe('happy path (contract §5, US-010 AC1–AC2)', () => {
  it('stores one row, sends both emails in order and answers ok with the lead_id', () => {
    const res = h.post(validBody());
    expect(res.ok).toBe(true);
    expect(res.lead_id).toMatch(/^DS-20261014-[A-Z0-9]{6}$/);
    expect(Object.keys(res)).toEqual(['ok', 'lead_id']);

    const rows = dataRows(h);
    expect(rows).toHaveLength(1);
    const row = h.sheet.row(2);
    expect(row[COL.submitted_at - 1]).toBe('2026-10-14 10:00:00');
    expect(row[COL.status - 1]).toBe('new');
    expect(row[COL.lead_id - 1]).toBe(res.lead_id);
    expect(row[COL.phone - 1]).toBe('+50688880000');
    expect(row[COL.consent - 1]).toBe(true);
    expect(row[COL.owner_email_status - 1]).toBe('sent');
    expect(row[COL.confirmation_email_status - 1]).toBe('sent');
    expect(row[COL.submission_id - 1]).toBe('8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21');
    // Written with the formula guard; Sheets shows the value without the apostrophe.
    expect(h.sheet.written[0]?.[COL.phone - 1]).toBe("'+50688880000");

    expect(h.mailer.sent.map((m) => m.kind)).toEqual(['owner', 'confirmation']);
    expect(h.mailer.sent[1]?.to).toBe('ana.perez@example.com');
    expect(h.lock.held).toBe(false);
  });

  it('appends the row with both statuses pending before any email is sent', () => {
    let statusesAtSend: unknown[] = [];
    h.deps.mailer = {
      getRemainingDailyQuota: () => 10,
      sendEmail: () => {
        if (statusesAtSend.length === 0) {
          const row = h.sheet.row(2);
          statusesAtSend = [
            row[COL.owner_email_status - 1],
            row[COL.confirmation_email_status - 1],
          ];
        }
      },
    };
    h.post(validBody());
    expect(statusesAtSend).toEqual(['pending', 'pending']);
  });
});

describe('error responses (contract §7)', () => {
  it('payload_too_large', () => {
    const res = h.post(JSON.stringify(validBody({ message: 'm'.repeat(11000) })));
    expect(res).toEqual({
      ok: false,
      error_code: 'payload_too_large',
      message: expect.any(String),
    });
    expect(dataRows(h)).toHaveLength(0);
  });

  it('invalid_json', () => {
    expect(h.post('{oops').error_code).toBe('invalid_json');
    expect(h.post('[1,2]').error_code).toBe('invalid_json');
    expect(gs.handleLeadRequest(undefined, h.deps).error_code).toBe('invalid_json');
  });

  it('validation_failed with every field error, nothing stored, no lock taken', () => {
    const res = h.post(validBody({ email: 'nope', message: 'short', elapsed_ms: 'x' }));
    expect(res).toEqual({
      ok: false,
      error_code: 'validation_failed',
      message: 'One or more fields are invalid.',
      field_errors: { email: 'invalid_format', message: 'too_short', elapsed_ms: 'invalid_type' },
    });
    expect(dataRows(h)).toHaveLength(0);
    expect(h.lock.acquisitions).toBe(0);
  });

  it('rate_limited with retry_after_seconds; not stored, no email (US-014 AC3)', () => {
    for (let i = 0; i < 3; i++) expect(h.post(validBody({ submission_id: uuid() })).ok).toBe(true);
    h.mailer.sent = [];
    const res = h.post(validBody({ submission_id: uuid() }));
    expect(res.ok).toBe(false);
    expect(res.error_code).toBe('rate_limited');
    expect(res.retry_after_seconds).toBe(3600);
    expect(dataRows(h)).toHaveLength(3);
    expect(h.mailer.sent).toHaveLength(0);
  });

  it('applies the global hourly and daily caps from Script Properties', () => {
    h = harness({ MAX_LEADS_PER_HOUR: '2' });
    h.post(validBody({ submission_id: uuid(), email: 'a@example.com' }));
    h.post(validBody({ submission_id: uuid(), email: 'b@example.com' }));
    expect(h.post(validBody({ submission_id: uuid(), email: 'c@example.com' })).error_code).toBe(
      'rate_limited',
    );

    h = harness({ MAX_LEADS_PER_DAY: '1' });
    h.post(validBody({ submission_id: uuid(), email: 'a@example.com' }));
    const res = h.post(validBody({ submission_id: uuid(), email: 'b@example.com' }));
    expect(res.error_code).toBe('rate_limited');
    expect(res.retry_after_seconds).toBe(14 * 3600); // 10:00 → midnight in Costa Rica
  });

  it('storage_unavailable when the lock cannot be acquired within 10 s', () => {
    h.lock.available = false;
    expect(h.post(validBody()).error_code).toBe('storage_unavailable');
    expect(dataRows(h)).toHaveLength(0);
    expect(h.mailer.sent).toHaveLength(0);
  });

  it('storage_unavailable when the append fails; no email; lock released', () => {
    h.sheet.failAppend = true;
    expect(h.post(validBody()).error_code).toBe('storage_unavailable');
    expect(h.mailer.sent).toHaveLength(0);
    expect(h.lock.held).toBe(false);
  });

  it('storage_unavailable when the sheet cannot be read', () => {
    h.sheet.failRead = true;
    expect(h.post(validBody()).error_code).toBe('storage_unavailable');
    expect(h.lock.held).toBe(false);
  });

  it('internal_error on anything unexpected; lock released', () => {
    h.deps.now = () => {
      throw new Error('boom');
    };
    expect(h.post(validBody()).error_code).toBe('internal_error');
    expect(h.lock.held).toBe(false);
  });
});

describe('decoys (contract §5.1–5.2, US-014 AC2–AC3)', () => {
  it('honeypot: decoy success before validation, nothing stored or sent', () => {
    const res = h.post({ website: 'http://spam.example', name: 1 });
    expect(res.ok).toBe(true);
    expect(res.lead_id).toMatch(/^DS-\d{8}-[A-Z0-9]{6}$/);
    expect(dataRows(h)).toHaveLength(0);
    expect(h.mailer.sent).toHaveLength(0);
    expect(h.lock.acquisitions).toBe(0);
  });

  it('minimum fill time: elapsed_ms < 3000 → decoy success, nothing stored or sent', () => {
    const res = h.post(validBody({ elapsed_ms: 2999 }));
    expect(res.ok).toBe(true);
    expect(dataRows(h)).toHaveLength(0);
    expect(h.mailer.sent).toHaveLength(0);
  });

  it('fill time is checked after validation (invalid body with low elapsed_ms → validation_failed)', () => {
    expect(h.post(validBody({ elapsed_ms: 10, email: 'x' })).error_code).toBe('validation_failed');
  });

  it('elapsed_ms of exactly 3000 is stored', () => {
    expect(h.post(validBody({ elapsed_ms: 3000 })).ok).toBe(true);
    expect(dataRows(h)).toHaveLength(1);
  });
});

describe('idempotency (contract §5.4)', () => {
  it('a retry with the same submission_id returns the original lead_id, stores and sends nothing', () => {
    const first = h.post(validBody());
    const second = h.post(validBody());
    expect(second).toEqual({ ok: true, lead_id: first.lead_id });
    expect(dataRows(h)).toHaveLength(1);
    expect(h.mailer.sent).toHaveLength(2);
  });

  it('two concurrent requests with the same submission_id produce exactly one row (serialized by the lock)', () => {
    const first = h.post(validBody());
    const second = h.post(validBody());
    expect(first.lead_id).toBe(second.lead_id);
    expect(dataRows(h)).toHaveLength(1);
    expect(h.lock.acquisitions).toBe(2);
  });

  it('is found in the sheet hours later and with many rows (no cache involved)', () => {
    const first = h.post(validBody());
    for (let i = 0; i < 30; i++) {
      h.deps.now = () => new Date(NOW.getTime() + (i + 1) * 3600000);
      h.post(validBody({ submission_id: uuid(), email: `p${i}@example.com` }));
    }
    h.deps.now = () => new Date(NOW.getTime() + 40 * 3600000);
    expect(h.post(validBody()).lead_id).toBe(first.lead_id);
    expect(dataRows(h)).toHaveLength(31);
  });

  it('a known submission_id wins over the throttles', () => {
    h = harness({ MAX_LEADS_PER_DAY: '1' });
    const first = h.post(validBody());
    expect(h.post(validBody())).toEqual({ ok: true, lead_id: first.lead_id });
  });

  it('matches the whole cell only', () => {
    h.post(validBody());
    const other = '8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e2a';
    expect(h.post(validBody({ submission_id: other, email: 'b@example.com' })).ok).toBe(true);
    expect(dataRows(h)).toHaveLength(2);
  });

  it('recovery: a retry after a run interrupted after the append sends the pending emails once', () => {
    // Simulate the interrupted run: the row exists with both statuses pending.
    const lead = gs.validateLead(validBody(), [
      SCRIPT_PROPERTIES.ACCEPTED_PRIVACY_NOTICE_VERSIONS,
    ]).lead;
    h.sheet.appendRow([...gs.buildLeadRow(lead, 'DS-20261014-AAAAAA', '2026-10-14 09:59:00')]);

    expect(h.post(validBody())).toEqual({ ok: true, lead_id: 'DS-20261014-AAAAAA' });
    expect(h.mailer.sent.map((m) => [m.kind, m.leadId])).toEqual([
      ['owner', 'DS-20261014-AAAAAA'],
      ['confirmation', 'DS-20261014-AAAAAA'],
    ]);
    const row = h.sheet.row(2);
    expect([row[COL.owner_email_status - 1], row[COL.confirmation_email_status - 1]]).toEqual([
      'sent',
      'sent',
    ]);

    h.post(validBody());
    expect(h.mailer.sent).toHaveLength(2);
    expect(dataRows(h)).toHaveLength(1);
  });

  it('recovery sends only the email still pending; sent/failed/skipped/quota_exceeded are never resent', () => {
    const lead = gs.validateLead(validBody(), [
      SCRIPT_PROPERTIES.ACCEPTED_PRIVACY_NOTICE_VERSIONS,
    ]).lead;
    for (const done of ['sent', 'failed', 'skipped', 'quota_exceeded']) {
      h = harness();
      const row = [...gs.buildLeadRow(lead, 'DS-20261014-BBBBBB', '2026-10-14 09:59:00')];
      row[COL.owner_email_status - 1] = done;
      h.sheet.appendRow(row);
      h.post(validBody());
      expect(h.mailer.sent.map((m) => m.kind)).toEqual(['confirmation']);
      expect(h.sheet.row(2)[COL.owner_email_status - 1]).toBe(done);
    }
  });
});

describe('email statuses (contract §5 step 10, US-011 AC3, US-012 AC2–AC3)', () => {
  function statuses() {
    const row = h.sheet.row(2);
    return [row[COL.owner_email_status - 1], row[COL.confirmation_email_status - 1]];
  }

  it('SEND_EMAILS=false → skipped, nothing sent', () => {
    h = harness({ SEND_EMAILS: 'false' });
    expect(h.post(validBody()).ok).toBe(true);
    expect(statuses()).toEqual(['skipped', 'skipped']);
    expect(h.mailer.sent).toHaveLength(0);
  });

  it('a send failure is recorded as failed and does not change the response or the other email', () => {
    h.mailer.failKinds.add('owner');
    const res = h.post(validBody());
    expect(res.ok).toBe(true);
    expect(statuses()).toEqual(['failed', 'sent']);
  });

  it('a template error is recorded as failed', () => {
    h.deps.composeEmail = () => {
      throw new Error('template');
    };
    expect(h.post(validBody()).ok).toBe(true);
    expect(statuses()).toEqual(['failed', 'failed']);
  });

  it('remaining MailApp quota < 1 → quota_exceeded without attempting; the lead is stored', () => {
    h.mailer.quota = 0;
    expect(h.post(validBody()).ok).toBe(true);
    expect(statuses()).toEqual(['quota_exceeded', 'quota_exceeded']);
    expect(h.mailer.sent).toHaveLength(0);
  });

  it('quota for only one email: owner sent, confirmation quota_exceeded', () => {
    let quota = 1;
    h.deps.mailer = {
      getRemainingDailyQuota: () => quota,
      sendEmail: () => {
        quota--;
      },
    };
    h.post(validBody());
    expect(statuses()).toEqual(['sent', 'quota_exceeded']);
  });

  it('a failure to record the status does not change the response', () => {
    const store = h.deps.store;
    h.deps.store = {
      ...store,
      setCell: () => {
        throw new Error('write');
      },
    };
    // Spread loses nothing: the store methods are own properties of a plain object.
    expect(h.post(validBody()).ok).toBe(true);
    expect(h.mailer.sent).toHaveLength(2);
  });
});

describe('logging (US-010 AC4, NFR-006)', () => {
  it('never logs personal data, only events, lead_id and error codes', () => {
    h.post(validBody());
    h.post(validBody());
    h.post(validBody({ email: 'bad' }));
    h.post(validBody({ website: 'bot' }));
    h.mailer.failKinds.add('owner');
    h.post(validBody({ submission_id: uuid(), email: 'second@example.com' }));
    const text = JSON.stringify(h.logs);
    for (const pii of [
      'Ana',
      'ana.perez',
      'second@example.com',
      '8888',
      'Panadería',
      'catálogo',
      '8f14e45f',
    ]) {
      expect(text).not.toContain(pii);
    }
    expect(text).toContain('lead_stored');
    expect(text).toContain('validation_failed');
  });
});
