/**
 * Shared constants of the lead endpoint (LEAD_ENDPOINT_CONTRACT v1.0).
 *
 * Apps Script loads every file into one global scope, so lib files only use
 * top-level `var` and function declarations (see apps-script/README.md).
 */

/** Contract §2: maximum request body, in UTF-8 bytes. */
var MAX_BODY_BYTES = 10 * 1024;

/** Contract §5.2: minimum fill time, in milliseconds. */
var MIN_ELAPSED_MS = 3000;

/** Contract §3: `elapsed_ms` range. */
var MAX_ELAPSED_MS = 86400000;

/** Contract §5 step 6: lock wait, in milliseconds. */
var LOCK_WAIT_MS = 10000;

/**
 * America/Costa_Rica is UTC-06:00 all year (no daylight saving time since 1992),
 * so dates are computed with a fixed offset and need no Apps Script service.
 */
var COSTA_RICA_UTC_OFFSET_MINUTES = -360;

var SHEET_NAME = 'leads';

/** Contract §6: header row, exactly these columns in this order (A–S). */
var SHEET_COLUMNS = [
  'submitted_at',
  'status',
  'lead_id',
  'name',
  'email',
  'phone',
  'company',
  'project_type',
  'budget_range',
  'timeline',
  'message',
  'language',
  'consent',
  'privacy_notice_version',
  'owner_email_status',
  'confirmation_email_status',
  'notes',
  'submission_id',
  'last_contact_at',
];

/** 1-based column numbers, by column name (A = 1). */
var COLUMN = SHEET_COLUMNS.reduce(function (acc, name, i) {
  acc[name] = i + 1;
  return acc;
}, {});

/** FR-011 / BR-008: allowed lead statuses; `new` on creation. */
var LEAD_STATUSES = ['new', 'contacting', 'accepted', 'rejected'];

/** Contract §6 columns O and P. */
var EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  QUOTA_EXCEEDED: 'quota_exceeded',
};

/** Contract §4: enumerations with their labels, copied verbatim. */
var PROJECT_TYPES = {
  website: { es: 'Página web', en: 'Website' },
  web_app: {
    es: 'Aplicación web (catálogo, agenda, cursos…)',
    en: 'Web app (catalogue, bookings, courses…)',
  },
  business_system: {
    es: 'Sistema para mi empresa (inventario, reportes, procesos)',
    en: 'Business system (inventory, reporting, processes)',
  },
  custom_solution: {
    es: 'Solución a la medida / algo fuera de lo común',
    en: 'Custom solution / something unusual',
  },
  not_sure: { es: 'Aún no lo sé', en: 'Not sure yet' },
};

var BUDGET_RANGES = {
  under_1000: { es: 'Menos de US$1.000', en: 'Under US$1,000' },
  from_1000_to_3000: { es: 'US$1.000 – 3.000', en: 'US$1,000 – 3,000' },
  from_3000_to_10000: { es: 'US$3.000 – 10.000', en: 'US$3,000 – 10,000' },
  from_10000_to_25000: { es: 'US$10.000 – 25.000', en: 'US$10,000 – 25,000' },
  over_25000: { es: 'Más de US$25.000', en: 'Over US$25,000' },
  not_sure: { es: 'Aún no lo tengo definido', en: 'Not defined yet' },
};

var TIMELINES = {
  asap: { es: 'Lo antes posible', en: 'As soon as possible' },
  within_1_month: { es: 'En el próximo mes', en: 'Within a month' },
  within_3_months: { es: 'En los próximos 3 meses', en: 'Within 3 months' },
  flexible: { es: 'Sin prisa / flexible', en: 'Flexible' },
};

var LANGUAGES = ['es', 'en'];
