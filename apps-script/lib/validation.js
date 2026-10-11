/**
 * Request parsing, honeypot, fill time, normalization and validation
 * (contract §3, §5 steps 1–5, §5.1, §5.2). Pure functions.
 */

var EMAIL_PATTERN =
  /^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,63}$/;
// Unicode letters (with their combining marks), spaces, ' ’ - . only.
var NAME_PATTERN = /^[\p{L}\p{M} '’.-]+$/u;
var PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
var SUBMISSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

var FIELD_ERROR = {
  REQUIRED: 'required',
  INVALID_TYPE: 'invalid_type',
  TOO_SHORT: 'too_short',
  TOO_LONG: 'too_long',
  INVALID_FORMAT: 'invalid_format',
  INVALID_OPTION: 'invalid_option',
  MUST_BE_TRUE: 'must_be_true',
};

/** Size of a string once encoded as UTF-8, in bytes. */
function utf8ByteLength(text) {
  var bytes = 0;
  for (var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x800) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      var next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        i++;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Steps 1–2. Returns `{ ok: true, body }` or `{ ok: false, errorCode }`.
 * `raw` is the request body as a string (absent → invalid_json).
 */
function parseRequestBody(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, errorCode: 'invalid_json' };
  }
  if (utf8ByteLength(raw) > MAX_BODY_BYTES) {
    return { ok: false, errorCode: 'payload_too_large' };
  }
  var body;
  try {
    body = JSON.parse(raw);
  } catch (err) {
    return { ok: false, errorCode: 'invalid_json' };
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errorCode: 'invalid_json' };
  }
  return { ok: true, body: body };
}

/** §5.1: `website` absent, null or empty after trim → human; anything else → bot. */
function isHoneypotFilled(body) {
  var v = body.website;
  if (v === undefined || v === null) {
    return false;
  }
  if (typeof v === 'string' && v.trim() === '') {
    return false;
  }
  return true;
}

/** §5.2: a valid `elapsed_ms` below the minimum fill time → bot. */
function isTooFast(elapsedMs) {
  return elapsedMs < MIN_ELAPSED_MS;
}

function isAbsent_(v) {
  return v === undefined || v === null;
}

function validateRequiredString_(v) {
  if (isAbsent_(v)) {
    return { error: FIELD_ERROR.REQUIRED };
  }
  if (typeof v !== 'string') {
    return { error: FIELD_ERROR.INVALID_TYPE };
  }
  var trimmed = v.trim();
  if (trimmed === '') {
    return { error: FIELD_ERROR.REQUIRED };
  }
  return { value: trimmed };
}

function validateName_(v) {
  var r = validateRequiredString_(v);
  if (r.error) return r;
  var name = r.value.replace(/\s+/g, ' ');
  if (name.length < 2) return { error: FIELD_ERROR.TOO_SHORT };
  if (name.length > 100) return { error: FIELD_ERROR.TOO_LONG };
  if (!NAME_PATTERN.test(name)) return { error: FIELD_ERROR.INVALID_FORMAT };
  return { value: name };
}

function validateEmail_(v) {
  var r = validateRequiredString_(v);
  if (r.error) return r;
  var email = r.value.toLowerCase();
  if (email.length > 254) return { error: FIELD_ERROR.TOO_LONG };
  if (!EMAIL_PATTERN.test(email)) return { error: FIELD_ERROR.INVALID_FORMAT };
  var local = email.slice(0, email.lastIndexOf('@'));
  if (
    local.charAt(0) === '.' ||
    local.charAt(local.length - 1) === '.' ||
    local.indexOf('..') !== -1
  ) {
    return { error: FIELD_ERROR.INVALID_FORMAT };
  }
  return { value: email };
}

function validatePhone_(v) {
  if (isAbsent_(v)) return { value: '' };
  if (typeof v !== 'string') return { error: FIELD_ERROR.INVALID_TYPE };
  if (v.trim() === '') return { value: '' };
  var phone = v.replace(/[\s\-().]/g, '');
  if (!PHONE_PATTERN.test(phone)) return { error: FIELD_ERROR.INVALID_FORMAT };
  return { value: phone };
}

function validateCompany_(v) {
  if (isAbsent_(v)) return { value: '' };
  if (typeof v !== 'string') return { error: FIELD_ERROR.INVALID_TYPE };
  var company = v.trim();
  if (company.length > 100) return { error: FIELD_ERROR.TOO_LONG };
  return { value: company };
}

function validateOption_(v, allowed) {
  if (isAbsent_(v) || v === '') return { error: FIELD_ERROR.REQUIRED };
  if (typeof v !== 'string') return { error: FIELD_ERROR.INVALID_TYPE };
  if (allowed.indexOf(v) === -1) return { error: FIELD_ERROR.INVALID_OPTION };
  return { value: v };
}

function validateMessage_(v) {
  var r = validateRequiredString_(v);
  if (r.error) return r;
  if (r.value.length < 20) return { error: FIELD_ERROR.TOO_SHORT };
  if (r.value.length > 2000) return { error: FIELD_ERROR.TOO_LONG };
  return { value: r.value };
}

function validateConsent_(v) {
  if (isAbsent_(v)) return { error: FIELD_ERROR.REQUIRED };
  if (typeof v !== 'boolean') return { error: FIELD_ERROR.INVALID_TYPE };
  if (v !== true) return { error: FIELD_ERROR.MUST_BE_TRUE };
  return { value: true };
}

function validateSubmissionId_(v) {
  if (isAbsent_(v) || v === '') return { error: FIELD_ERROR.REQUIRED };
  if (typeof v !== 'string') return { error: FIELD_ERROR.INVALID_TYPE };
  if (!SUBMISSION_ID_PATTERN.test(v)) return { error: FIELD_ERROR.INVALID_FORMAT };
  return { value: v };
}

function validateElapsedMs_(v) {
  if (isAbsent_(v)) return { error: FIELD_ERROR.REQUIRED };
  if (typeof v !== 'number' || !Number.isInteger(v)) return { error: FIELD_ERROR.INVALID_TYPE };
  if (v < 0 || v > MAX_ELAPSED_MS) return { error: FIELD_ERROR.INVALID_FORMAT };
  return { value: v };
}

/**
 * Step 4. Validates and normalizes a parsed body.
 * Returns `{ ok: true, lead, elapsedMs }` or `{ ok: false, fieldErrors }` with every field error.
 * `acceptedPrivacyNoticeVersions` comes from Script Property ACCEPTED_PRIVACY_NOTICE_VERSIONS.
 */
function validateLead(body, acceptedPrivacyNoticeVersions) {
  var checks = {
    name: validateName_(body.name),
    email: validateEmail_(body.email),
    phone: validatePhone_(body.phone),
    company: validateCompany_(body.company),
    project_type: validateOption_(body.project_type, Object.keys(PROJECT_TYPES)),
    budget_range: validateOption_(body.budget_range, Object.keys(BUDGET_RANGES)),
    timeline: validateOption_(body.timeline, Object.keys(TIMELINES)),
    message: validateMessage_(body.message),
    language: validateOption_(body.language, LANGUAGES),
    consent: validateConsent_(body.consent),
    privacy_notice_version: validateOption_(
      body.privacy_notice_version,
      acceptedPrivacyNoticeVersions || [],
    ),
    submission_id: validateSubmissionId_(body.submission_id),
    elapsed_ms: validateElapsedMs_(body.elapsed_ms),
  };
  var fieldErrors = {};
  var lead = {};
  var hasErrors = false;
  Object.keys(checks).forEach(function (field) {
    if (checks[field].error) {
      fieldErrors[field] = checks[field].error;
      hasErrors = true;
    } else if (field !== 'elapsed_ms') {
      lead[field] = checks[field].value;
    }
  });
  if (hasErrors) {
    return { ok: false, fieldErrors: fieldErrors };
  }
  return { ok: true, lead: lead, elapsedMs: checks.elapsed_ms.value };
}
