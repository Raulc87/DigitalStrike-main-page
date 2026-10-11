import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';

// US-013 AC1, AC3, AC4: no Calendly request before the click; the widget container after it; the
// fallback when Calendly is blocked or renders nothing within 10 s. Calendly's network is always
// intercepted here, so tests never reach the real service.

const CALENDLY = /^https:\/\/([a-z0-9-]+\.)*calendly\.com\//;

// Stand-in for widget.js: the official API shape, rendering an iframe for the given URL with the
// official sizing (width/height 100% of the container, no resize).
const FAKE_WIDGET = `window.Calendly = { initInlineWidget: function (o) {
  var f = document.createElement('iframe');
  f.title = 'calendly'; f.src = 'about:blank'; f.dataset.url = o.url;
  f.width = '100%'; f.height = '100%'; f.setAttribute('frameborder', '0');
  f.dataset.prefill = JSON.stringify(o.prefill || null);
  o.parentElement.appendChild(f);
} };`;

async function track(page: Page, handler: 'abort' | 'fake' | 'inert') {
  const requests: string[] = [];
  await page.route(CALENDLY, async (route) => {
    requests.push(route.request().url());
    if (handler === 'abort') return route.abort();
    const body =
      handler === 'fake' ? FAKE_WIDGET : 'window.Calendly = { initInlineWidget: function () {} };';
    return route.fulfill({ contentType: 'text/javascript', body });
  });
  return requests;
}

test('no request to Calendly before the click; the widget loads in place after it', async ({
  page,
}) => {
  const requests = await track(page, 'fake');
  await page.goto('es/');
  await page.locator('#agenda').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
  expect(requests).toEqual([]);
  await expect(page.locator('[data-schedule-preview]')).toContainText(esForm['schedule.notice']);

  await page.getByRole('button', { name: esForm['schedule.open'] }).click();
  const iframe = page.locator('[data-schedule-container] iframe');
  await expect(iframe).toHaveCount(1);
  await expect(iframe).toHaveAttribute('data-url', 'https://calendly.com/rcasanas/1hr');
  // UX §3: the widget is at least 700 px tall on desktop and 1000 px below 768 px.
  const width = page.viewportSize()!.width;
  const height = (await iframe.boundingBox())!.height;
  expect(height).toBeGreaterThanOrEqual(width < 768 ? 1000 : 700);
  await expect(page.locator('#agenda-title')).toBeFocused();
  await expect(page.locator('[data-schedule-preview]')).toBeHidden();
  await expect(page.locator('[data-schedule-loading]')).toBeHidden();
  expect(requests).toEqual(['https://assets.calendly.com/assets/external/widget.js']);
});

test('Calendly blocked: the fallback link opens Calendly in a new tab', async ({ page }) => {
  await track(page, 'abort');
  await page.goto('es/');
  await page.getByRole('button', { name: esForm['schedule.open'] }).click();
  const link = page.locator('[data-schedule-fallback] a');
  await expect(link).toBeVisible();
  await expect(link).toHaveText(esForm['schedule.fallback']);
  await expect(link).toHaveAttribute('href', 'https://calendly.com/rcasanas/1hr');
  await expect(link).toHaveAttribute('target', '_blank');
});

test('nothing rendered within 10 s: the fallback link appears', async ({ page }) => {
  await page.clock.install();
  await track(page, 'inert');
  await page.goto('es/');
  await page.getByRole('button', { name: esForm['schedule.open'] }).click();
  const fallback = page.locator('[data-schedule-fallback]');
  await page.clock.runFor(9_000);
  await expect(fallback).toBeHidden();
  await page.clock.runFor(1_000);
  await expect(fallback).toBeVisible();
});

test('a <noscript> link to Calendly always exists', async ({ page }) => {
  await page.goto('en/');
  const html = await page.locator('[data-schedule-preview] noscript').innerHTML();
  expect(html).toContain('href="https://calendly.com/rcasanas/1hr"');
  expect(html).toContain('target="_blank"');
});

for (const [lang, t] of [
  ['es', esForm],
  ['en', enForm],
] as const) {
  test(`/${lang}/ the notice links to the privacy notice without loading Calendly`, async ({
    page,
  }) => {
    const requests = await track(page, 'fake');
    await page.goto(`${lang}/`);
    const notice = page.locator('[data-schedule-notice]');
    await expect(notice).toHaveText(t['schedule.notice']);
    const link = notice.locator('a[data-privacy-open]');
    await expect(link).toHaveText(lang === 'es' ? 'aviso de privacidad' : 'privacy notice');
    await link.click();
    const dialog = page.getByRole('dialog', { name: t['privacy.title'] });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
    await expect(page.locator('[data-schedule-preview]')).toBeVisible();
    expect(requests).toEqual([]);
  });
}
