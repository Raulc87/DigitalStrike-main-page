// Integration suite (DS-009-integration-e2e, US-009 AC8, US-013 AC2, US-014 AC1): the built site
// against the contract mock (scripts/mock-lead-endpoint.mjs), on desktop and at 390 px.
// Build with PUBLIC_LEAD_ENDPOINT_URL set (e.g. http://127.0.0.1:8787/exec, contract §8): the tests
// route that URL to per-worker mock instances (support/lead-mock.ts). Paths are relative, so the
// suite also runs on the GitHub Pages build via PLAYWRIGHT_BASE_URL=http://127.0.0.1:4321/DigitalStrike-main-page/
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';
import {
  expect,
  fillLeadForm,
  installFillClock,
  MINIMUM_FILL_MS,
  passMinimumFillTime,
  submit,
  test,
  visitor,
} from './support/lead-mock';

const dictionaries = { es: esForm, en: enForm } as const;
const CONTACT = 'manager@digitalstrike-solutions.com';

// Calendly loads after a successful lead (FR-015): serve a stand-in with the official API shape and
// iframe sizing, recording the prefill, so no test ever reaches the real service.
const FAKE_WIDGET = `window.Calendly = { initInlineWidget: function (o) {
  var f = document.createElement('iframe');
  f.title = 'calendly'; f.src = 'about:blank'; f.width = '100%'; f.height = '100%';
  f.dataset.url = o.url; f.dataset.prefill = JSON.stringify(o.prefill || null);
  o.parentElement.appendChild(f);
} };`;

async function fakeCalendly(page: Page): Promise<string[]> {
  const requests: string[] = [];
  await page.route(/^https:\/\/([a-z0-9-]+\.)*calendly\.com\//, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: FAKE_WIDGET });
  });
  return requests;
}

// Every flow test needs a site built with PUBLIC_LEAD_ENDPOINT_URL: without it the form shows the
// generic error and never posts (by design). Stop once with a clear message instead of ~20
// unrelated assertion failures.
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('es/');
  const endpoint = await page.locator('[data-lead-root]').getAttribute('data-endpoint');
  await page.close();
  if (endpoint !== 'configured') {
    throw new Error(
      'lead-flow.spec.ts needs a site built with PUBLIC_LEAD_ENDPOINT_URL set, e.g. ' +
        '`PUBLIC_LEAD_ENDPOINT_URL=http://127.0.0.1:8787/exec npm run build` (contract §8). ' +
        'The suite routes that URL to its own in-process mock; no separate mock process is needed.',
    );
  }
});

// The page clock is controlled so the minimum fill time never races the wall clock (US-024):
// installed before any navigation, it flows normally until passMinimumFillTime() jumps it ahead.
test.beforeEach(async ({ page }) => {
  await installFillClock(page);
  await fakeCalendly(page);
});

for (const lang of ['es', 'en'] as const) {
  const t = dictionaries[lang];

  test(`/${lang}/ happy path: the lead is stored and Calendly opens prefilled`, async ({
    page,
    mocks,
    traffic,
    useMock,
  }) => {
    await useMock('ok');
    await page.goto(`${lang}/#contacto`);
    await fillLeadForm(page);
    await passMinimumFillTime(page);
    await submit(page);

    const title = page.locator('[data-lead-success-title]');
    await expect(title).toHaveText(t['form.success.title'].replace('{first_name}', 'Ana'));
    await expect(title).toBeFocused();
    await expect(page.locator('form[data-lead-form]')).toBeHidden();

    expect(traffic.bodies).toHaveLength(1);
    const body = traffic.bodies[0]!;
    expect(body).toMatchObject({
      name: 'Ana María Pérez',
      email: 'ana.perez@example.com',
      phone: '+50688880000',
      language: lang,
      consent: true,
      privacy_notice_version: '2026-10-14-v1',
      website: '',
    });
    expect(body.elapsed_ms).toBeGreaterThanOrEqual(MINIMUM_FILL_MS);

    const leads = await mocks.ok.leads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      status: 'new',
      name: 'Ana María Pérez',
      email: 'ana.perez@example.com',
      phone: '+50688880000',
      company: visitor.company,
      project_type: visitor.project_type,
      budget_range: visitor.budget_range,
      timeline: visitor.timeline,
      message: visitor.message,
      language: lang,
      privacy_notice_version: '2026-10-14-v1',
      submission_id: body.submission_id,
    });

    // US-013 AC2: the widget loads after the submission with name and email prefilled.
    const iframe = page.locator('[data-schedule-container] iframe');
    await expect(iframe).toHaveCount(1);
    expect(JSON.parse((await iframe.getAttribute('data-prefill'))!)).toEqual({
      name: 'Ana María Pérez',
      email: 'ana.perez@example.com',
    });
    await page.getByRole('link', { name: t['form.success.cta'] }).click();
    await expect(page).toHaveURL(/#agenda$/);
  });

  test(`/${lang}/ storage_unavailable keeps the data; an edit sends a new submission_id`, async ({
    page,
    mocks,
    traffic,
    useMock,
  }) => {
    await useMock('storage');
    await page.goto(`${lang}/#contacto`);
    await fillLeadForm(page);
    await passMinimumFillTime(page);
    await submit(page);

    const status = page.locator('[data-lead-status]');
    await expect(status).toHaveText(t['form.error.generic'].replace('{email}', CONTACT));
    await expect(status.locator('a')).toHaveAttribute('href', `mailto:${CONTACT}`);
    await expect(page.locator('input[name="name"]')).toHaveValue(visitor.name);
    await expect(page.locator('form[data-lead-form] button[type="submit"]')).toBeEnabled();

    // The visitor edits a field and retries against a working endpoint: a new id (contract §5.4).
    await useMock('ok');
    await page.locator('input[name="company"]').fill('Panadería La Esquina S.A.');
    await submit(page);
    await expect(page.locator('[data-lead-success-title]')).toBeVisible();
    expect(traffic.bodies).toHaveLength(2);
    expect(traffic.bodies[1]!.submission_id).not.toBe(traffic.bodies[0]!.submission_id);
    expect(await mocks.storage.leads()).toHaveLength(0);
    expect(await mocks.ok.leads()).toHaveLength(1);
  });

  test(`/${lang}/ rate_limited shows its message and stores nothing`, async ({
    page,
    mocks,
    useMock,
  }) => {
    // Fill the hourly cap (1) with another visitor's lead.
    const first = await mocks.limited.post({
      ...visitor,
      email: 'otra.persona@example.com',
      language: lang,
      consent: true,
      privacy_notice_version: '2026-10-14-v1',
      submission_id: '11111111-1111-4111-8111-111111111111',
      website: '',
      elapsed_ms: 5000,
    });
    expect(first.ok).toBe(true);

    await useMock('limited');
    await page.goto(`${lang}/#contacto`);
    await fillLeadForm(page);
    await passMinimumFillTime(page);
    await submit(page);
    await expect(page.locator('[data-lead-status]')).toHaveText(
      t['form.error.rate_limited'].replace('{email}', CONTACT),
    );
    await expect(page.locator('textarea[name="message"]')).toHaveValue(visitor.message);
    expect(await mocks.limited.leads()).toHaveLength(1);
  });
}

test('network failure, then an unchanged retry reuses the submission_id: one row', async ({
  page,
  mocks,
  traffic,
}) => {
  // The first request reaches the endpoint and is stored, but its response is lost (the worst
  // case for duplicates); the retry must be recognised by its submission_id (contract §5.4).
  let attempt = 0;
  await page.route('**/exec', async (route) => {
    attempt += 1;
    if (attempt === 1) {
      await route.fetch({ url: mocks.ok.url });
      await route.abort('failed');
    } else {
      await route.continue({ url: mocks.ok.url });
    }
  });
  await page.goto('es/#contacto');
  await fillLeadForm(page);
  await passMinimumFillTime(page);
  await submit(page);
  await expect(page.locator('[data-lead-status]')).toHaveText(
    esForm['form.error.generic'].replace('{email}', CONTACT),
  );
  expect(await mocks.ok.leads()).toHaveLength(1);

  await submit(page);
  await expect(page.locator('[data-lead-success-title]')).toBeVisible();
  expect(traffic.bodies).toHaveLength(2);
  expect(traffic.bodies[1]!.submission_id).toBe(traffic.bodies[0]!.submission_id);
  expect(await mocks.ok.leads()).toHaveLength(1);
});

test('network failure with nothing stored: the retry stores exactly one row', async ({
  page,
  mocks,
  traffic,
}) => {
  let attempt = 0;
  await page.route('**/exec', (route) =>
    ++attempt === 1 ? route.abort('connectionrefused') : route.continue({ url: mocks.ok.url }),
  );
  await page.goto('en/#contacto');
  await fillLeadForm(page);
  await passMinimumFillTime(page);
  await submit(page);
  await expect(page.locator('[data-lead-status]')).toHaveText(
    enForm['form.error.generic'].replace('{email}', CONTACT),
  );
  await submit(page);
  await expect(page.locator('[data-lead-success-title]')).toBeVisible();
  expect(traffic.bodies[1]!.submission_id).toBe(traffic.bodies[0]!.submission_id);
  expect(await mocks.ok.leads()).toHaveLength(1);
});

test('a form script that starts late still passes the minimum fill time (US-024)', async ({
  page,
  mocks,
  traffic,
  useMock,
}) => {
  // A busy machine runs the form's script well after navigation; its elapsed_ms counts from then.
  await page.route(/\/LeadForm\.[^/]*\.js$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.continue();
  });
  await useMock('ok');
  await page.goto('es/#contacto');
  await fillLeadForm(page);
  await passMinimumFillTime(page);
  await submit(page);
  await expect(page.locator('[data-lead-success-title]')).toBeVisible();
  expect(traffic.bodies[0]!.elapsed_ms).toBeGreaterThanOrEqual(MINIMUM_FILL_MS);
  expect(await mocks.ok.leads()).toHaveLength(1);
});

test('client validation errors send nothing to the endpoint', async ({
  page,
  traffic,
  useMock,
}) => {
  await useMock('ok');
  await page.goto('es/#contacto');
  await page.locator('input[name="email"]').fill('ana@');
  await submit(page);
  await expect(page.locator('[data-lead-error-summary]')).toBeFocused();
  await expect(page.locator('#lead-email-error')).toHaveText(
    esForm['form.error.invalid_format.email'],
  );
  expect(traffic.bodies).toHaveLength(0);
});

test('a form filled the way autofill leaves it is stored with an empty honeypot (US-014 AC1)', async ({
  page,
  mocks,
  traffic,
  useMock,
}) => {
  await useMock('ok');
  await page.goto('es/#contacto');
  // Autofill sets the values of every field it recognises in the lead form in one step, then
  // fires input/change; it never reaches the honeypot, which lives in another form.
  await page.evaluate((data) => {
    const form = document.querySelector<HTMLFormElement>('form[data-lead-form]')!;
    const set = (name: string, value: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    for (const el of form.querySelectorAll<HTMLInputElement>('input[autocomplete]')) {
      const hint = el.getAttribute('autocomplete');
      if (hint === 'name') set(el.name, data.name);
      if (hint === 'email') set(el.name, data.email);
      if (hint === 'tel') set(el.name, data.phone);
      if (hint === 'organization') set(el.name, data.company);
    }
  }, visitor);
  const form = page.locator('form[data-lead-form]');
  await form.locator('select[name="project_type"]').selectOption(visitor.project_type);
  await form.locator('select[name="budget_range"]').selectOption(visitor.budget_range);
  await form.locator('select[name="timeline"]').selectOption(visitor.timeline);
  await form.locator('textarea[name="message"]').fill(visitor.message);
  await form.locator('input[name="consent"]').check();
  await passMinimumFillTime(page);
  await submit(page);
  await expect(page.locator('[data-lead-success-title]')).toBeVisible();
  expect(traffic.bodies[0]!.website).toBe('');
  expect(await mocks.ok.leads()).toHaveLength(1);
});

test('the root page follows the browser language on the built site (es-CR, en-US)', async ({
  browser,
}) => {
  for (const [locale, lang] of [
    ['es-CR', 'es'],
    ['en-US', 'en'],
  ] as const) {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    await page.goto('./');
    await expect(page).toHaveURL(new RegExp(`/${lang}/$`));
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await context.close();
  }
});

for (const lang of ['es', 'en'] as const) {
  test(`/${lang}/ axe: no serious or critical violations (page, errors, success)`, async ({
    page,
    useMock,
  }) => {
    await useMock('ok');
    const scan = async () => {
      const result = await new AxeBuilder({ page }).analyze();
      return result.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes[0]?.html}`);
    };
    await page.goto(`${lang}/`);
    expect(await scan()).toEqual([]);
    await submit(page); // the error state
    await expect(page.locator('[data-lead-error-summary]')).toBeVisible();
    expect(await scan()).toEqual([]);
    await fillLeadForm(page);
    await passMinimumFillTime(page);
    await submit(page); // the success state, with the (stand-in) Calendly widget
    await expect(page.locator('[data-lead-success-title]')).toBeVisible();
    expect(await scan()).toEqual([]);
  });
}
