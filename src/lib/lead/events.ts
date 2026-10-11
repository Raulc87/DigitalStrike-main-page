// Window events shared with other sections.

/** Dispatched by the service cards (DS-004) with `detail.code` = a §4.1 `project_type`. */
export { PRESELECT_EVENT } from '../i18n/projectTypes';

/** Dispatched by the lead form after `ok: true`, for the scheduling section (FR-015, US-013 AC2). */
export const LEAD_SUBMITTED_EVENT = 'ds:lead-submitted';

export interface LeadSubmittedDetail {
  name: string;
  email: string;
}

/** `?tipo=<code>` query parameter set by the service cards without JS. */
export const PRESELECT_QUERY_PARAM = 'tipo';
