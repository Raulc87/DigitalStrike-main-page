/**
 * Owner notification ("cover letter") and visitor confirmation (CONTENT §14, ADR-005,
 * US-011, US-012). Pure functions: they return message objects
 * ({ to, replyTo, name, subject, body, htmlBody }) that lib/gmail.js maps to GmailApp.sendEmail.
 * Every visitor value is HTML-escaped in the HTML body.
 */

var EMAIL_STYLE = {
  // Brand tokens of UX §2.1 as inline styles (email clients ignore stylesheets).
  page: 'margin:0;padding:24px 12px;background:#F5F7F8;',
  card: 'max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #D7DDE5;border-radius:12px;overflow:hidden;',
  band: 'background:#0B132B;color:#F5F7F8;padding:16px 24px;font:800 18px Archivo,Arial,sans-serif;',
  bandAccent: 'color:#21C7D9;',
  body: 'padding:24px;color:#0B132B;font:400 16px/1.6 Archivo,Arial,sans-serif;',
  table: 'border-collapse:collapse;width:100%;margin:8px 0 16px;',
  th: 'text-align:left;vertical-align:top;padding:6px 12px 6px 0;color:#3A4870;font-weight:600;white-space:nowrap;',
  td: 'padding:6px 0;vertical-align:top;',
  quote: 'margin:8px 0 16px;padding:12px 16px;background:#F5F7F8;border-left:4px solid #157D89;',
  link: 'color:#157D89;',
  small: 'color:#3A4870;font-size:13px;',
  hr: 'border:0;border-top:1px solid #D7DDE5;margin:24px 0 16px;',
};

/** Escapes a value for HTML text and attribute contexts. */
function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapes, then keeps line breaks. */
function escapeHtmlMultiline_(value) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>');
}

/** Header values must stay on one line. */
function singleLine_(value) {
  return String(value).replace(/[\r\n]+/g, ' ');
}

/** CONTENT §14: `{first_name}` = first word of the normalized name. */
function firstName(name) {
  return String(name).trim().split(' ')[0];
}

function optionLabel_(options, code, language) {
  return options[code] ? options[code][language] : code;
}

function linkHtml_(url) {
  return (
    '<a href="' + escapeHtml(url) + '" style="' + EMAIL_STYLE.link + '">' + escapeHtml(url) + '</a>'
  );
}

function layoutHtml_(innerHtml) {
  return (
    '<!DOCTYPE html><html><body style="' +
    EMAIL_STYLE.page +
    '">' +
    '<div style="' +
    EMAIL_STYLE.card +
    '">' +
    '<div style="' +
    EMAIL_STYLE.band +
    '">DigitalStrike <span style="' +
    EMAIL_STYLE.bandAccent +
    '">Solutions</span></div>' +
    '<div style="' +
    EMAIL_STYLE.body +
    '">' +
    innerHtml +
    '</div>' +
    '</div></body></html>'
  );
}

/** Language of the page where the lead was sent, as the owner reads it (the email is in Spanish). */
var LANGUAGE_LABELS_ES = { es: 'español', en: 'inglés' };

/** CONTENT §14.1 — always in Spanish; Reply-To is the visitor (ADR-005). */
function composeOwnerEmail(lead, context) {
  var config = context.config;
  var dash = '—';
  var labels = {
    projectType: optionLabel_(PROJECT_TYPES, lead.project_type, 'es'),
    budgetRange: optionLabel_(BUDGET_RANGES, lead.budget_range, 'es'),
    timeline: optionLabel_(TIMELINES, lead.timeline, 'es'),
    language: LANGUAGE_LABELS_ES[lead.language] || lead.language,
  };
  var details = [
    ['Correo', lead.email],
    ['Teléfono', lead.phone || dash],
    ['Empresa', lead.company || dash],
    ['Necesita', labels.projectType],
    ['Inversión', labels.budgetRange],
    ['Plazo', labels.timeline],
    ['Recibido', context.submittedAt + ' (hora de Costa Rica)'],
  ];

  var subject = singleLine_(
    'Nuevo prospecto ' +
      context.leadId +
      ': ' +
      lead.name +
      ' · ' +
      labels.projectType +
      ' · ' +
      labels.budgetRange,
  );

  var text =
    'Raul:\n\n' +
    lead.name +
    ' dejó su idea en la página (' +
    labels.language +
    '). Estos son sus datos:\n\n' +
    details
      .map(function (d) {
        return d[0] + ': ' + d[1];
      })
      .join('\n') +
    '\n\nSu mensaje:\n' +
    lead.message +
    '\n\nResponde a este correo para escribirle directamente. El prospecto quedó en la hoja con estado new.\n\n' +
    '— Formulario de DigitalStrike Solutions · ' +
    context.leadId +
    '\n';

  var html = layoutHtml_(
    '<p>Raul:</p>' +
      '<p><strong>' +
      escapeHtml(lead.name) +
      '</strong> dejó su idea en la página (' +
      escapeHtml(labels.language) +
      '). Estos son sus datos:</p>' +
      '<table role="presentation" style="' +
      EMAIL_STYLE.table +
      '">' +
      details
        .map(function (d) {
          var value =
            d[0] === 'Correo'
              ? '<a href="mailto:' +
                escapeHtml(d[1]) +
                '" style="' +
                EMAIL_STYLE.link +
                '">' +
                escapeHtml(d[1]) +
                '</a>'
              : escapeHtml(d[1]);
          return (
            '<tr><th scope="row" style="' +
            EMAIL_STYLE.th +
            '">' +
            escapeHtml(d[0]) +
            '</th><td style="' +
            EMAIL_STYLE.td +
            '">' +
            value +
            '</td></tr>'
          );
        })
        .join('') +
      '</table>' +
      '<p><strong>Su mensaje:</strong></p>' +
      '<div style="' +
      EMAIL_STYLE.quote +
      '">' +
      escapeHtmlMultiline_(lead.message) +
      '</div>' +
      '<p>Responde a este correo para escribirle directamente. El prospecto quedó en la hoja con estado <code>new</code>.</p>' +
      '<p style="' +
      EMAIL_STYLE.small +
      '">— Formulario de DigitalStrike Solutions · ' +
      escapeHtml(context.leadId) +
      '</p>',
  );

  return {
    to: config.ownerNotificationEmail,
    replyTo: lead.email,
    name: config.senderName,
    subject: subject,
    body: text,
    htmlBody: html,
  };
}

/** CONTENT §14.2, in each language. */
var CONFIRMATION_COPY = {
  es: {
    subject: 'Tu idea ya está en juego · DigitalStrike Solutions',
    greeting: function (name) {
      return 'Hola, ' + name + ':';
    },
    thanks: 'Gracias por contarnos tu idea. Ya la recibimos y la estamos revisando con calma.',
    planTitle: 'Así sigue el juego:',
    steps: [
      'Revisamos lo que nos contaste y preparamos preguntas concretas.',
      'Te escribimos en un máximo de 2 días hábiles.',
      'Si prefieres adelantar, agenda tu sesión 0: ',
    ],
    closing:
      'Nuestro trabajo es sencillo de explicar: sacar de circulación tus necesidades de software.',
    role: 'CEO, DigitalStrike Solutions',
    summaryTitle: 'Resumen de lo que nos enviaste:',
    quoteOpen: '«',
    quoteClose: '»',
    footer: function (siteUrl) {
      return [
        'Recibiste este correo porque completaste el formulario en ',
        siteUrl,
        '. Si no fuiste tú, ignóralo o escríbenos para borrar tus datos.',
      ];
    },
  },
  en: {
    subject: 'Your idea is in play · DigitalStrike Solutions',
    greeting: function (name) {
      return 'Hi ' + name + ',';
    },
    thanks:
      "Thanks for telling us about your idea. We've received it and we're reviewing it carefully.",
    planTitle: "Here's the game plan:",
    steps: [
      'We review what you shared and prepare specific questions.',
      "We'll write to you within 2 business days.",
      "If you'd like to move faster, book your session 0: ",
    ],
    closing: 'Our job is simple to explain: we strike out your software needs.',
    role: 'CEO, DigitalStrike Solutions',
    summaryTitle: 'Summary of what you sent:',
    quoteOpen: '"',
    quoteClose: '"',
    footer: function (siteUrl) {
      return [
        'You received this email because you filled in the form at ',
        siteUrl,
        ". If it wasn't you, ignore it or write to us to delete your data.",
      ];
    },
  },
};

/** CONTENT §14.2 — in the lead's language; Reply-To is REPLY_TO_EMAIL (ADR-005). */
function composeConfirmationEmail(lead, context) {
  var config = context.config;
  var language = lead.language === 'en' ? 'en' : 'es';
  var copy = CONFIRMATION_COPY[language];
  var name = firstName(lead.name);
  var summary = [
    optionLabel_(PROJECT_TYPES, lead.project_type, language),
    optionLabel_(BUDGET_RANGES, lead.budget_range, language),
    optionLabel_(TIMELINES, lead.timeline, language),
  ].join(' · ');
  var footer = copy.footer(config.siteUrl);

  var text =
    copy.greeting(name) +
    '\n\n' +
    copy.thanks +
    '\n\n' +
    copy.planTitle +
    '\n' +
    '1. ' +
    copy.steps[0] +
    '\n' +
    '2. ' +
    copy.steps[1] +
    '\n' +
    '3. ' +
    copy.steps[2] +
    config.calendlyUrl +
    '\n\n' +
    copy.closing +
    '\n\n' +
    'Raul Casañas\n' +
    copy.role +
    '\n\n' +
    '---\n' +
    copy.summaryTitle +
    ' ' +
    summary +
    '\n' +
    copy.quoteOpen +
    lead.message +
    copy.quoteClose +
    '\n\n' +
    footer.join('') +
    '\n';

  var html = layoutHtml_(
    '<p>' +
      escapeHtml(copy.greeting(name)) +
      '</p>' +
      '<p>' +
      escapeHtml(copy.thanks) +
      '</p>' +
      '<p><strong>' +
      escapeHtml(copy.planTitle) +
      '</strong></p>' +
      '<ol>' +
      '<li>' +
      escapeHtml(copy.steps[0]) +
      '</li>' +
      '<li>' +
      escapeHtml(copy.steps[1]) +
      '</li>' +
      '<li>' +
      escapeHtml(copy.steps[2]) +
      linkHtml_(config.calendlyUrl) +
      '</li>' +
      '</ol>' +
      '<p>' +
      escapeHtml(copy.closing) +
      '</p>' +
      '<p>Raul Casañas<br>' +
      escapeHtml(copy.role) +
      '</p>' +
      '<hr style="' +
      EMAIL_STYLE.hr +
      '">' +
      '<p><strong>' +
      escapeHtml(copy.summaryTitle) +
      '</strong> ' +
      escapeHtml(summary) +
      '</p>' +
      '<div style="' +
      EMAIL_STYLE.quote +
      '">' +
      escapeHtml(copy.quoteOpen) +
      escapeHtmlMultiline_(lead.message) +
      escapeHtml(copy.quoteClose) +
      '</div>' +
      '<p style="' +
      EMAIL_STYLE.small +
      '">' +
      escapeHtml(footer[0]) +
      linkHtml_(footer[1]) +
      escapeHtml(footer[2]) +
      '</p>',
  );

  var message = {
    to: lead.email,
    name: config.senderName,
    subject: copy.subject,
    body: text,
    htmlBody: html,
  };
  if (config.replyToEmail) {
    message.replyTo = config.replyToEmail;
  }
  return message;
}

/** The composer used by handleLeadRequest: kind is 'owner' or 'confirmation'. */
function composeLeadEmail(kind, lead, context) {
  if (kind === 'owner') {
    return composeOwnerEmail(lead, context);
  }
  if (kind === 'confirmation') {
    return composeConfirmationEmail(lead, context);
  }
  throw new Error('Unknown email kind: ' + kind);
}
