// Localized form copy lookup (src/i18n/{es,en}/form.ts). Visitor-facing text never comes from the
// endpoint response (contract §1).
import { esForm } from '../../i18n/es/form';
import type { FormKey } from '../../i18n/es/form';
import { enForm } from '../../i18n/en/form';
import { fill } from '../../i18n';
import type { Locale } from '../../i18n';
import { FIELD_ERROR_CODES, isOneOf } from './types';
import type { VisibleField } from './types';

const dictionaries: Record<Locale, Record<FormKey, string>> = { es: esForm, en: enForm };

export function formT(lang: Locale, key: FormKey, vars?: Record<string, string>): string {
  const text = dictionaries[lang][key];
  return vars ? fill(text, vars) : text;
}

function isFormKey(key: string): key is FormKey {
  return key in esForm;
}

/**
 * The CONTENT §10 message for a field error code: the field-specific one when it exists
 * (`too_short` name/message, `invalid_format` name/email/phone), else the generic one. `null`
 * when CONTENT has no copy for that code (e.g. `invalid_type`, which the form cannot produce).
 */
export function fieldErrorMessage(lang: Locale, field: VisibleField, code: string): string | null {
  if (!isOneOf(FIELD_ERROR_CODES, code)) return null;
  const specific = `form.error.${code}.${field}`;
  if (isFormKey(specific)) return formT(lang, specific);
  const general = `form.error.${code}`;
  if (isFormKey(general)) return formT(lang, general);
  return null;
}

/** Option label for a select (contract §4 labels). */
export function optionLabel(
  lang: Locale,
  field: 'project_type' | 'budget_range' | 'timeline',
  code: string,
): string {
  const key = `form.${field}.${code}`;
  return isFormKey(key) ? formT(lang, key) : code;
}
