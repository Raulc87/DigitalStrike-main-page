import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';

// US-018 AC1/AC2 and US-009 AC7: dialog from the form (keeps data, Esc closes, focus returns)
// and the standalone pages.

const cases = [
  { lang: 'es', page: '/es/privacidad/', t: esForm },
  { lang: 'en', page: '/en/privacy/', t: enForm },
] as const;

for (const { lang, page: path, t } of cases) {
  test(`/${lang}/ privacy dialog keeps form data, closes with Esc and returns focus`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const name = page.locator('form[data-lead-form] input[name="name"]');
    await name.fill('Ana María');
    const link = page.locator('[data-privacy-open]');
    await expect(link).toHaveText(t['form.consent.link']);
    const url = page.url();
    await link.click();

    const dialog = page.getByRole('dialog', { name: t['privacy.title'] });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-privacy-version]')).toHaveText(
      t['privacy.version'].replace('{version}', '2026-10-14-v1'),
    );
    await expect(dialog).toContainText(t['privacy.consent.title']);
    expect(page.url()).toBe(url);
    expect(page.context().pages()).toHaveLength(1);

    const axe = await new AxeBuilder({ page })
      .include('[data-privacy-dialog]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(axe.violations).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
    await expect(name).toHaveValue('Ana María');

    await link.click();
    await dialog.getByRole('button', { name: t['privacy.close'] }).click();
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
  });

  test(`${path} renders the notice with its version`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t['privacy.title']);
    await expect(page.locator('[data-privacy-version]')).toHaveText(
      t['privacy.version'].replace('{version}', '2026-10-14-v1'),
    );
    for (const section of [
      'controller',
      'data',
      'use',
      'storage',
      'retention',
      'rights',
    ] as const) {
      await expect(page.locator('main')).toContainText(t[`privacy.${section}.title`]);
    }
    await expect(page.locator('main a[href^="mailto:"]').first()).toHaveAttribute(
      'href',
      'mailto:manager@digitalstrike-solutions.com',
    );
  });
}
