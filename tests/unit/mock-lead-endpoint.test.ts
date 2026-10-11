import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createMockLeadEndpoint } from '../../scripts/mock-lead-endpoint.mjs';

let server: Server | undefined;

async function start(env: Record<string, string> = {}): Promise<string> {
  server = createMockLeadEndpoint(env);
  await new Promise<void>((done) => server?.listen(0, '127.0.0.1', done));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterEach(async () => {
  await new Promise((done) => server?.close(done));
  server = undefined;
});

let n = 0;
function body(overrides: Record<string, unknown> = {}) {
  n++;
  return {
    name: 'Ana María Pérez',
    email: 'ana.perez@example.com',
    phone: '+506 8888 0000',
    company: '',
    project_type: 'website',
    budget_range: 'not_sure',
    timeline: 'flexible',
    message: 'Necesito una página web para mi emprendimiento.',
    language: 'es',
    consent: true,
    privacy_notice_version: '2026-10-14-v1',
    submission_id: `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`,
    website: '',
    elapsed_ms: 12000,
    ...overrides,
  };
}

async function post(base: string, payload: unknown) {
  const res = await fetch(`${base}/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
  expect(res.status).toBe(200);
  expect(res.headers.get('access-control-allow-origin')).toBe('*');
  return res.json();
}

async function leads(base: string) {
  return (await (await fetch(`${base}/__leads`)).json()).leads;
}

describe('mock lead endpoint (contract §9, US-015 AC1)', () => {
  it('stores a valid lead and lists it on GET /__leads', async () => {
    const base = await start();
    const res = await post(base, body());
    expect(res).toEqual({ ok: true, lead_id: expect.stringMatching(/^DS-\d{8}-[A-Z0-9]{6}$/) });
    const rows = await leads(base);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      lead_id: res.lead_id,
      status: 'new',
      email: 'ana.perez@example.com',
      phone: '+50688880000',
      owner_email_status: 'skipped',
      confirmation_email_status: 'skipped',
    });
  });

  it('answers the health check and refuses CORS preflights like Apps Script (contract §2)', async () => {
    const base = await start();
    expect(await (await fetch(`${base}/exec`)).json()).toEqual({
      ok: true,
      service: 'ds-lead-endpoint',
    });
    const pre = await fetch(`${base}/exec`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://127.0.0.1:4321',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(pre.status).toBe(405);
    expect(pre.headers.get('access-control-allow-origin')).toBeNull();
    expect(pre.headers.get('access-control-allow-headers')).toBeNull();
  });

  it('validates like the server', async () => {
    const base = await start();
    const res = await post(base, body({ email: 'bad', consent: false }));
    expect(res).toMatchObject({
      ok: false,
      error_code: 'validation_failed',
      field_errors: { email: 'invalid_format', consent: 'must_be_true' },
    });
    expect(await post(base, '{nope')).toMatchObject({ ok: false, error_code: 'invalid_json' });
    expect(await post(base, 'x'.repeat(10241))).toMatchObject({ error_code: 'payload_too_large' });
  });

  it('returns decoy successes for the honeypot and a fast fill without storing', async () => {
    const base = await start();
    expect((await post(base, body({ website: 'spam' }))).ok).toBe(true);
    expect((await post(base, body({ elapsed_ms: 500 }))).ok).toBe(true);
    expect(await leads(base)).toHaveLength(0);
  });

  it('is idempotent by submission_id', async () => {
    const base = await start();
    const payload = body();
    const first = await post(base, payload);
    expect(await post(base, payload)).toEqual(first);
    expect(await leads(base)).toHaveLength(1);
  });

  it('rate limits the 4th lead of an email within an hour', async () => {
    const base = await start();
    for (let i = 0; i < 3; i++) expect((await post(base, body())).ok).toBe(true);
    const res = await post(base, body());
    expect(res).toMatchObject({ ok: false, error_code: 'rate_limited' });
    // Whole-second timestamps: 3600 s minus however many seconds the test took. The exact
    // value is covered with a fixed clock in apps-script/tests/throttle.test.ts.
    expect(res.retry_after_seconds).toBeGreaterThanOrEqual(3590);
    expect(res.retry_after_seconds).toBeLessThanOrEqual(3600);
  });

  it('accepts limit overrides from the environment', async () => {
    const base = await start({ MOCK_MAX_LEADS_PER_EMAIL_PER_HOUR: '100' });
    for (let i = 0; i < 5; i++) expect((await post(base, body())).ok).toBe(true);
  });

  it('MOCK_FAIL=storage returns storage_unavailable for valid requests', async () => {
    const base = await start({ MOCK_FAIL: 'storage' });
    expect(await post(base, body())).toMatchObject({
      ok: false,
      error_code: 'storage_unavailable',
    });
    expect(await leads(base)).toHaveLength(0);
  });

  it('DELETE /__leads clears the store', async () => {
    const base = await start();
    await post(base, body());
    await fetch(`${base}/__leads`, { method: 'DELETE' });
    expect(await leads(base)).toHaveLength(0);
  });
});
