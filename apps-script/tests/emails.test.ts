import { describe, expect, it } from 'vitest';
import { loadAppsScript, type AppsScriptContext } from './helpers/loadAppsScript';
import { PRIVACY_VERSION, SCRIPT_PROPERTIES, validBody } from './helpers/fixtures';

const gs = loadAppsScript();
const config = gs.readConfig(SCRIPT_PROPERTIES);
const context = { leadId: 'DS-20261014-K7Q2XM', submittedAt: '2026-10-14 10:00:00', config };

function lead(overrides: AppsScriptContext = {}) {
  const r = gs.validateLead(validBody(overrides), [PRIVACY_VERSION]);
  expect(r.ok).toBe(true);
  return r.lead;
}

const HOSTILE = {
  name: "Ana O'Neil-Pérez",
  company: '<b>ACME</b> & "Co"',
  message: '<script>alert(1)</script>\nSegunda línea & <img src=x onerror=alert(2)>',
};

describe('owner notification — CONTENT §14.1 (US-011)', () => {
  it('has the subject, recipients and Reply-To of ADR-005', () => {
    const m = gs.composeOwnerEmail(lead(), context);
    expect(m.subject).toBe(
      'Nuevo prospecto DS-20261014-K7Q2XM: Ana María Pérez · Aplicación web (catálogo, agenda, cursos…) · US$1.000 – 3.000',
    );
    expect(m.to).toBe('owner@example.com');
    expect(m.replyTo).toBe('ana.perez@example.com');
    expect(m.name).toBe('DigitalStrike Solutions');
  });

  it('plain-text body follows CONTENT §14.1, always in Spanish', () => {
    const m = gs.composeOwnerEmail(lead({ language: 'en', phone: '', company: '' }), context);
    expect(m.body).toBe(
      [
        'Raul:',
        '',
        'Ana María Pérez dejó su idea en la página (inglés). Estos son sus datos:',
        '',
        'Correo: ana.perez@example.com',
        'Teléfono: —',
        'Empresa: —',
        'Necesita: Aplicación web (catálogo, agenda, cursos…)',
        'Inversión: US$1.000 – 3.000',
        'Plazo: En los próximos 3 meses',
        'Recibido: 2026-10-14 10:00:00 (hora de Costa Rica)',
        '',
        'Su mensaje:',
        'Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería.',
        '',
        'Responde a este correo para escribirle directamente. El prospecto quedó en la hoja con estado new.',
        '',
        '— Formulario de DigitalStrike Solutions · DS-20261014-K7Q2XM',
        '',
      ].join('\n'),
    );
  });

  it('HTML body has every field and the CONTENT wording', () => {
    const { htmlBody } = gs.composeOwnerEmail(lead(), context);
    for (const text of [
      'Raul:',
      '<strong>Ana María Pérez</strong> dejó su idea en la página (español). Estos son sus datos:',
      '>+50688880000<',
      '>Panadería La Esquina<',
      '>En los próximos 3 meses<',
      '2026-10-14 10:00:00 (hora de Costa Rica)',
      '<strong>Su mensaje:</strong>',
      'El prospecto quedó en la hoja con estado <code>new</code>.',
      '— Formulario de DigitalStrike Solutions · DS-20261014-K7Q2XM',
      'href="mailto:ana.perez@example.com"',
    ]) {
      expect(htmlBody).toContain(text);
    }
  });

  it('HTML-escapes every visitor value and keeps line breaks (US-011 AC2)', () => {
    const { htmlBody, body } = gs.composeOwnerEmail(lead(HOSTILE), context);
    expect(htmlBody).not.toContain('<script>');
    expect(htmlBody).not.toContain('<img');
    expect(htmlBody).not.toContain('<b>ACME');
    expect(htmlBody).toContain(
      '&lt;script&gt;alert(1)&lt;/script&gt;<br>Segunda línea &amp; &lt;img src=x onerror=alert(2)&gt;',
    );
    expect(htmlBody).toContain('&lt;b&gt;ACME&lt;/b&gt; &amp; &quot;Co&quot;');
    expect(htmlBody).toContain('Ana O&#39;Neil-Pérez');
    // Plain text is not HTML: values stay as typed.
    expect(body).toContain('<script>alert(1)</script>\nSegunda línea');
  });
});

describe('visitor confirmation — CONTENT §14.2 (US-012)', () => {
  it('Spanish: subject, recipients, Reply-To = REPLY_TO_EMAIL and plain text', () => {
    const m = gs.composeConfirmationEmail(lead(), context);
    expect(m.subject).toBe('Tu idea ya está en juego · DigitalStrike Solutions');
    expect(m.to).toBe('ana.perez@example.com');
    expect(m.replyTo).toBe('reply@example.com');
    expect(m.name).toBe('DigitalStrike Solutions');
    expect(m.body).toBe(
      [
        'Hola, Ana:',
        '',
        'Gracias por contarnos tu idea. Ya la recibimos y la estamos revisando con calma.',
        '',
        'Así sigue el juego:',
        '1. Revisamos lo que nos contaste y preparamos preguntas concretas.',
        '2. Te escribimos en un máximo de 2 días hábiles.',
        '3. Si prefieres adelantar, agenda tu sesión 0: https://calendly.com/rcasanas/1hr',
        '',
        'Nuestro trabajo es sencillo de explicar: sacar de circulación tus necesidades de software.',
        '',
        'Raul Casañas',
        'CEO, DigitalStrike Solutions',
        '',
        '---',
        'Resumen de lo que nos enviaste: Aplicación web (catálogo, agenda, cursos…) · US$1.000 – 3.000 · En los próximos 3 meses',
        '«Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería.»',
        '',
        'Recibiste este correo porque completaste el formulario en https://digitalstrike-solutions.com. Si no fuiste tú, ignóralo o escríbenos para borrar tus datos.',
        '',
      ].join('\n'),
    );
  });

  it('English: subject and plain text', () => {
    const m = gs.composeConfirmationEmail(
      lead({
        language: 'en',
        name: 'John  Smith',
        project_type: 'not_sure',
        budget_range: 'over_25000',
        timeline: 'asap',
      }),
      context,
    );
    expect(m.subject).toBe('Your idea is in play · DigitalStrike Solutions');
    expect(m.body).toBe(
      [
        'Hi John,',
        '',
        "Thanks for telling us about your idea. We've received it and we're reviewing it carefully.",
        '',
        "Here's the game plan:",
        '1. We review what you shared and prepare specific questions.',
        "2. We'll write to you within 2 business days.",
        "3. If you'd like to move faster, book your session 0: https://calendly.com/rcasanas/1hr",
        '',
        'Our job is simple to explain: we strike out your software needs.',
        '',
        'Raul Casañas',
        'CEO, DigitalStrike Solutions',
        '',
        '---',
        'Summary of what you sent: Not sure yet · Over US$25,000 · As soon as possible',
        '"Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería."',
        '',
        "You received this email because you filled in the form at https://digitalstrike-solutions.com. If it wasn't you, ignore it or write to us to delete your data.",
        '',
      ].join('\n'),
    );
  });

  it('HTML has the Calendly and site links, the steps and the escaped message', () => {
    const { htmlBody } = gs.composeConfirmationEmail(lead(HOSTILE), context);
    expect(htmlBody).toContain('Hola, Ana:');
    expect(htmlBody).toContain('<strong>Así sigue el juego:</strong>');
    expect(htmlBody).toContain('<a href="https://calendly.com/rcasanas/1hr"');
    expect(htmlBody).toContain('<a href="https://digitalstrike-solutions.com"');
    expect(htmlBody).toContain(
      '«&lt;script&gt;alert(1)&lt;/script&gt;<br>Segunda línea &amp; &lt;img src=x onerror=alert(2)&gt;»',
    );
    expect(htmlBody).not.toContain('<script>');
    expect(htmlBody).not.toContain('<img');
  });

  it('uses the configured Calendly and site URLs, escaped in HTML', () => {
    const custom = gs.readConfig({
      ...SCRIPT_PROPERTIES,
      CALENDLY_URL: 'https://calendly.com/x?a=1&b="2"',
      SITE_URL: 'https://example.org',
    });
    const m = gs.composeConfirmationEmail(lead(), { ...context, config: custom });
    expect(m.body).toContain('agenda tu sesión 0: https://calendly.com/x?a=1&b="2"');
    expect(m.htmlBody).toContain('href="https://calendly.com/x?a=1&amp;b=&quot;2&quot;"');
    expect(m.body).toContain('formulario en https://example.org.');
  });

  it('omits Reply-To when REPLY_TO_EMAIL is not set', () => {
    const noReply = gs.readConfig({ ...SCRIPT_PROPERTIES, REPLY_TO_EMAIL: '' });
    expect('replyTo' in gs.composeConfirmationEmail(lead(), { ...context, config: noReply })).toBe(
      false,
    );
  });
});

describe('helpers', () => {
  it('escapeHtml escapes & < > " \'', () => {
    expect(gs.escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
    expect(gs.escapeHtml(null)).toBe('');
  });
  it('firstName is the first word of the normalized name', () => {
    expect(gs.firstName('Ana María Pérez')).toBe('Ana');
    expect(gs.firstName("D'Arcy")).toBe("D'Arcy");
  });
  it('composeLeadEmail dispatches by kind', () => {
    expect(gs.composeLeadEmail('owner', lead(), context).to).toBe('owner@example.com');
    expect(gs.composeLeadEmail('confirmation', lead(), context).to).toBe('ana.perez@example.com');
    expect(() => gs.composeLeadEmail('other', lead(), context)).toThrow();
  });
});
