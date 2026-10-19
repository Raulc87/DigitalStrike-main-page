// Integration fixtures (DS-009-integration-e2e): the contract mock scripts/mock-lead-endpoint.mjs
// (Agent 3, contract §9) runs in-process, one set of instances per Playwright worker on ephemeral
// ports, so parallel workers never share a store. The built site posts to the endpoint it was built
// with (PUBLIC_LEAD_ENDPOINT_URL); each test routes that request to the instance it needs:
// `ok` (normal), `storage` (MOCK_FAIL=storage) or `limited` (MOCK_MAX_LEADS_PER_HOUR=1).
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { test as base, expect } from '@playwright/test';
import type { Page, Request } from '@playwright/test';
import { createMockLeadEndpoint } from '../../../scripts/mock-lead-endpoint.mjs';

export type MockKind = 'ok' | 'storage' | 'limited';

export interface MockEndpoint {
  url: string;
  leads(): Promise<Array<Record<string, unknown>>>;
  reset(): Promise<void>;
  post(body: unknown): Promise<Record<string, unknown>>;
}

const ENV: Record<MockKind, Record<string, string>> = {
  ok: { MOCK_MAX_LEADS_PER_HOUR: '1000', MOCK_MAX_LEADS_PER_DAY: '1000' },
  storage: {
    MOCK_FAIL: 'storage',
    MOCK_MAX_LEADS_PER_HOUR: '1000',
    MOCK_MAX_LEADS_PER_DAY: '1000',
  },
  limited: { MOCK_MAX_LEADS_PER_HOUR: '1', MOCK_MAX_LEADS_PER_DAY: '1000' },
};

async function start(kind: MockKind): Promise<{ server: Server; endpoint: MockEndpoint }> {
  const server = createMockLeadEndpoint(ENV[kind]) as Server;
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const endpoint: MockEndpoint = {
    url: `${origin}/exec`,
    async leads() {
      const res = await fetch(`${origin}/__leads`);
      return ((await res.json()) as { leads: Array<Record<string, unknown>> }).leads;
    },
    async reset() {
      await fetch(`${origin}/__leads`, { method: 'DELETE' });
    },
    async post(body) {
      const res = await fetch(`${origin}/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
      });
      return (await res.json()) as Record<string, unknown>;
    },
  };
  return { server, endpoint };
}

/** Lead POSTs the page sent, with their parsed JSON bodies. */
export interface LeadTraffic {
  bodies: Array<Record<string, unknown>>;
}

export const test = base.extend<
  {
    mocks: Record<MockKind, MockEndpoint>;
    traffic: LeadTraffic;
    useMock: (kind: MockKind) => Promise<void>;
  },
  { workerMocks: Record<MockKind, MockEndpoint> }
>({
  workerMocks: [
    // eslint-disable-next-line no-empty-pattern -- Playwright fixtures must destructure their deps.
    async ({}, use) => {
      const started = await Promise.all((['ok', 'storage', 'limited'] as const).map(start));
      await use({
        ok: started[0]!.endpoint,
        storage: started[1]!.endpoint,
        limited: started[2]!.endpoint,
      });
      await Promise.all(started.map(({ server }) => new Promise((r) => server.close(r))));
    },
    { scope: 'worker' },
  ],
  mocks: async ({ workerMocks }, use) => {
    await Promise.all(Object.values(workerMocks).map((m) => m.reset()));
    await use(workerMocks);
  },
  traffic: async ({ page }, use) => {
    const traffic: LeadTraffic = { bodies: [] };
    page.on('request', (request: Request) => {
      if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/exec')) {
        traffic.bodies.push(JSON.parse(request.postData() ?? 'null') as Record<string, unknown>);
      }
    });
    await use(traffic);
  },
  useMock: async ({ page, mocks }, use) => {
    await use(async (kind) => {
      await page.unroute('**/exec');
      await page.route('**/exec', (route) =>
        route.request().method() === 'POST'
          ? route.continue({ url: mocks[kind].url })
          : route.continue(),
      );
    });
  },
});

export { expect };

/** A valid lead in the visitor's own words (fictitious data). */
export const visitor = {
  name: 'Ana  María Pérez',
  email: 'Ana.Perez@Example.com',
  phone: '+506 8888 0000',
  company: 'Panadería La Esquina',
  project_type: 'web_app',
  budget_range: 'from_1000_to_3000',
  timeline: 'within_3_months',
  message: 'Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería.',
};

/**
 * Fills the visible fields the way a person (or browser autofill) would. The contract's minimum
 * fill time is 3 s (§5.2): a faster submit is a silent decoy, so callers wait before submitting.
 */
export async function fillLeadForm(page: Page, data = visitor): Promise<void> {
  const form = page.locator('form[data-lead-form]');
  await form.locator('input[name="name"]').fill(data.name);
  await form.locator('input[name="email"]').fill(data.email);
  await form.locator('input[name="phone"]').fill(data.phone);
  await form.locator('input[name="company"]').fill(data.company);
  await form.locator('select[name="project_type"]').selectOption(data.project_type);
  await form.locator('select[name="budget_range"]').selectOption(data.budget_range);
  await form.locator('select[name="timeline"]').selectOption(data.timeline);
  await form.locator('textarea[name="message"]').fill(data.message);
  await form.locator('input[name="consent"]').check();
}

/** The contract's minimum fill time (§5.2): a valid `elapsed_ms` below it is a decoy. */
export const MINIMUM_FILL_MS = 3_000;

/** Pages whose clock was installed before their first navigation (installFillClock). */
const clockedPages = new WeakSet<Page>();

/**
 * Installs the Playwright clock on a page that has not navigated yet. The fake clock still flows
 * normally; passMinimumFillTime() needs it in place before the form's script runs.
 */
export async function installFillClock(page: Page): Promise<void> {
  if (page.url() !== 'about:blank') {
    throw new Error('installFillClock() must run before page.goto(), or the form starts first.');
  }
  await page.clock.install();
  clockedPages.add(page);
}

/**
 * Moves the page clock past the minimum fill time. The form measures `elapsed_ms` with
 * `performance.now()` from the moment its own script runs, which on a busy machine can be well
 * after navigation, so a wall-clock wait races it (US-024). With the clock installed before
 * navigation (installFillClock), this jumps it ahead by exactly the minimum, so the form always
 * measures at least 3000 ms whatever the load. Without it, the jump would install the clock late
 * and the form would measure less, so it fails fast instead.
 */
export async function passMinimumFillTime(page: Page): Promise<void> {
  if (!clockedPages.has(page)) {
    throw new Error('passMinimumFillTime() needs installFillClock(page) before page.goto().');
  }
  await page.clock.fastForward(MINIMUM_FILL_MS);
}

export async function submit(page: Page): Promise<void> {
  await page.locator('form[data-lead-form] button[type="submit"]').click();
}
