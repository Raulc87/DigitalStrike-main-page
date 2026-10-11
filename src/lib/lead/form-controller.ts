// Browser controller of the lead form (US-009, US-014 AC1, UX §3). Wires the markup rendered by
// src/components/lead/LeadForm.astro to validation, the API client and the submission_id tracker.
import { contactEmail } from '../i18n/site';
import type { Locale } from '../../i18n';
import { submitLead } from './client';
import type { SubmitOptions, SubmitResult } from './client';
import { leadEndpointUrl, privacyNoticeVersion } from './config';
import { LEAD_SUBMITTED_EVENT, PRESELECT_EVENT, PRESELECT_QUERY_PARAM } from './events';
import type { LeadSubmittedDetail } from './events';
import { fieldErrorMessage, formT } from './messages';
import { SubmissionIdTracker } from './submission';
import type { IdFactory } from './submission';
import { LIMITS, PROJECT_TYPES, VISIBLE_FIELDS, isOneOf } from './types';
import type { FieldErrorCode, LeadFormValues, VisibleField } from './types';
import { buildPayload, firstName, validateField, validateForm } from './validation';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export interface LeadFormDeps {
  endpoint?: string;
  privacyVersion?: string;
  email?: string;
  now?: () => number;
  newId?: IdFactory;
  submit?: SubmitOptions;
}

function isVisibleField(name: string): name is VisibleField {
  return (VISIBLE_FIELDS as readonly string[]).includes(name);
}

/** Puts `text` into `el`, turning `{email}` into a mailto link. */
function renderWithEmail(el: HTMLElement, text: string, email: string): void {
  el.replaceChildren();
  const [before, ...rest] = text.split('{email}');
  el.append(before ?? '');
  if (rest.length > 0) {
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.className = 'underline underline-offset-4';
    link.textContent = email;
    el.append(link, rest.join('{email}'));
  }
}

export function initLeadForm(root: HTMLElement, deps: LeadFormDeps = {}): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'es') as Locale;
  const endpoint = deps.endpoint ?? leadEndpointUrl;
  const version = deps.privacyVersion ?? privacyNoticeVersion;
  const email = deps.email ?? contactEmail;
  const now = deps.now ?? (() => performance.now());
  const startedAt = now();
  const tracker = new SubmissionIdTracker(deps.newId);

  const form = root.querySelector<HTMLFormElement>('[data-lead-form]');
  const formView = root.querySelector<HTMLElement>('[data-lead-form-view]');
  const successView = root.querySelector<HTMLElement>('[data-lead-success]');
  const successTitle = root.querySelector<HTMLElement>('[data-lead-success-title]');
  const summary = root.querySelector<HTMLElement>('[data-lead-error-summary]');
  const summaryList = root.querySelector<HTMLElement>('[data-lead-error-list]');
  const status = root.querySelector<HTMLElement>('[data-lead-status]');
  const submitButton = root.querySelector<HTMLButtonElement>('[data-lead-submit]');
  const honeypotForm = root.querySelector<HTMLFormElement>('[data-lead-hp-form]');
  const honeypot = root.querySelector<HTMLInputElement>('[data-lead-hp]');
  if (
    !form ||
    !formView ||
    !successView ||
    !successTitle ||
    !summary ||
    !summaryList ||
    !status ||
    !submitButton
  ) {
    return;
  }

  const control = (field: VisibleField) => form.elements.namedItem(field) as Control | null;
  const touched = new Set<VisibleField>();
  const shown = new Set<VisibleField>();
  let pending = false;

  // Honeypot: its own form, Enter never submits it (UX §3 "Autofill and honeypot").
  honeypotForm?.addEventListener('submit', (event) => event.preventDefault());

  function readValues(): LeadFormValues {
    const text = (field: VisibleField) => {
      const el = control(field);
      return el && !(el instanceof HTMLInputElement && el.type === 'checkbox') ? el.value : '';
    };
    const consent = control('consent');
    return {
      name: text('name'),
      email: text('email'),
      phone: text('phone'),
      company: text('company'),
      project_type: text('project_type'),
      budget_range: text('budget_range'),
      timeline: text('timeline'),
      message: text('message'),
      consent: consent instanceof HTMLInputElement ? consent.checked : false,
    };
  }

  function setFieldError(field: VisibleField, message: string | null): void {
    const el = control(field);
    const errorEl = root.querySelector<HTMLElement>(`[data-lead-error="${field}"]`);
    if (!el || !errorEl) return;
    const hintId = el.dataset.hintId;
    const describedBy = [hintId, message ? errorEl.id : undefined].filter(Boolean).join(' ');
    if (describedBy) el.setAttribute('aria-describedby', describedBy);
    else el.removeAttribute('aria-describedby');
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      el.setAttribute('aria-invalid', 'true');
      shown.add(field);
    } else {
      errorEl.textContent = '';
      errorEl.hidden = true;
      el.removeAttribute('aria-invalid');
      shown.delete(field);
    }
  }

  function showFieldResult(field: VisibleField): void {
    const result = validateField(field, readValues());
    setFieldError(field, result.ok ? null : fieldErrorMessage(lang, field, result.error));
  }

  function fieldLabel(field: VisibleField): string {
    const label = root.querySelector<HTMLElement>(`[data-lead-label="${field}"]`);
    return (label?.textContent ?? '').trim().replace(/\s*\*$/, '');
  }

  function showSummary(errors: Partial<Record<VisibleField, string>>): void {
    summaryList!.replaceChildren();
    for (const field of VISIBLE_FIELDS) {
      const message = errors[field];
      if (!message) continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      const el = control(field);
      link.href = `#${el?.id ?? ''}`;
      link.textContent = `${fieldLabel(field)}: ${message}`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        el?.focus();
      });
      item.append(link);
      summaryList!.append(item);
    }
    summary!.hidden = false;
    summary!.focus();
  }

  function hideSummary(): void {
    summary!.hidden = true;
    summaryList!.replaceChildren();
  }

  function setStatus(text: string | null): void {
    if (text === null) {
      status!.replaceChildren();
      status!.hidden = true;
      return;
    }
    status!.hidden = false;
    renderWithEmail(status!, text, email);
  }

  function setPending(value: boolean): void {
    pending = value;
    submitButton!.disabled = value;
    submitButton!.setAttribute('aria-busy', String(value));
    submitButton!.textContent = formT(lang, value ? 'form.submitting' : 'form.submit');
  }

  function preselect(code: unknown): void {
    if (!isOneOf(PROJECT_TYPES, code)) return;
    const select = control('project_type');
    if (!select || select.value === code) return;
    select.value = code;
    tracker.edited();
    if (shown.has('project_type')) showFieldResult('project_type');
  }

  // Validation on blur (fields the visitor interacted with) and live re-check of shown errors.
  const onEdit = (event: Event) => {
    const name = (event.target as Control | null)?.name ?? '';
    if (!isVisibleField(name)) return;
    tracker.edited();
    touched.add(name);
    if (shown.has(name)) showFieldResult(name);
  };
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  form.addEventListener('focusout', (event) => {
    const name = (event.target as Control | null)?.name ?? '';
    if (isVisibleField(name) && touched.has(name)) showFieldResult(name);
  });

  // Project type preselection from the service cards (DS-004): `?tipo=<code>` and the window event.
  preselect(new URLSearchParams(window.location.search).get(PRESELECT_QUERY_PARAM));
  window.addEventListener(PRESELECT_EVENT, (event) => {
    preselect((event as CustomEvent<{ code?: unknown }>).detail?.code);
  });

  function showSuccess(name: string, visitorEmail: string): void {
    tracker.succeeded();
    successTitle!.textContent = formT(lang, 'form.success.title', { first_name: firstName(name) });
    formView!.hidden = true;
    successView!.hidden = false;
    successTitle!.focus();
    const detail: LeadSubmittedDetail = { name, email: visitorEmail };
    window.dispatchEvent(new CustomEvent(LEAD_SUBMITTED_EVENT, { detail }));
  }

  function handleResult(result: SubmitResult, name: string, visitorEmail: string): void {
    switch (result.kind) {
      case 'success':
        showSuccess(name, visitorEmail);
        return;
      case 'validation_failed': {
        const messages: Partial<Record<VisibleField, string>> = {};
        let unmapped = false;
        for (const [field, code] of Object.entries(result.fieldErrors)) {
          const message = isVisibleField(field) ? fieldErrorMessage(lang, field, code) : null;
          if (isVisibleField(field) && message) {
            messages[field] = message;
            setFieldError(field, message);
          } else {
            unmapped = true;
          }
        }
        if (unmapped || Object.keys(messages).length === 0) {
          setStatus(formT(lang, 'form.error.generic'));
        }
        if (Object.keys(messages).length > 0) showSummary(messages);
        return;
      }
      case 'rate_limited':
        setStatus(formT(lang, 'form.error.rate_limited'));
        return;
      case 'error':
        setStatus(formT(lang, 'form.error.generic'));
        return;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    setStatus(null);

    const values = readValues();
    const errors = validateForm(values);
    const fields = Object.keys(errors) as VisibleField[];
    if (fields.length > 0) {
      const messages: Partial<Record<VisibleField, string>> = {};
      for (const field of VISIBLE_FIELDS) {
        const code: FieldErrorCode | undefined = errors[field];
        touched.add(field);
        const message = code ? fieldErrorMessage(lang, field, code) : null;
        setFieldError(field, message);
        if (message) messages[field] = message;
      }
      showSummary(messages);
      return;
    }
    for (const field of VISIBLE_FIELDS) setFieldError(field, null);
    hideSummary();

    if (!endpoint) {
      setStatus(formT(lang, 'form.error.generic'));
      return;
    }

    const elapsed = Math.min(Math.max(Math.round(now() - startedAt), 0), LIMITS.elapsedMsMax);
    const built = buildPayload(values, {
      language: lang,
      privacyNoticeVersion: version,
      submissionId: tracker.current,
      website: honeypot?.value ?? '',
      elapsedMs: elapsed,
    });
    if (!built.ok) {
      setStatus(formT(lang, 'form.error.generic'));
      return;
    }
    tracker.forAttempt();

    setPending(true);
    let result: SubmitResult;
    try {
      result = await submitLead(endpoint, built.payload, deps.submit);
    } finally {
      setPending(false);
    }
    handleResult(result, built.payload.name, built.payload.email);
  });
}
