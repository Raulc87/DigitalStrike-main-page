import type { AppsScriptContext } from './loadAppsScript';

export const PRIVACY_VERSION = '2026-10-14-v1';

/** The request body of contract §3. */
export function validBody(overrides: AppsScriptContext = {}): AppsScriptContext {
  return {
    name: 'Ana María Pérez',
    email: 'ana.perez@example.com',
    phone: '+506 8888 0000',
    company: 'Panadería La Esquina',
    project_type: 'web_app',
    budget_range: 'from_1000_to_3000',
    timeline: 'within_3_months',
    message: 'Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería.',
    language: 'es',
    consent: true,
    privacy_notice_version: PRIVACY_VERSION,
    submission_id: '8f14e45f-ceea-4e7a-9b1c-3f0a2d5c7e21',
    website: '',
    elapsed_ms: 48250,
    ...overrides,
  };
}

export const SCRIPT_PROPERTIES = {
  SHEET_ID: 'sheet-id',
  OWNER_NOTIFICATION_EMAIL: 'owner@example.com',
  REPLY_TO_EMAIL: 'reply@example.com',
  SENDER_NAME: 'DigitalStrike Solutions',
  CALENDLY_URL: 'https://calendly.com/rcasanas/1hr',
  SITE_URL: 'https://digitalstrike-solutions.com',
  ACCEPTED_PRIVACY_NOTICE_VERSIONS: PRIVACY_VERSION,
  SEND_EMAILS: 'true',
  MAX_LEADS_PER_EMAIL_PER_HOUR: '3',
  MAX_LEADS_PER_HOUR: '20',
  MAX_LEADS_PER_DAY: '40',
};

let counter = 0;
/** A fresh, valid lowercase UUID v4. */
export function uuid(): string {
  counter++;
  const hex = counter.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}
