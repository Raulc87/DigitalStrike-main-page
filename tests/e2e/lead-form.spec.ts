import { expect, test } from '@playwright/test';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';

// US-009 AC1/AC2/AC7 and US-014 AC1 structure on the built page. The submission flow against the
// mock endpoint is covered by the integration suite (DS-009-integration-e2e).

const dictionaries = { es: esForm, en: enForm } as const;

for (const lang of ['es', 'en'] as const) {
  const t = dictionaries[lang];

  test(`/${lang}/ lead form: fields, order, labels and autofill hints`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    const form = page.locator('form[data-lead-form]');
    await expect(page.locator('#lead-title')).toHaveText(t['form.title']);

    const names = await form
      .locator('input, select, textarea')
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name));
    expect(names).toEqual([
      'name',
      'email',
      'phone',
      'company',
      'project_type',
      'budget_range',
      'timeline',
      'message',
      'consent',
    ]);

    const expected = {
      name: { type: 'text', autocomplete: 'name', label: t['form.name.label'] },
      email: { type: 'email', autocomplete: 'email', label: t['form.email.label'] },
      phone: { type: 'tel', autocomplete: 'tel', label: t['form.phone.label'] },
      company: { type: 'text', autocomplete: 'organization', label: t['form.company.label'] },
    };
    for (const [name, spec] of Object.entries(expected)) {
      const input = form.locator(`input[name="${name}"]`);
      await expect(input).toHaveAttribute('type', spec.type);
      await expect(input).toHaveAttribute('autocomplete', spec.autocomplete);
      await expect(page.getByLabel(spec.label, { exact: true })).toHaveCount(1);
    }
    for (const name of ['project_type', 'budget_range', 'timeline']) {
      await expect(form.locator(`select[name="${name}"]`)).toHaveAttribute('autocomplete', 'off');
    }
    await expect(form.locator('textarea[name="message"]')).toHaveAttribute('autocomplete', 'off');
    const consent = form.locator('input[name="consent"]');
    await expect(consent).not.toBeChecked();
    expect(await consent.getAttribute('autocomplete')).toBeNull();

    const projectTypes = await form.locator('select[name="project_type"] option').allTextContents();
    expect(projectTypes.map((s) => s.trim())).toEqual([
      t['form.select_placeholder'],
      t['form.project_type.website'],
      t['form.project_type.web_app'],
      t['form.project_type.business_system'],
      t['form.project_type.custom_solution'],
      t['form.project_type.not_sure'],
    ]);
    await expect(page.getByText(t['form.budget_range.hint'])).toBeVisible();
    await expect(page.getByText(t['form.message.hint'])).toBeVisible();
    await expect(form.locator('button[type="submit"]')).toHaveText(t['form.submit']);
  });

  test(`/${lang}/ honeypot is isolated from autofill (UX §3)`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    const hp = page.locator('#lead-hp');
    await expect(hp).toHaveCount(1);
    // Not inside the lead form; in its own form without a submit button.
    await expect(page.locator('form[data-lead-form] #lead-hp')).toHaveCount(0);
    const hpForm = page.locator('form:has(#lead-hp)');
    await expect(hpForm).toHaveCount(1);
    await expect(hpForm.locator('button, input[type="submit"]')).toHaveCount(0);
    await expect(hp).toHaveAttribute('type', 'text');
    await expect(hp).toHaveAttribute('name', 'hp_field');
    await expect(hp).toHaveAttribute('tabindex', '-1');
    await expect(hp).toHaveAttribute('autocomplete', 'off');
    await expect(hp).toHaveAttribute('data-1p-ignore', '');
    await expect(hp).toHaveAttribute('data-lpignore', 'true');
    await expect(hp).toHaveAttribute('data-bwignore', 'true');
    await expect(hp).toHaveAttribute('data-form-type', 'other');
    for (const attr of ['placeholder', 'title']) expect(await hp.getAttribute(attr)).toBeNull();
    await expect(page.locator('label[for="lead-hp"]')).toHaveCount(0);
    const words = /website|url|homepage|company|name|email|phone|tel|address|city/i;
    expect((await hp.getAttribute('id')) ?? '').not.toMatch(words);
    expect((await hp.getAttribute('name'))?.replace(/^hp_field$/, '')).toBe('');
    await expect(page.locator('[aria-hidden="true"]:has(#lead-hp)')).toHaveCount(1);
    // Off-screen, not display:none.
    const box = await hp.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { right: r.right, display: getComputedStyle(el).display };
    });
    expect(box.display).not.toBe('none');
    expect(box.right).toBeLessThan(0);
    // Enter in it never reloads the page.
    const url = page.url();
    await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
    await hp.focus();
    await page.keyboard.type('x');
    await page.keyboard.press('Enter');
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
  });

  test(`/${lang}/ submit with errors focuses the summary and keeps typed data`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST') requests.push(r.url());
    });
    const form = page.locator('form[data-lead-form]');
    await form.locator('input[name="name"]').fill('Ana');
    await form.locator('input[name="email"]').fill('ana@');
    await form.locator('button[type="submit"]').click();
    const summary = page.locator('[data-lead-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText(t['form.error_summary']);
    await expect(page.locator('#lead-email-error')).toHaveText(
      t['form.error.invalid_format.email'],
    );
    await expect(form.locator('input[name="email"]')).toHaveAttribute(
      'aria-describedby',
      'lead-email-error',
    );
    await expect(page.locator('#lead-consent-error')).toHaveText(t['form.error.must_be_true']);
    await expect(form.locator('input[name="name"]')).toHaveValue('Ana');
    expect(requests).toEqual([]);
  });

  test(`/${lang}/ errors show on blur`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    const phone = page.locator('input[name="phone"]');
    await phone.fill('12');
    await phone.blur();
    await expect(page.locator('#lead-phone-error')).toHaveText(
      t['form.error.invalid_format.phone'],
    );
    await phone.fill('+506 8888 0000');
    await expect(page.locator('#lead-phone-error')).toBeHidden();
  });
}

test('?tipo=<code> preselects the project type', async ({ page }) => {
  await page.goto('/es/?tipo=business_system#contacto');
  await expect(page.locator('select[name="project_type"]')).toHaveValue('business_system');
});
