// OWNER: Agent 1 (site shell, content sections, i18n and SEO). The owner approved these e2e specs as
// Agent 1's files (2026-10-11), an exception to the SPRINT_001 ownership map. Agent 2's lead-form,
// scheduling and privacy flows have their own specs: do not duplicate the scope below.
// SCOPE: every section anchor exists on /es/ and /en/, and the page has no horizontal scroll.
import { expect, test } from '@playwright/test';

const anchors = [
  'inicio',
  'servicios',
  'como-trabajamos',
  'proyectos',
  'nosotros',
  'contacto',
  'agenda',
];

for (const lang of ['es', 'en']) {
  test(`/${lang}/ has every section anchor and no horizontal scroll`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    for (const id of anchors) await expect(page.locator(`#${id}`)).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}
