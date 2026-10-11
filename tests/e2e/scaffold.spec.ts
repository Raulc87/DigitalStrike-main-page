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
