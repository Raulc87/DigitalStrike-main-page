import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadAppsScript } from './helpers/loadAppsScript';

const gs = loadAppsScript();
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const message = {
  to: 'ana.perez@example.com',
  replyTo: 'reply@example.com',
  name: 'DigitalStrike Solutions',
  subject: 'Tu idea ya está en juego · DigitalStrike Solutions',
  body: 'Hola, Ana:',
  htmlBody: '<p>Hola, Ana:</p>',
};

describe('toGmailSendArgs (GmailApp.sendEmail mapping)', () => {
  it('maps a composed message to recipient, subject, body and options', () => {
    const args = gs.toGmailSendArgs(message);
    expect(args.recipient).toBe('ana.perez@example.com');
    expect(args.subject).toBe(message.subject);
    expect(args.body).toBe('Hola, Ana:');
    expect({ ...args.options }).toEqual({
      htmlBody: '<p>Hola, Ana:</p>',
      name: 'DigitalStrike Solutions',
      replyTo: 'reply@example.com',
    });
  });

  it.each([[undefined], ['']])('omits replyTo when it is %j', (replyTo) => {
    const args = gs.toGmailSendArgs({ ...message, replyTo });
    expect('replyTo' in args.options).toBe(false);
  });

  it('works on both composed emails', () => {
    const config = gs.readConfig({
      OWNER_NOTIFICATION_EMAIL: 'owner@example.com',
      REPLY_TO_EMAIL: 'reply@example.com',
      ACCEPTED_PRIVACY_NOTICE_VERSIONS: '2026-10-14-v1',
    });
    const lead = {
      name: 'Ana María Pérez',
      email: 'ana.perez@example.com',
      phone: '',
      company: '',
      project_type: 'website',
      budget_range: 'not_sure',
      timeline: 'flexible',
      message: 'Necesito una página web para mi emprendimiento.',
      language: 'es',
    };
    const context = { leadId: 'DS-20261014-K7Q2XM', submittedAt: '2026-10-14 10:00:00', config };
    const owner = gs.toGmailSendArgs(gs.composeOwnerEmail(lead, context));
    expect(owner.recipient).toBe('owner@example.com');
    expect(owner.options.replyTo).toBe('ana.perez@example.com');
    const confirmation = gs.toGmailSendArgs(gs.composeConfirmationEmail(lead, context));
    expect(confirmation.recipient).toBe('ana.perez@example.com');
    expect(confirmation.options.replyTo).toBe('reply@example.com');
    expect(confirmation.options.htmlBody).toContain('Hola, Ana:');
  });
});

describe('appsscript.json scopes', () => {
  it('has exactly the three needed scopes (no mail.google.com)', () => {
    const manifest = JSON.parse(readFileSync(join(root, 'appsscript.json'), 'utf8'));
    expect(manifest.oauthScopes).toEqual([
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/script.send_mail',
      'https://www.googleapis.com/auth/gmail.send',
    ]);
  });
});
