// Lead endpoint contract v1.0 (docs/specs/LEAD_ENDPOINT_CONTRACT.md): request body, enumerations
// and responses. Field names are the contract's snake_case names (BR-007).

/** §4.1 */
export const PROJECT_TYPES = [
  'website',
  'web_app',
  'business_system',
  'custom_solution',
  'not_sure',
] as const;
/** §4.2 */
export const BUDGET_RANGES = [
  'under_1000',
  'from_1000_to_3000',
  'from_3000_to_10000',
  'from_10000_to_25000',
  'over_25000',
  'not_sure',
] as const;
/** §4.3 */
export const TIMELINES = ['asap', 'within_1_month', 'within_3_months', 'flexible'] as const;
/** §3 `language` */
export const LANGUAGES = ['es', 'en'] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type BudgetRange = (typeof BUDGET_RANGES)[number];
export type Timeline = (typeof TIMELINES)[number];
export type Language = (typeof LANGUAGES)[number];

/** §3 request body, after client normalization. */
export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  company: string;
  project_type: ProjectType;
  budget_range: BudgetRange;
  timeline: Timeline;
  message: string;
  language: Language;
  consent: true;
  privacy_notice_version: string;
  submission_id: string;
  website: string;
  elapsed_ms: number;
}

/** The fields the visitor fills in, as read from the form controls (raw, not normalized). */
export interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  message: string;
  consent: boolean;
}

export type VisibleField = keyof LeadFormValues;

/** Visible fields in form order (UX §3). */
export const VISIBLE_FIELDS: readonly VisibleField[] = [
  'name',
  'email',
  'phone',
  'company',
  'project_type',
  'budget_range',
  'timeline',
  'message',
  'consent',
];

/** §7 field error codes. */
export const FIELD_ERROR_CODES = [
  'required',
  'invalid_type',
  'too_short',
  'too_long',
  'invalid_format',
  'invalid_option',
  'must_be_true',
] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** §7 `error_code` values. */
export const ERROR_CODES = [
  'validation_failed',
  'invalid_json',
  'payload_too_large',
  'rate_limited',
  'storage_unavailable',
  'internal_error',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/** Ranges of §3. */
export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  companyMax: 100,
  messageMin: 20,
  messageMax: 2000,
  elapsedMsMax: 86_400_000,
} as const;

export function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}
