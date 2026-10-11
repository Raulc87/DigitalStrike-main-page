import { describe, expect, it } from 'vitest';
import { loadAppsScript, type AppsScriptContext } from './helpers/loadAppsScript';
import { FakeLock, FakeMailer, FakeSpreadsheet, newDataValidation, type FakeSheet } from './helpers/fakes';
import { SCRIPT_PROPERTIES, validBody } from './helpers/fixtures';

function googleServices(props: Record<string, string> = SCRIPT_PROPERTIES) {
  const spreadsheet = new FakeSpreadsheet();
  const mailer = new FakeMailer();
  const lock = new FakeLock();
  const logs: string[] = [];
  const openedIds: string[] = [];
  const globals: AppsScriptContext = {
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text: string) => {
        const out = { text, mime: '', setMimeType: (m: string) => ((out.mime = m), out) };
        return out;
      },
    },
    PropertiesService: { getScriptProperties: () => ({ getProperties: () => ({ ...props }) }) },
    SpreadsheetApp: {
      openById: (id: string) => {
        openedIds.push(id);
        return spreadsheet;
      },
      newDataValidation,
    },
    LockService: { getScriptLock: () => lock },
    MailApp: mailer,
    Utilities: {
      formatDate: (d: Date) => d.toISOString(),
    },
    console: { log: (line: string) => logs.push(line) },
  };
  const gs = loadAppsScript({ withCode: true, globals });
  return { gs, spreadsheet, mailer, lock, logs, openedIds };
}

describe('doGet (US-010 AC1)', () => {
  it('answers the health check as JSON', () => {
    const { gs } = googleServices();
    const out = gs.doGet();
    expect(out.mime).toBe('application/json');
    expect(JSON.parse(out.text)).toEqual({ ok: true, service: 'ds-lead-endpoint' });
  });
});

describe('setupSheet (US-010 AC3)', () => {
  it('creates the leads header, status dropdown and plain-text columns, idempotently', () => {
    const { gs, spreadsheet, openedIds } = googleServices();
    gs.setupSheet();
    gs.setupSheet();
    expect(openedIds).toEqual(['sheet-id', 'sheet-id']);
    const sheet = spreadsheet.getSheetByName('leads') as FakeSheet;
    expect(sheet.rows).toHaveLength(1);
    expect(sheet.rows[0]).toEqual([...gs.SHEET_COLUMNS]);
    expect(sheet.frozenRows).toBe(1);
    expect(sheet.boldHeader).toBe(true);
    expect(sheet.validations).toContain('2:2+999:new|contacting|accepted|rejected');
    // Every column but M (consent) is plain text.
    const textColumns = new Set(sheet.formats.filter((f) => f.endsWith(':@')).map((f) => Number(f.split(':')[0])));
    expect(textColumns.size).toBe(18);
    expect(textColumns.has(gs.COLUMN.consent)).toBe(false);
  });

  it('uses an existing empty `leads` tab and keeps existing rows', () => {
    const { gs, spreadsheet } = googleServices();
    const sheet = spreadsheet.insertSheet('leads');
    gs.setupSheet();
    sheet.appendRow(['2026-10-14 10:00:00', 'contacting']);
    gs.setupSheet();
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.rows[1][1]).toBe('contacting');
  });

  it('refuses to overwrite a different header', () => {
    const { gs, spreadsheet } = googleServices();
    spreadsheet.insertSheet('leads').appendRow(['something else']);
    expect(() => gs.setupSheet()).toThrow(/different header/);
  });

  it('requires SHEET_ID', () => {
    const { gs } = googleServices({});
    expect(() => gs.setupSheet()).toThrow(/SHEET_ID/);
  });
});

describe('doPost wiring', () => {
  it('stores a lead through the real services and returns JSON', () => {
    const services = googleServices();
    services.gs.setupSheet();
    // Until DS-011 adds the templates, emails are recorded as failed; the lead is stored.
    const out = services.gs.doPost({ postData: { contents: JSON.stringify(validBody()) } });
    expect(out.mime).toBe('application/json');
    const body = JSON.parse(out.text);
    expect(body.ok).toBe(true);
    const sheet = services.spreadsheet.getSheetByName('leads') as FakeSheet;
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.rows[1][2]).toBe(body.lead_id);
    expect(services.lock.held).toBe(false);
    for (const line of services.logs) expect(line).not.toMatch(/ana|Ana|8888/);
  });

  it('does not open the sheet for rejected or decoy requests', () => {
    const services = googleServices();
    services.gs.doPost({ postData: { contents: '{bad' } });
    services.gs.doPost({ postData: { contents: JSON.stringify(validBody({ website: 'x' })) } });
    services.gs.doPost({});
    expect(services.openedIds).toEqual([]);
  });

  it('answers internal_error when configuration cannot be read', () => {
    const services = googleServices();
    services.gs.PropertiesService = {
      getScriptProperties: () => {
        throw new Error('no');
      },
    };
    const body = JSON.parse(services.gs.doPost({ postData: { contents: '{}' } }).text);
    expect(body).toEqual({ ok: false, error_code: 'internal_error', message: 'Unexpected error.' });
  });

  it('answers storage_unavailable when the leads tab is missing', () => {
    const services = googleServices();
    const body = JSON.parse(services.gs.doPost({ postData: { contents: JSON.stringify(validBody()) } }).text);
    expect(body.error_code).toBe('storage_unavailable');
  });
});
