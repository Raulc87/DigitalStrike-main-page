// Client validation of contract §3, with the same normalization as the server
// (apps-script/lib/validation.js), so a lead that passes here passes there.
import {
  BUDGET_RANGES,
  LANGUAGES,
  LIMITS,
  PROJECT_TYPES,
  TIMELINES,
  VISIBLE_FIELDS,
  isOneOf,
} from './types';
import type { FieldErrorCode, LeadFormValues, LeadPayload, VisibleField } from './types';

export const EMAIL_PATTERN =
  /^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,63}$/;
/** Unicode letters (with their combining marks), spaces, ' ’ - . only. */
export const NAME_PATTERN = /^[\p{L}\p{M} '’.-]+$/u;
export const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
export const SUBMISSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type FieldResult<T> = { ok: true; value: T } | { ok: false; error: FieldErrorCode };

const pass = <T>(value: T): FieldResult<T> => ({ ok: true, value });
const fail = <T>(error: FieldErrorCode): FieldResult<T> => ({ ok: false, error });

/** Trim and collapse inner whitespace (§3 `name`). */
export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function validateName(raw: string): FieldResult<string> {
  const name = normalizeName(raw);
  if (name === '') return fail('required');
  if (name.length < LIMITS.nameMin) return fail('too_short');
  if (name.length > LIMITS.nameMax) return fail('too_long');
  if (!NAME_PATTERN.test(name)) return fail('invalid_format');
  return pass(name);
}

export function validateEmail(raw: string): FieldResult<string> {
  const email = raw.trim().toLowerCase();
  if (email === '') return fail('required');
  if (email.length > LIMITS.emailMax) return fail('too_long');
  if (!EMAIL_PATTERN.test(email)) return fail('invalid_format');
  const local = email.slice(0, email.lastIndexOf('@'));
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return fail('invalid_format');
  }
  return pass(email);
}

/** Optional: empty → `""`; otherwise strip spaces, `-`, `(`, `)`, `.` and check the pattern. */
export function validatePhone(raw: string): FieldResult<string> {
  if (raw.trim() === '') return pass('');
  const phone = raw.replace(/[\s\-().]/g, '');
  if (!PHONE_PATTERN.test(phone)) return fail('invalid_format');
  return pass(phone);
}

export function validateCompany(raw: string): FieldResult<string> {
  const company = raw.trim();
  if (company.length > LIMITS.companyMax) return fail('too_long');
  return pass(company);
}

export function validateOption<T extends string>(list: readonly T[], raw: string): FieldResult<T> {
  if (raw === '') return fail('required');
  if (!isOneOf(list, raw)) return fail('invalid_option');
  return pass(raw);
}

export function validateMessage(raw: string): FieldResult<string> {
  const message = raw.trim();
  if (message === '') return fail('required');
  if (message.length < LIMITS.messageMin) return fail('too_short');
  if (message.length > LIMITS.messageMax) return fail('too_long');
  return pass(message);
}

export function validateConsent(checked: boolean): FieldResult<true> {
  return checked ? pass(true) : fail('must_be_true');
}

export function validateSubmissionId(raw: string): FieldResult<string> {
  if (raw === '') return fail('required');
  if (!SUBMISSION_ID_PATTERN.test(raw)) return fail('invalid_format');
  return pass(raw);
}

export function validateElapsedMs(raw: number): FieldResult<number> {
  if (!Number.isInteger(raw)) return fail('invalid_type');
  if (raw < 0 || raw > LIMITS.elapsedMsMax) return fail('invalid_format');
  return pass(raw);
}

/** Validates one visible field (used on blur). */
export function validateField(
  field: VisibleField,
  values: LeadFormValues,
): FieldResult<string | boolean> {
  switch (field) {
    case 'name':
      return validateName(values.name);
    case 'email':
      return validateEmail(values.email);
    case 'phone':
      return validatePhone(values.phone);
    case 'company':
      return validateCompany(values.company);
    case 'project_type':
      return validateOption(PROJECT_TYPES, values.project_type);
    case 'budget_range':
      return validateOption(BUDGET_RANGES, values.budget_range);
    case 'timeline':
      return validateOption(TIMELINES, values.timeline);
    case 'message':
      return validateMessage(values.message);
    case 'consent':
      return validateConsent(values.consent);
  }
}

export type FieldErrors = Partial<Record<VisibleField, FieldErrorCode>>;

/** Every visible field's error, in form order (empty object = valid). */
export function validateForm(values: LeadFormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of VISIBLE_FIELDS) {
    const result = validateField(field, values);
    if (!result.ok) errors[field] = result.error;
  }
  return errors;
}

export interface PayloadContext {
  language: string;
  privacyNoticeVersion: string;
  submissionId: string;
  website: string;
  elapsedMs: number;
}

export type BuildResult =
  | { ok: true; payload: LeadPayload }
  | { ok: false; fieldErrors: Partial<Record<keyof LeadPayload, FieldErrorCode>> };

/** Validates and normalizes everything into the §3 request body. */
export function buildPayload(values: LeadFormValues, ctx: PayloadContext): BuildResult {
  const checks = {
    name: validateName(values.name),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    company: validateCompany(values.company),
    project_type: validateOption(PROJECT_TYPES, values.project_type),
    budget_range: validateOption(BUDGET_RANGES, values.budget_range),
    timeline: validateOption(TIMELINES, values.timeline),
    message: validateMessage(values.message),
    language: validateOption(LANGUAGES, ctx.language),
    consent: validateConsent(values.consent),
    privacy_notice_version:
      ctx.privacyNoticeVersion.trim() === ''
        ? fail<string>('required')
        : pass(ctx.privacyNoticeVersion.trim()),
    submission_id: validateSubmissionId(ctx.submissionId),
    elapsed_ms: validateElapsedMs(ctx.elapsedMs),
  };
  const fieldErrors: Partial<Record<keyof LeadPayload, FieldErrorCode>> = {};
  for (const [field, result] of Object.entries(checks)) {
    if (!result.ok) fieldErrors[field as keyof LeadPayload] = result.error;
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const value = <T>(r: FieldResult<T>): T => (r as { ok: true; value: T }).value;
  return {
    ok: true,
    payload: {
      name: value(checks.name),
      email: value(checks.email),
      phone: value(checks.phone),
      company: value(checks.company),
      project_type: value(checks.project_type),
      budget_range: value(checks.budget_range),
      timeline: value(checks.timeline),
      message: value(checks.message),
      language: value(checks.language),
      consent: true,
      privacy_notice_version: value(checks.privacy_notice_version),
      submission_id: value(checks.submission_id),
      website: ctx.website,
      elapsed_ms: value(checks.elapsed_ms),
    },
  };
}

/** `{first_name}` = first word of the normalized name (CONTENT §14). */
export function firstName(name: string): string {
  return normalizeName(name).split(' ')[0] ?? '';
}
