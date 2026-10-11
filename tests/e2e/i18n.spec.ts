import { expect, test } from '@playwright/test';

test.describe('root detection (US-002 AC1)', () => {
  test.describe('es-CR browser', () => {
    test.use({ locale: 'es-CR' });
    test('/ goes to /es/', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/es\/$/);
    });
    test('saved ds_lang=en wins', async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('ds_lang', 'en'));
      await page.goto('/');
      await expect(page).toHaveURL(/\/en\/$/);
    });
  });

  test.describe('en-US browser', () => {
    test.use({ locale: 'en-US' });
    test('/ goes to /en/', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/en\/$/);
    });
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('/ shows links to both languages', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('a[hreflang="es"]')).toBeVisible();
      await expect(page.locator('a[hreflang="en"]')).toBeVisible();
    });
  });
});

test.describe('toggle (US-002 AC2)', () => {
  test('is visible, keeps the section and saves ds_lang', async ({ page }) => {
    await page.goto('/es/#servicios');
    const toggle = page.getByRole('navigation', { name: 'Cambiar idioma' });
    await expect(toggle).toBeVisible();
    await expect(toggle.locator('[aria-current="true"]')).toHaveText('ES');
    const box = await toggle.getByRole('link', { name: 'EN' }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
    await toggle.getByRole('link', { name: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\/#servicios$/);
    expect(await page.evaluate(() => localStorage.getItem('ds_lang'))).toBe('en');
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('keeps the section the visitor scrolled to even without a hash (AC2)', async ({ page }) => {
    await page.goto('/es/');
    // make sure the page is long enough to scroll the section to the top of the viewport
    await page.evaluate(() => {
      document.body.style.paddingBottom = '3000px';
      document.getElementById('proyectos')?.scrollIntoView({ behavior: 'instant' });
    });
    expect(await page.evaluate(() => location.hash)).toBe('');
    // A real mouse click: locator.click() would scroll the sticky header link into view first.
    const box = await page
      .getByRole('navigation', { name: 'Cambiar idioma' })
      .getByRole('link', { name: 'EN' })
      .boundingBox();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page).toHaveURL(/\/en\/#proyectos$/);
  });

  test('at the top of the page the toggle goes to the plain page', async ({ page }) => {
    await page.goto('/es/');
    await page
      .getByRole('navigation', { name: 'Cambiar idioma' })
      .getByRole('link', { name: 'EN' })
      .click();
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('privacy pages link to each other', async ({ page }) => {
    await page.goto('/es/privacidad/');
    await page
      .getByRole('navigation', { name: 'Cambiar idioma' })
      .getByRole('link', { name: 'EN' })
      .click();
    await expect(page).toHaveURL(/\/en\/privacy\/$/);
  });
});

test.describe('SEO (US-002 AC3, AC4)', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`/${lang}/ head tags`, async ({ page }) => {
      await page.goto(`/${lang}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      expect(await page.title()).toContain('DigitalStrike Solutions');
      const href = (sel: string) => page.locator(sel).getAttribute('href');
      expect(await href('link[rel=canonical]')).toMatch(new RegExp(`/${lang}/$`));
      expect(await href('link[hreflang=es]')).toMatch(/\/es\/$/);
      expect(await href('link[hreflang=en]')).toMatch(/\/en\/$/);
      expect(await href('link[hreflang=x-default]')).toMatch(/\/$/);
      const og = (p: string) => page.locator(`meta[property="og:${p}"]`).getAttribute('content');
      expect(await og('image')).toMatch(/og-image\.png$/);
      expect(await og('image:width')).toBe('1200');
      expect(await og('image:height')).toBe('630');
      expect(await og('title')).toBe(await page.title());
    });
  }

  test('titles and descriptions differ per language', async ({ page }) => {
    await page.goto('/es/');
    const es = [
      await page.title(),
      await page.locator('meta[name=description]').getAttribute('content'),
    ];
    await page.goto('/en/');
    const en = [
      await page.title(),
      await page.locator('meta[name=description]').getAttribute('content'),
    ];
    expect(es[0]).not.toBe(en[0]);
    expect(es[1]).not.toBe(en[1]);
  });

  test('og-image, sitemap and robots are served', async ({ request }) => {
    const img = await request.get('/og-image.png');
    expect(img.ok()).toBe(true);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('/es/</loc>');
    expect(sitemap).toContain('/en/</loc>');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap:');
  });
});
