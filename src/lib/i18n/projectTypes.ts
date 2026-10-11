/**
 * Service cards (CONTENT §5) and the `project_type` code each one preselects in the lead form
 * (contract §4 enum). The improvements card maps to `custom_solution`, as in CONTENT §5.
 */
export const PRESELECT_EVENT = 'ds:preselect-project-type';

export const serviceCards = [
  { id: 'a', tier: 'A', code: 'website', includes: 5 },
  { id: 'b', tier: 'B', code: 'web_app', includes: 3 },
  { id: 'c', tier: 'C', code: 'business_system', includes: 3 },
  { id: 'd', tier: 'D', code: 'custom_solution', includes: 3 },
  { id: 'custom', tier: '+', code: 'custom_solution', includes: 3 },
] as const;

export type ProjectTypeCode = (typeof serviceCards)[number]['code'];
