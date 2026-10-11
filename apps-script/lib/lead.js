/**
 * Costa Rica time, lead_id, row building with the formula-injection guard (contract §6),
 * and the reverse mapping from a stored row. Pure functions.
 */

function pad2_(n) {
  return (n < 10 ? '0' : '') + n;
}

/** Shifts an instant to Costa Rica wall-clock time, read back with getUTC* methods. */
function toCostaRicaWallClock_(date) {
  return new Date(date.getTime() + COSTA_RICA_UTC_OFFSET_MINUTES * 60000);
}

/** `yyyy-MM-dd HH:mm:ss` in America/Costa_Rica (column A). */
function formatCostaRicaDateTime(date) {
  var d = toCostaRicaWallClock_(date);
  return (
    d.getUTCFullYear() +
    '-' +
    pad2_(d.getUTCMonth() + 1) +
    '-' +
    pad2_(d.getUTCDate()) +
    ' ' +
    pad2_(d.getUTCHours()) +
    ':' +
    pad2_(d.getUTCMinutes()) +
    ':' +
    pad2_(d.getUTCSeconds())
  );
}

/** `yyyy-MM-dd` in America/Costa_Rica. */
function formatCostaRicaDate(date) {
  return formatCostaRicaDateTime(date).slice(0, 10);
}

/**
 * Parses a column A value `yyyy-MM-dd HH:mm:ss` (Costa Rica time) to epoch milliseconds.
 * Returns NaN for anything else.
 */
function parseCostaRicaDateTime(text) {
  var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(String(text).trim());
  if (!m) {
    return NaN;
  }
  var wallClockUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return wallClockUtc - COSTA_RICA_UTC_OFFSET_MINUTES * 60000;
}

/** Epoch milliseconds of the next midnight in Costa Rica after `date`. */
function nextCostaRicaMidnightMs(date) {
  var d = toCostaRicaWallClock_(date);
  var nextWallClockMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return nextWallClockMidnight - COSTA_RICA_UTC_OFFSET_MINUTES * 60000;
}

var LEAD_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** `DS-yyyyMMdd-XXXXXX` (6 random uppercase alphanumerics). `random` returns [0, 1). */
function generateLeadId(date, random) {
  var suffix = '';
  for (var i = 0; i < 6; i++) {
    suffix += LEAD_ID_ALPHABET.charAt(Math.floor(random() * LEAD_ID_ALPHABET.length));
  }
  return 'DS-' + formatCostaRicaDate(date).replace(/-/g, '') + '-' + suffix;
}

/** Contract §3: a text value starting with = + - @ is prefixed with an apostrophe. */
function guardFormula(value) {
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}

/** Contract §6: the A–S values of a new row; both email statuses start `pending`. */
function buildLeadRow(lead, leadId, submittedAt) {
  var values = {
    submitted_at: submittedAt,
    status: 'new',
    lead_id: leadId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    project_type: lead.project_type,
    budget_range: lead.budget_range,
    timeline: lead.timeline,
    message: lead.message,
    language: lead.language,
    consent: true,
    privacy_notice_version: lead.privacy_notice_version,
    owner_email_status: EMAIL_STATUS.PENDING,
    confirmation_email_status: EMAIL_STATUS.PENDING,
    notes: '',
    submission_id: lead.submission_id,
    last_contact_at: '',
  };
  return SHEET_COLUMNS.map(function (column) {
    return guardFormula(values[column]);
  });
}

/** Removes the guard apostrophe if the sheet API returned it. */
function unguardFormula_(value) {
  if (typeof value === 'string' && /^'[=+\-@]/.test(value)) {
    return value.slice(1);
  }
  return value;
}

/** Reads a stored A–S row back into `{ leadId, submittedAt, lead, ownerEmailStatus, confirmationEmailStatus }`. */
function leadFromRow(values) {
  function get(column) {
    var v = values[COLUMN[column] - 1];
    return v === undefined || v === null
      ? ''
      : unguardFormula_(typeof v === 'string' ? v : String(v));
  }
  return {
    leadId: get('lead_id'),
    submittedAt: get('submitted_at'),
    ownerEmailStatus: get('owner_email_status'),
    confirmationEmailStatus: get('confirmation_email_status'),
    lead: {
      name: get('name'),
      email: get('email'),
      phone: get('phone'),
      company: get('company'),
      project_type: get('project_type'),
      budget_range: get('budget_range'),
      timeline: get('timeline'),
      message: get('message'),
      language: get('language'),
      consent: true,
      privacy_notice_version: get('privacy_notice_version'),
      submission_id: get('submission_id'),
    },
  };
}
