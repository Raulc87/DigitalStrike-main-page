// Public build-time settings (contract §8). Defaults are the documented production values so a
// missing variable never produces an empty mailto: or LinkedIn link.
export const contactEmail: string =
  import.meta.env.PUBLIC_CONTACT_EMAIL || 'manager@digitalstrike-solutions.com';
export const linkedinUrl: string =
  import.meta.env.PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/raul-casanas/';
