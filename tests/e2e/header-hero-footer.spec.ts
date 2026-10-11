import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const widths = [360, 390, 768, 1024, 1440];

for (const lang of ['es', 'en'] as const) {
  test.describe(`/${lang}/ header, hero, value strip, footer`, () => {
    test('no horizontal scroll at the five widths', async ({ page }) => {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${lang}/`);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${width}px`).toBe(false);
      }
    });

    test('hero shows eyebrow, title, subtitle, slogan and both CTAs', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const hero = page.locator('#inicio');
      await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(hero.locator('h1 em')).toHaveCount(1);
      await expect(hero.locator('a[href="#contacto"]')).toBeVisible();
      await expect(hero.locator('a[href="#agenda"]')).toBeVisible();
      await expect(page.locator('section.bg-steel li')).toHaveCount(3);
    });

    test('footer links', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const footer = page.locator('footer');
      await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
      const linkedin = footer.locator('a[target="_blank"]');
      await expect(linkedin).toHaveAttribute('rel', 'noopener');
      await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
      await expect(
        footer.locator(`a[href$="/${lang === 'es' ? 'es/privacidad' : 'en/privacy'}/"]`),
      ).toBeVisible();
    });

    test('axe: no WCAG A/AA violations', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
    });
  });
}

test.describe('navigation layout', () => {
  test('inline nav at 1200 px, menu button below', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/es/');
    await expect(page.getByRole('link', { name: 'Servicios' })).toBeVisible();
    await expect(page.locator('[data-menu-button]')).toBeHidden();
    await expect(
      page.locator('header').getByRole('link', { name: 'Agenda tu sesión 0' }),
    ).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(page.getByRole('link', { name: 'Servicios' })).toBeHidden();
    await expect(page.locator('[data-menu-button]')).toBeVisible();
  });

  test('mobile menu: opens, traps focus, closes on Esc and on link click', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/es/');
    const button = page.locator('[data-menu-button]');
    const menu = page.locator('#site-menu');
    await expect(menu).toBeHidden();
    // the inline header CTA is not shown below 1200 px (it lives in the menu)
    await expect(
      page.locator('header > div > div').getByRole('link', { name: 'Agenda tu sesión 0' }),
    ).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveAttribute('aria-label', 'Cerrar menú');
    await expect(menu).toBeVisible();

    // Tab never leaves the header while the menu is open
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('header'))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('header'))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await menu.getByRole('link', { name: 'Servicios' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#servicios$/);
  });

  test('touch targets are at least 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/en/');
    await page.locator('[data-menu-button]').click();
    const targets = page.locator('header a:visible, header button:visible, footer a:visible');
    const count = await targets.count();
    for (let i = 0; i < count; i++) {
      const box = await targets.nth(i).boundingBox();
      expect(box?.height, await targets.nth(i).innerText()).toBeGreaterThanOrEqual(43.5);
    }
  });
});
