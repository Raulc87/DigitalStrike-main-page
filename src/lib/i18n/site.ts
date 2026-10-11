// Public build-time settings (contract §8). Defaults are the documented production values so a
// missing variable never produces an empty mailto: or LinkedIn link.
export const contactEmail: string =
  import.meta.env.PUBLIC_CONTACT_EMAIL || 'manager@digitalstrike-solutions.com';
export const linkedinUrl: string =
  import.meta.env.PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/raul-casanas/';

/** US-008 AC2: `PUBLIC_SHOW_CLIENT_LOGOS=false` removes the clients section from the build. */
export const showClientLogos: boolean = import.meta.env.PUBLIC_SHOW_CLIENT_LOGOS !== 'false';

/** CONTENT §15: "provisional content" badges, shown in preview builds only. */
export const showPendingBadges: boolean = import.meta.env.PUBLIC_SHOW_PENDING_BADGES === 'true';
