// Public build-time settings for the lead flow (contract §8).

/** Apps Script `/exec` URL. No default: when unset, submitting shows the generic error. */
export const leadEndpointUrl: string = (import.meta.env.PUBLIC_LEAD_ENDPOINT_URL ?? '').trim();

/**
 * Privacy notice version shown next to the consent checkbox and sent with each lead. Defaults to
 * the documented v1 (contract §8, CONTENT §13) so a missing variable never sends an empty version.
 */
export const privacyNoticeVersion: string =
  (import.meta.env.PUBLIC_PRIVACY_NOTICE_VERSION ?? '').trim() || '2026-10-14-v1';
