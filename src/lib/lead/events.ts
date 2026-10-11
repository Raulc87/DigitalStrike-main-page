// Window events shared with other sections.

/**
 * Dispatched by the service cards (Agent 1, DS-004 `src/lib/i18n/projectTypes.ts` PRESELECT_EVENT)
 * with `detail.code` = a §4.1 `project_type`. Kept as a string here so the form does not depend on
 * that file.
 */
export const PRESELECT_EVENT = 'ds:preselect-project-type';

/** Dispatched by the lead form after `ok: true`, for the scheduling section (FR-015, US-013 AC2). */
export const LEAD_SUBMITTED_EVENT = 'ds:lead-submitted';

export interface LeadSubmittedDetail {
  name: string;
  email: string;
}

/** `?tipo=<code>` query parameter set by the service cards without JS. */
export const PRESELECT_QUERY_PARAM = 'tipo';
