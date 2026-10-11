// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initLeadForm } from '../../src/lib/lead/form-controller';
import type { LeadFormDeps } from '../../src/lib/lead/form-controller';
import { LEAD_SUBMITTED_EVENT, PRESELECT_EVENT } from '../../src/lib/lead/events';
import { esForm } from '../../src/i18n/es/form';
import { enForm } from '../../src/i18n/en/form';

// Same data-* hooks as src/components/lead/LeadForm.astro (structure itself is checked in e2e).
function fixture(lang: 'es' | 'en' = 'es') {
  const field = (name: string, control: string) => `
    <label for="lead-${name}" data-lead-label="${name}">${name} *</label>${control}
    <p id="lead-${name}-error" data-lead-error="${name}" hidden></p>`;
  document.body.innerHTML = `
  <div data-lead-root data-lang="${lang}">
    <div data-lead-form-view>
      <form data-lead-form novalidate>
        <div data-lead-error-summary tabindex="-1" hidden><ul data-lead-error-list></ul></div>
        ${field('name', '<input id="lead-name" name="name">')}
        ${field('email', '<input id="lead-email" name="email" type="email">')}
        ${field('phone', '<input id="lead-phone" name="phone" data-hint-id="lead-phone-hint" aria-describedby="lead-phone-hint"><p id="lead-phone-hint">hint</p>')}
        ${field('company', '<input id="lead-company" name="company">')}
        ${field('project_type', '<select id="lead-project-type" name="project_type"><option value="">-</option><option value="website">w</option><option value="web_app">a</option><option value="business_system">b</option></select>')}
        ${field('budget_range', '<select id="lead-budget-range" name="budget_range"><option value="">-</option><option value="under_1000">u</option></select>')}
        ${field('timeline', '<select id="lead-timeline" name="timeline"><option value="">-</option><option value="asap">a</option></select>')}
        ${field('message', '<textarea id="lead-message" name="message"></textarea>')}
        ${field('consent', '<input id="lead-consent" name="consent" type="checkbox">')}
        <div data-lead-status role="alert" hidden></div>
        <button type="submit" data-lead-submit>x</button>
      </form>
      <div aria-hidden="true"><form data-lead-hp-form><input id="lead-hp" name="hp_field" data-lead-hp></form></div>
    </div>
    <div data-lead-success hidden><h2 data-lead-success-title tabindex="-1"></h2></div>
  </div>`;
  return document.querySelector<HTMLElement>('[data-lead-root]')!;
}

const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;

function type(selector: string, value: string) {
  const el = $<HTMLInputElement>(selector);
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function choose(selector: string, value: string) {
  const el = $<HTMLSelectElement>(selector);
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillValid() {
  type('#lead-name', 'Ana María Pérez');
  type('#lead-email', 'Ana@Example.com');
  type('#lead-phone', '+506 8888 0000');
  choose('#lead-project-type', 'web_app');
  choose('#lead-budget-range', 'under_1000');
  choose('#lead-timeline', 'asap');
  type('#lead-message', 'Quiero un catálogo en línea con pedidos.');
  const consent = $<HTMLInputElement>('#lead-consent');
  consent.checked = true;
  consent.dispatchEvent(new Event('change', { bubbles: true }));
}

const submit = () => $<HTMLFormElement>('[data-lead-form]').requestSubmit();
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

type Body = Record<string, unknown>;

function setup(
  responses: Array<string | Error>,
  deps: Partial<LeadFormDeps> = {},
  lang: 'es' | 'en' = 'es',
) {
  const bodies: Body[] = [];
  const fetchImpl = vi.fn<typeof fetch>(async (_url, init) => {
    bodies.push(JSON.parse(init!.body as string) as Body);
    const next = responses.shift() ?? '{"ok":true,"lead_id":"DS-1"}';
    if (next instanceof Error) throw next;
    return new Response(next);
  });
  let clock = 1000;
  let n = 0;
  initLeadForm(fixture(lang), {
    endpoint: 'http://127.0.0.1:8787/exec',
    privacyVersion: '2026-10-14-v1',
    email: 'manager@digitalstrike-solutions.com',
    now: () => clock,
    newId: () => `00000000-0000-4000-8000-00000000000${++n}`,
    submit: { fetchImpl },
    ...deps,
  });
  return { bodies, fetchImpl, advance: (ms: number) => (clock += ms) };
}

beforeEach(() => {
  history.replaceState(null, '', '/es/');
});

describe('client validation (US-009 AC2)', () => {
  it('on submit shows every error, links them and focuses the summary; nothing is sent', async () => {
    const { fetchImpl } = setup([]);
    submit();
    await flush();
    expect(fetchImpl).not.toHaveBeenCalled();
    const summary = $('[data-lead-error-summary]');
    expect(summary.hidden).toBe(false);
    expect(document.activeElement).toBe(summary);
    expect(summary.querySelectorAll('li')).toHaveLength(7); // phone and company are optional
    expect(summary.querySelector('a')!.textContent).toBe(`name: ${esForm['form.error.required']}`);
    expect($('#lead-name-error').textContent).toBe(esForm['form.error.required']);
    expect($('#lead-name').getAttribute('aria-invalid')).toBe('true');
    expect($('#lead-name').getAttribute('aria-describedby')).toBe('lead-name-error');
    expect($('#lead-consent-error').textContent).toBe(esForm['form.error.must_be_true']);
    expect($('#lead-message-error').textContent).toBe(esForm['form.error.required']);
  });

  it('validates on blur with field-specific copy, keeping the hint described', async () => {
    setup([]);
    type('#lead-phone', '12');
    $('#lead-phone').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect($('#lead-phone-error').textContent).toBe(esForm['form.error.invalid_format.phone']);
    expect($('#lead-phone').getAttribute('aria-describedby')).toBe(
      'lead-phone-hint lead-phone-error',
    );
    type('#lead-phone', '+506 8888 0000');
    expect($('#lead-phone-error').hidden).toBe(true);
    expect($('#lead-phone').getAttribute('aria-describedby')).toBe('lead-phone-hint');
  });

  it('does not flag untouched fields on blur', () => {
    setup([]);
    $('#lead-name').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect($('#lead-name-error').hidden).toBe(true);
  });
});

describe('submission (US-009 AC3–AC6, US-014 AC1)', () => {
  it('sends the §3 body and shows the thank-you block with the first name', async () => {
    const { bodies, advance } = setup(['{"ok":true,"lead_id":"DS-20261014-K7Q2XM"}']);
    const submitted = vi.fn();
    window.addEventListener(LEAD_SUBMITTED_EVENT, submitted);
    fillValid();
    advance(48_250.4);
    submit();
    await flush();
    expect(bodies).toEqual([
      {
        name: 'Ana María Pérez',
        email: 'ana@example.com',
        phone: '+50688880000',
        company: '',
        project_type: 'web_app',
        budget_range: 'under_1000',
        timeline: 'asap',
        message: 'Quiero un catálogo en línea con pedidos.',
        language: 'es',
        consent: true,
        privacy_notice_version: '2026-10-14-v1',
        submission_id: '00000000-0000-4000-8000-000000000001',
        website: '',
        elapsed_ms: 48250,
      },
    ]);
    expect($('[data-lead-form-view]').hidden).toBe(true);
    expect($('[data-lead-success]').hidden).toBe(false);
    const title = $('[data-lead-success-title]');
    expect(title.textContent).toBe('¡Recibido, Ana!');
    expect(document.activeElement).toBe(title);
    expect(submitted).toHaveBeenCalledTimes(1);
    expect((submitted.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'Ana María Pérez',
      email: 'ana@example.com',
    });
    window.removeEventListener(LEAD_SUBMITTED_EVENT, submitted);
  });

  it('sends the honeypot value as `website`', async () => {
    const { bodies } = setup([]);
    fillValid();
    $<HTMLInputElement>('#lead-hp').value = 'spam';
    submit();
    await flush();
    expect(bodies[0]!.website).toBe('spam');
  });

  it('the honeypot form never submits', () => {
    setup([]);
    const event = new Event('submit', { cancelable: true });
    $('[data-lead-hp-form]').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('disables submit with "Enviando…" while pending; a second submit sends nothing', async () => {
    let release: (r: Response) => void = () => {};
    const fetchImpl = vi.fn<typeof fetch>(
      () => new Promise<Response>((resolve) => (release = resolve)),
    );
    setup([], { submit: { fetchImpl } });
    fillValid();
    submit();
    const button = $<HTMLButtonElement>('[data-lead-submit]');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe(esForm['form.submitting']);
    submit();
    $<HTMLFormElement>('[data-lead-form]').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    release(new Response('{"ok":false,"error_code":"internal_error"}'));
    await flush();
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe(esForm['form.submit']);
  });
});

describe('errors keep data and submission_id (US-009 AC4, contract §5.4)', () => {
  it.each([
    ['storage_unavailable', '{"ok":false,"error_code":"storage_unavailable","message":"x"}'],
    ['internal_error', '{"ok":false,"error_code":"internal_error","message":"x"}'],
    ['invalid_json', '{"ok":false,"error_code":"invalid_json","message":"x"}'],
    ['payload_too_large', '{"ok":false,"error_code":"payload_too_large","message":"x"}'],
    ['malformed body', '<html>'],
    ['network failure', new TypeError('Failed to fetch')],
  ])('%s → generic message with mailto; an unchanged retry reuses the id', async (_n, response) => {
    const { bodies } = setup([response]);
    fillValid();
    submit();
    await flush();
    const status = $('[data-lead-status]');
    expect(status.hidden).toBe(false);
    expect(status.textContent).toBe(
      esForm['form.error.generic'].replace('{email}', 'manager@digitalstrike-solutions.com'),
    );
    expect(status.querySelector('a')!.getAttribute('href')).toBe(
      'mailto:manager@digitalstrike-solutions.com',
    );
    expect($<HTMLInputElement>('#lead-name').value).toBe('Ana María Pérez');
    submit();
    await flush();
    expect(bodies).toHaveLength(2);
    expect(bodies[1]!.submission_id).toBe(bodies[0]!.submission_id);
    expect(status.hidden).toBe(true);
    expect($('[data-lead-success]').hidden).toBe(false);
  });

  it('rate_limited → its own message; data kept', async () => {
    setup(['{"ok":false,"error_code":"rate_limited","message":"x","retry_after_seconds":60}']);
    fillValid();
    submit();
    await flush();
    expect($('[data-lead-status]').textContent).toBe(
      esForm['form.error.rate_limited'].replace('{email}', 'manager@digitalstrike-solutions.com'),
    );
    expect($<HTMLTextAreaElement>('#lead-message').value).toContain('catálogo');
  });

  it('server validation_failed → field messages and focused summary', async () => {
    setup([
      '{"ok":false,"error_code":"validation_failed","message":"x","field_errors":{"email":"invalid_format"}}',
    ]);
    fillValid();
    submit();
    await flush();
    expect($('#lead-email-error').textContent).toBe(esForm['form.error.invalid_format.email']);
    expect(document.activeElement).toBe($('[data-lead-error-summary]'));
    expect($('[data-lead-status]').hidden).toBe(true);
  });

  it('server validation_failed on a non-visible field → generic message', async () => {
    setup([
      '{"ok":false,"error_code":"validation_failed","message":"x","field_errors":{"privacy_notice_version":"invalid_option"}}',
    ]);
    fillValid();
    submit();
    await flush();
    expect($('[data-lead-status]').textContent).toContain('No pudimos enviar tu mensaje.');
  });

  it('editing any field after a failed attempt sends a new submission_id', async () => {
    const { bodies } = setup(['{"ok":false,"error_code":"storage_unavailable"}']);
    fillValid();
    submit();
    await flush();
    type('#lead-company', 'Panadería');
    submit();
    await flush();
    expect(bodies[1]!.submission_id).not.toBe(bodies[0]!.submission_id);
    expect(bodies[1]!.company).toBe('Panadería');
  });

  it('a success renews the id for the next lead', async () => {
    const { bodies } = setup([]);
    fillValid();
    submit();
    await flush();
    // Same tab, a second lead (e.g. the view is restored by a test): it must not reuse the id.
    $('[data-lead-form-view]').hidden = false;
    submit();
    await flush();
    expect(bodies[1]!.submission_id).not.toBe(bodies[0]!.submission_id);
  });

  it('without an endpoint, submitting shows the generic error and sends nothing', async () => {
    const { fetchImpl } = setup([], { endpoint: '' });
    fillValid();
    submit();
    await flush();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect($('[data-lead-status]').textContent).toContain('No pudimos enviar tu mensaje.');
  });
});

describe('English', () => {
  it('uses the EN copy and sends language "en"', async () => {
    const { bodies } = setup([], {}, 'en');
    fillValid();
    submit();
    await flush();
    expect(bodies[0]!.language).toBe('en');
    expect($('[data-lead-success-title]').textContent).toBe('Got it, Ana!');
    expect(enForm['form.success.title']).toBe('Got it, {first_name}!');
  });
});

describe('project_type preselection (DS-004)', () => {
  it('reads ?tipo=<code> on load and ignores unknown codes', () => {
    history.replaceState(null, '', '/es/?tipo=business_system#contacto');
    setup([]);
    expect($<HTMLSelectElement>('#lead-project-type').value).toBe('business_system');
    history.replaceState(null, '', '/es/?tipo=hack');
    setup([]);
    expect($<HTMLSelectElement>('#lead-project-type').value).toBe('');
  });

  it('listens for the ds:preselect-project-type window event', () => {
    setup([]);
    window.dispatchEvent(new CustomEvent(PRESELECT_EVENT, { detail: { code: 'website' } }));
    expect($<HTMLSelectElement>('#lead-project-type').value).toBe('website');
    window.dispatchEvent(new CustomEvent(PRESELECT_EVENT, { detail: { code: 'nope' } }));
    expect($<HTMLSelectElement>('#lead-project-type').value).toBe('website');
  });
});
