import { expect, test } from '@playwright/test';

const codes = ['website', 'web_app', 'business_system', 'custom_solution', 'custom_solution'];

for (const lang of ['es', 'en'] as const) {
  test.describe(`/${lang}/ services and process`, () => {
    test('five cards, CTA text, note and no prices (US-004 AC1, AC3)', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const cards = page.locator('[data-service-card]');
      await expect(cards).toHaveCount(5);
      const cta = lang === 'es' ? 'Quiero algo así' : 'I want something like this';
      await expect(page.locator('#servicios').getByRole('link', { name: cta })).toHaveCount(5);
      const text = await page.locator('#servicios').innerText();
      expect(text).not.toMatch(/[$₡€]|US\$|USD|\b\d+\s?(dólares|dollars)/i);
      await expect(page.locator('#servicios > div > p').last()).toHaveText(
        lang === 'es'
          ? 'No publicamos precios fijos: te enviamos una propuesta clara después de entender lo que necesitas.'
          : "We don't publish fixed prices: you get a clear proposal once we understand what you need.",
      );
    });

    test('card CTA emits the event with the project_type and jumps to #contacto (AC2)', async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      await page.evaluate(() => {
        (window as unknown as { __events: unknown[] }).__events = [];
        window.addEventListener('ds:preselect-project-type', (e) =>
          (window as unknown as { __events: unknown[] }).__events.push((e as CustomEvent).detail),
        );
      });
      const links = page.locator('a[data-project-type]');
      await expect(links).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        await expect(links.nth(i)).toHaveAttribute(
          'href',
          new RegExp(`\\?tipo=${codes[i]}#contacto$`),
        );
      }
      await links.nth(1).click();
      await expect(page).toHaveURL(/\/#contacto$/);
      const events = await page.evaluate(
        () => (window as unknown as { __events: unknown[] }).__events,
      );
      expect(events).toEqual([{ code: 'web_app' }]);
    });

    test('keyboard: after activating a card CTA the next Tab continues after #contacto', async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      await page.locator('a[data-project-type="web_app"]').focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#contacto$/);
      await page.keyboard.press('Tab');
      const followsContact = await page.evaluate(() => {
        const contact = document.getElementById('contacto')!;
        const active = document.activeElement!;
        return (
          !active.matches('a[data-project-type]') &&
          (contact.contains(active) ||
            !!(contact.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING))
        );
      });
      expect(followsContact).toBe(true);
    });

    test('keyboard: same when the URL already ends in #contacto', async ({ page }) => {
      await page.goto(`/${lang}/#contacto`);
      // the visitor comes back up to the services and uses a card
      await page.evaluate(() => {
        document.body.style.paddingBottom = '3000px';
        document.getElementById('servicios')?.scrollIntoView({ behavior: 'instant' });
      });
      expect(await page.evaluate(() => location.hash)).toBe('#contacto');
      await page.locator('a[data-project-type="business_system"]').focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      const followsContact = await page.evaluate(() => {
        const contact = document.getElementById('contacto')!;
        const active = document.activeElement!;
        return (
          !active.matches('a[data-project-type]') &&
          (contact.contains(active) ||
            !!(contact.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING))
        );
      });
      expect(followsContact).toBe(true);
    });

    test.describe('without JavaScript', () => {
      test.use({ javaScriptEnabled: false });
      test('the CTA still jumps to the form with ?tipo=', async ({ page }) => {
        await page.goto(`/${lang}/`);
        await page.locator('a[data-project-type="business_system"]').click();
        await expect(page).toHaveURL(/\?tipo=business_system#contacto$/);
      });
    });

    test('grid columns: 1 / 2 / 3 by width', async ({ page }) => {
      const columns = async (width: number) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${lang}/`);
        const tops = await page
          .locator('[data-service-card]')
          .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
        return tops.filter((t) => t === tops[0]).length;
      };
      expect(await columns(390)).toBe(1);
      expect(await columns(768)).toBe(2);
      expect(await columns(1440)).toBe(3);
    });

    test('process: four steps 01-04, horizontal from 1024 px, vertical below (US-005 AC1)', async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const steps = page.locator('#como-trabajamos ol > li');
      await expect(steps).toHaveCount(4);
      await expect(page.locator('#como-trabajamos ol > li p').allInnerTexts()).resolves.toEqual(
        expect.arrayContaining(['01', '02', '03', '04']),
      );
      const tops = async () =>
        steps.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
      await page.setViewportSize({ width: 1024, height: 900 });
      expect(new Set(await tops()).size).toBe(1);
      await page.setViewportSize({ width: 768, height: 900 });
      expect(new Set(await tops()).size).toBe(4);
    });

    test('warranty text is exact and never mentions refunds (US-005 AC2)', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const warranty = page.locator('[data-warranty]');
      await expect(warranty.locator('h3')).toHaveText(
        lang === 'es'
          ? 'Garantía de 6 meses en todos los proyectos'
          : '6-month warranty on every project',
      );
      await expect(warranty.locator('p')).toHaveText(
        lang === 'es'
          ? 'Si aparece un error en lo que acordamos, lo corregimos sin costo durante los seis meses siguientes al lanzamiento.'
          : 'If a defect shows up in what we agreed on, we fix it at no cost for six months after launch.',
      );
      expect(await warranty.innerText()).not.toMatch(/reembols|devoluci|refund|money back/i);
    });
  });
}
