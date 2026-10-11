import { afterEach, describe, expect, it, vi } from 'vitest';
import { LEAD_TIMEOUT_MS, mapResponse, submitLead } from '../../src/lib/lead/client';
import type { LeadPayload } from '../../src/lib/lead/types';

// Contract §2 (request) and §7 (every response, network errors, timeouts, malformed bodies).

const ENDPOINT = 'https://script.google.com/macros/s/test/exec';

const payload: LeadPayload = {
  name: 'Ana María Pérez',
  email: 'ana.perez@example.com',
  phone: '+50688880000',
  company: '',
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
};

function respondWith(text: string) {
  return vi.fn<typeof fetch>(async () => new Response(text, { status: 200 }));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('request (contract §2)', () => {
  it('POSTs the JSON string as text/plain, following redirects without credentials', async () => {
    const fetchImpl = respondWith('{"ok":true,"lead_id":"DS-20261014-K7Q2XM"}');
    await submitLead(ENDPOINT, payload, { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(ENDPOINT);
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      credentials: 'omit',
    });
    expect(Object.keys(init!.headers as Record<string, string>)).toEqual(['Content-Type']);
    expect(init!.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(init!.body as string)).toEqual(payload);
  });

  it('times out after 20 s and maps it to internal_error', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init!.signal!.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const pending = submitLead(ENDPOINT, payload, { fetchImpl });
    await vi.advanceTimersByTimeAsync(LEAD_TIMEOUT_MS - 1);
    expect(fetchImpl.mock.calls[0]![1]!.signal!.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({
      kind: 'error',
      errorCode: 'internal_error',
      reason: 'timeout',
    });
    expect(LEAD_TIMEOUT_MS).toBe(20_000);
  });

  it('a missing endpoint makes no request and maps to internal_error', async () => {
    const fetchImpl = respondWith('{}');
    await expect(submitLead('', payload, { fetchImpl })).resolves.toEqual({
      kind: 'error',
      errorCode: 'internal_error',
      reason: 'no_endpoint',
    });
    await expect(submitLead(undefined, payload, { fetchImpl })).resolves.toMatchObject({
      reason: 'no_endpoint',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('responses (contract §7)', () => {
  it('success', async () => {
    const fetchImpl = respondWith('{"ok":true,"lead_id":"DS-20261014-K7Q2XM"}');
    await expect(submitLead(ENDPOINT, payload, { fetchImpl })).resolves.toEqual({
      kind: 'success',
      leadId: 'DS-20261014-K7Q2XM',
    });
  });

  it('validation_failed with field_errors', async () => {
    const fetchImpl = respondWith(
      JSON.stringify({
        ok: false,
        error_code: 'validation_failed',
        message: 'One or more fields are invalid.',
        field_errors: { email: 'invalid_format', message: 'too_short' },
      }),
    );
    await expect(submitLead(ENDPOINT, payload, { fetchImpl })).resolves.toEqual({
      kind: 'validation_failed',
      fieldErrors: { email: 'invalid_format', message: 'too_short' },
    });
  });

  it('rate_limited with retry_after_seconds', async () => {
    const fetchImpl = respondWith(
      '{"ok":false,"error_code":"rate_limited","message":"x","retry_after_seconds":1200}',
    );
    await expect(submitLead(ENDPOINT, payload, { fetchImpl })).resolves.toEqual({
      kind: 'rate_limited',
      retryAfterSeconds: 1200,
    });
    expect(mapResponse({ ok: false, error_code: 'rate_limited' })).toEqual({
      kind: 'rate_limited',
      retryAfterSeconds: null,
    });
  });

  it.each(['invalid_json', 'payload_too_large', 'storage_unavailable', 'internal_error'] as const)(
    '%s',
    async (code) => {
      const fetchImpl = respondWith(JSON.stringify({ ok: false, error_code: code, message: 'x' }));
      await expect(submitLead(ENDPOINT, payload, { fetchImpl })).resolves.toEqual({
        kind: 'error',
        errorCode: code,
      });
    },
  );

  it('an unknown error_code → internal_error', () => {
    expect(mapResponse({ ok: false, error_code: 'teapot' })).toEqual({
      kind: 'error',
      errorCode: 'internal_error',
      reason: 'unknown_code',
    });
  });

  it('network failure → internal_error', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(submitLead(ENDPOINT, payload, { fetchImpl })).resolves.toEqual({
      kind: 'error',
      errorCode: 'internal_error',
      reason: 'network',
    });
  });

  it.each([
    ['non-JSON body', '<html>Error</html>'],
    ['empty body', ''],
    ['JSON without ok', '{"lead_id":"x"}'],
    ['ok not boolean', '{"ok":"true"}'],
    ['array', '[true]'],
    ['null', 'null'],
  ])('%s → internal_error', async (_name, text) => {
    await expect(submitLead(ENDPOINT, payload, { fetchImpl: respondWith(text) })).resolves.toEqual({
      kind: 'error',
      errorCode: 'internal_error',
      reason: 'malformed',
    });
  });

  it('ignores the HTTP status: the body is the source of truth (§1)', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response('{"ok":true,"lead_id":"DS-1"}', { status: 500 }),
    );
    await expect(submitLead(ENDPOINT, payload, { fetchImpl })).resolves.toMatchObject({
      kind: 'success',
    });
  });
});
