// Calendly event URL (contract §8). Defaults to the documented URL so a valid one always exists
// (US-013 AC3).
export const DEFAULT_CALENDLY_URL = 'https://calendly.com/rcasanas/1hr';

export const calendlyUrl: string =
  (import.meta.env.PUBLIC_CALENDLY_URL ?? '').trim() || DEFAULT_CALENDLY_URL;

/** Official inline embed script (TECH_STACK §7). */
export const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';

/** US-013 AC3: show the fallback link if nothing renders within 10 s. */
export const CALENDLY_FALLBACK_MS = 10_000;
