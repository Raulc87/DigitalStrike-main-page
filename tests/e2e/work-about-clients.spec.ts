// OWNER: Agent 1 (site shell, content sections, i18n and SEO). The owner approved these e2e specs as
// Agent 1's files (2026-10-11), an exception to the SPRINT_001 ownership map. Agent 2's lead-form,
// scheduling and privacy flows have their own specs: do not duplicate the scope below.
// SCOPE: US-006/US-007/US-008: showroom, CEO section and photo fallback, clients placeholder.
import { expect, test } from '@playwright/test';

for (const lang of ['es', 'en'] as const) {
  test.describe(`/${lang}/ showroom, CEO, clients`, () => {
    test('showroom: three cards, two GitHub links, one private case study (US-006)', async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const cards = page.locator('[data-project-card]');
      await expect(cards).toHaveCount(3);
      const links = page.locator('#proyectos a');
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toHaveAttribute(
        'href',
        'https://github.com/Raulc87/gaby-main-page',
      );
      await expect(links.nth(1)).toHaveAttribute(
        'href',
        'https://github.com/Raulc87/cami-main-page',
      );
      for (const i of [0, 1]) {
        await expect(links.nth(i)).toHaveAttribute('target', '_blank');
        await expect(links.nth(i)).toHaveAttribute('rel', 'noopener');
        await expect(links.nth(i)).toHaveText(
          lang === 'es' ? 'Ver código en GitHub' : 'View code on GitHub',
        );
      }
      await expect(cards.nth(2).locator('a')).toHaveCount(0);
      await expect(cards.nth(2)).toContainText(
        lang === 'es' ? 'Caso de estudio · código privado' : 'Case study · private code',
      );
      await expect(cards.nth(2)).toContainText('Poliart Impresores');
      // real screenshots for the two public projects, the initials placeholder for the private one
      const shots = page.locator('[data-project-card] img');
      await expect(shots).toHaveCount(2);
      await expect(shots.nth(0)).toHaveAttribute('src', /images\/work\/gaby\.jpg$/);
      await expect(shots.nth(1)).toHaveAttribute('src', /images\/work\/cami\.jpg$/);
      for (const i of [0, 1]) {
        await shots.nth(i).scrollIntoViewIfNeeded();
        await expect
          .poll(() => shots.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth))
          .toBe(1200);
        const box = await shots.nth(i).boundingBox();
        expect(box!.width / box!.height).toBeCloseTo(1.6, 1);
      }
      await expect(page.locator('[data-initials]')).toHaveText(['PI']);
    });

    test('about: facts chips, LinkedIn button, photo at most 200 px (US-007)', async ({ page }) => {
      await page.goto(`/${lang}/`);
      await expect(page.locator('[data-facts] li')).toHaveCount(10);
      const linkedin = page.locator('#nosotros a[target="_blank"]');
      await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
      await expect(linkedin).toHaveAttribute('rel', 'noopener');
      const photo = page.locator('#nosotros img');
      await expect(photo).toHaveAttribute('src', /images\/raul-casanas\.jpg$/);
      await expect(photo).toHaveAttribute(
        'alt',
        lang === 'es'
          ? 'Raul Casañas, CEO de DigitalStrike Solutions'
          : 'Raul Casañas, CEO of DigitalStrike Solutions',
      );
      await expect
        .poll(async () => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBe(200);
      for (const width of [360, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect((await photo.boundingBox())?.width).toBeLessThanOrEqual(200);
      }
    });

    test('about: the RC monogram shows when the photo file is missing (US-007 AC2)', async ({
      page,
    }) => {
      await page.route('**/images/raul-casanas.jpg', (route) => route.fulfill({ status: 404 }));
      await page.goto(`/${lang}/`);
      await expect(page.locator('#nosotros img')).toHaveCount(0);
      await expect(page.locator('[data-monogram]')).toBeVisible();
      await expect(page.locator('[data-monogram]')).toHaveText('RC');
    });

    test('clients: four dashed slots with the slot text, no names (US-008 AC1)', async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const slots = page.locator('[data-client-slot]');
      await expect(slots).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(slots.nth(i)).toHaveText(
          lang === 'es'
            ? 'Este espacio está reservado para tu marca'
            : 'This space is reserved for your brand',
        );
      }
      await expect(page.locator('#clientes img')).toHaveCount(0);
    });
  });
}

test('clients grid is 2×2 on mobile and 4 in a row on desktop', async ({ page }) => {
  const perRow = async (width: number) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/es/');
    const tops = await page
      .locator('[data-client-slot]')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    return tops.filter((t) => t === tops[0]).length;
  };
  expect(await perRow(390)).toBe(2);
  expect(await perRow(1440)).toBe(4);
});

test('no pending badges by default (PUBLIC_SHOW_PENDING_BADGES unset)', async ({ page }) => {
  await page.goto('/es/');
  await expect(page.locator('[data-pending-badge]')).toHaveCount(0);
});
