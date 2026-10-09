# LEAD_ENDPOINT_CONTRACT — Save Lead (Google Apps Script)

## Metadata
- Version: 1.0
- Status: Draft — becomes **LOCKED** for Sprint 001 when this PR is approved and merged
- Related spec: `docs/specs/PROJECT_SPEC.md` (FR-010 to FR-018, BR-007 to BR-009, NFR-006)
- Related stories: US-009, US-010, US-011, US-012, US-014
- Related ADRs: ADR-002 (Apps Script backend), ADR-004 (spam protection), ADR-005 (email)
- Consumer: lead form in the static site (Agent 2)
- Provider: Google Apps Script web app (Agent 3)

Any change follows `AGENTS.md` change management: update this document first, bump the version, notify both owning agents.

## 1. Conventions

- Field names, codes and identifiers: English, `snake_case`. Encoding: UTF-8.
- Visitor-facing text never comes from the response. The frontend maps `error_code` and field error codes to localized copy (`docs/ux/CONTENT.md` §Form).
- **Apps Script web apps always answer HTTP 200** (they cannot set status codes). The **response body is the source of truth**. A future backend (ADR-002) must return the same body; it may also use HTTP status codes, and clients must not depend on them.

## 2. Endpoint

| Item | Value |
|---|---|
| Method | `POST` |
| URL | The Apps Script deployment URL `https://script.google.com/macros/s/<deployment_id>/exec`, provided to the frontend as `PUBLIC_LEAD_ENDPOINT_URL` (public by design; not a secret) |
| Request header | `Content-Type: text/plain;charset=utf-8` — **no other custom headers**. This keeps the request a CORS "simple request" (no preflight, which Apps Script cannot answer). The body is a JSON string. |
| Fetch options | `method: "POST"`, `redirect: "follow"`, `credentials: "omit"`. Apps Script answers with a 302 to `script.googleusercontent.com`, which returns the JSON with `Access-Control-Allow-Origin: *`. |
| Response content type | `application/json` (via `ContentService.MimeType.JSON`) |
| Max body | 10 KB (larger → `payload_too_large`) |
| Client timeout | 20 s; on timeout the client shows the network error state (§7) |
| Authentication | None (public form). Apps Script deployment: *Execute as: Me (owner)*, *Who has access: Anyone*. |

## 3. Request body

```json
{
  "name": "Ana María Pérez",
  "email": "ana.perez@example.com",
  "phone": "+506 8888 0000",
  "company": "Panadería La Esquina",
  "project_type": "web_app",
  "budget_range": "from_1000_to_3000",
  "timeline": "within_3_months",
  "message": "Quiero un catálogo en línea con pedidos por WhatsApp para mi panadería.",
  "language": "es",
  "consent": true,
  "website": "",
  "form_started_at": 1760035200000
}
```

| Field | Type | Required | Rules (client AND server) | Stored as |
|---|---|---|---|---|
| `name` | string | yes | Trim; collapse inner whitespace. 2–100 characters. Unicode letters, spaces, `'` `’` `-` `.` only. | normalized |
| `email` | string | yes | Trim, lowercase. ≤ 254 chars; must match `^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,63}$`; local part must not start/end with `.` or contain `..`. | normalized |
| `phone` | string \| null | no | Empty/absent → `""`. Otherwise strip spaces, `-`, `(`, `)`, `.`; result must match `^\+?[0-9]{7,15}$`. | normalized or `""` |
| `company` | string \| null | no | Trim; ≤ 100 chars. Empty/absent → `""`. | trimmed or `""` |
| `project_type` | string (enum) | yes | §4.1 | code |
| `budget_range` | string (enum) | yes | §4.2 | code |
| `timeline` | string (enum) | yes | §4.3 | code |
| `message` | string | yes | Trim. 20–2000 characters. Line breaks allowed. | trimmed |
| `language` | string (enum) | yes | `es` or `en` (page language at submit time). | code |
| `consent` | boolean | yes | Must be JSON `true`. | `TRUE` |
| `website` | string \| null | no | Honeypot (§5.1). Never stored. | — |
| `form_started_at` | number | yes | Epoch milliseconds when the form was first rendered/focused (client clock). Used for the minimum fill time (§5.2). Never stored. | — |

Unknown fields are ignored. Wrong JSON types are validation errors (`invalid_type`).

Spreadsheet formula injection: any stored text value starting with `=`, `+`, `-` or `@` is prefixed with an apostrophe `'` before writing (applies to `name`, `company`, `message`, `phone`).

## 4. Enumerations

### 4.1 `project_type`
| Code | ES label | EN label |
|---|---|---|
| `website` | Página web | Website |
| `web_app` | Aplicación web (catálogo, agenda, cursos…) | Web app (catalogue, bookings, courses…) |
| `business_system` | Sistema para mi empresa (inventario, reportes, procesos) | Business system (inventory, reporting, processes) |
| `custom_solution` | Solución a la medida / algo fuera de lo común | Custom solution / something unusual |
| `not_sure` | Aún no lo sé | Not sure yet |

### 4.2 `budget_range` (USD)
| Code | ES label | EN label |
|---|---|---|
| `under_1000` | Menos de US$1.000 | Under US$1,000 |
| `from_1000_to_3000` | US$1.000 – 3.000 | US$1,000 – 3,000 |
| `from_3000_to_10000` | US$3.000 – 10.000 | US$3,000 – 10,000 |
| `from_10000_to_25000` | US$10.000 – 25.000 | US$10,000 – 25,000 |
| `over_25000` | Más de US$25.000 | Over US$25,000 |
| `not_sure` | Aún no lo tengo definido | Not defined yet |

### 4.3 `timeline`
| Code | ES label | EN label |
|---|---|---|
| `asap` | Lo antes posible | As soon as possible |
| `within_1_month` | En el próximo mes | Within a month |
| `within_3_months` | En los próximos 3 meses | Within 3 months |
| `flexible` | Sin prisa / flexible | Flexible |

## 5. Processing order (server)

1. Body larger than 10 KB → `payload_too_large`.
2. Body is not valid JSON or not an object → `invalid_json`.
3. **Honeypot** (§5.1) → decoy success, stop.
4. **Minimum fill time** (§5.2) → decoy success, stop.
5. Field validation (§3) → `validation_failed` with every field error.
6. **Throttles** (§5.3) → `rate_limited`.
7. Store the row (§6) under `LockService` (script lock, wait ≤ 10 s). Failure → `storage_unavailable`.
8. Send the owner notification, then the visitor confirmation (ADR-005). Each failure is caught, recorded in the row (`owner_email_status` / `confirmation_email_status` = `failed`), and does **not** change the response.
9. Respond success.

### 5.1 Honeypot
`website` absent, `null` or empty after trim → normal. Any other value or type → bot: respond the normal success body with a random `lead_id`, store nothing, send nothing.

### 5.2 Minimum fill time
If `form_started_at` is a number and `now - form_started_at < 3000` ms → treated as a bot (decoy success, nothing stored). If it is missing or not a number → `validation_failed` (`form_started_at: required`). Values in the future by more than 24 h are treated as missing.

### 5.3 Throttles (CacheService)
- Per email: at most `MAX_LEADS_PER_EMAIL_PER_HOUR` (default 3) accepted leads per normalized email per rolling hour.
- Global: at most `MAX_LEADS_PER_HOUR` (default 30) accepted leads per hour (protects the Gmail daily quota).
- Exceeded → `rate_limited` with `retry_after_seconds`. Apps Script cannot see the client IP; no IP is ever stored.

## 6. Google Sheet

Spreadsheet: owned by the owner's Google account; worksheet name `leads`. Row 1 is the header with **exactly** these columns, in order:

| # | Column | Value |
|---|---|---|
| A | `submitted_at` | Server time in `America/Costa_Rica`, formatted `yyyy-MM-dd HH:mm:ss` |
| B | `status` | `new` on creation. Data-validation dropdown: `new`, `contacting`, `accepted`, `rejected` |
| C | `lead_id` | `DS-` + `yyyyMMdd` + `-` + 6 random uppercase alphanumerics, e.g. `DS-20261014-K7Q2XM` |
| D | `name` | normalized |
| E | `email` | normalized |
| F | `phone` | normalized or empty |
| G | `company` | trimmed or empty |
| H | `project_type` | code |
| I | `budget_range` | code |
| J | `timeline` | code |
| K | `message` | trimmed |
| L | `language` | `es` / `en` |
| M | `consent` | `TRUE` |
| N | `privacy_notice_version` | from Script Property `PRIVACY_NOTICE_VERSION` |
| O | `owner_email_status` | `sent` / `failed` / `skipped` |
| P | `confirmation_email_status` | `sent` / `failed` / `skipped` |
| Q | `notes` | empty; for the owner's manual notes |

`skipped` is used when the email is disabled by configuration (`SEND_EMAILS=false`). Rows are appended; the script never edits `status` or `notes` after creation.

## 7. Response body

Success (also the decoy success):
```json
{ "ok": true, "lead_id": "DS-20261014-K7Q2XM" }
```

Error:
```json
{
  "ok": false,
  "error_code": "validation_failed",
  "message": "One or more fields are invalid.",
  "field_errors": { "email": "invalid_format", "message": "too_short" }
}
```

| `error_code` | When | Extra fields | Frontend behaviour |
|---|---|---|---|
| `validation_failed` | §3 rules | `field_errors` | Show localized error per field; keep data |
| `invalid_json` | Unparseable body | — | Generic error + retry |
| `payload_too_large` | > 10 KB | — | Generic error |
| `rate_limited` | §5.3 | `retry_after_seconds` | "Too many attempts" message; keep data |
| `storage_unavailable` | Sheet write failed | — | "Could not send, try again or email us" with mailto fallback; keep data |
| `internal_error` | Anything unexpected | — | Same as `storage_unavailable` |

Field error codes: `required`, `invalid_type`, `too_short`, `too_long`, `invalid_format`, `invalid_option`, `must_be_true`.

Network failure, timeout, non-JSON response or a body without boolean `ok` → the frontend treats it as `internal_error`.

`message` is a short English string for troubleshooting only; never shown to visitors.

## 8. Configuration

### Apps Script — Script Properties (set in the Apps Script editor; never committed)
| Property | Example / default | Notes |
|---|---|---|
| `SHEET_ID` | `1AbC…` | Spreadsheet ID of the leads sheet |
| `OWNER_NOTIFICATION_EMAIL` | `rcasanas@gmail.com` | Recipient of the "cover letter" (BR-009) |
| `REPLY_TO_EMAIL` | `rcasanas@gmail.com` | Reply-To for the visitor confirmation |
| `SENDER_NAME` | `DigitalStrike Solutions` | Display name of emails |
| `CALENDLY_URL` | `https://calendly.com/rcasanas/1hr` | Used in the confirmation email |
| `SITE_URL` | `https://raulc87.github.io/DigitalStrike-main-page` | Used in emails |
| `PRIVACY_NOTICE_VERSION` | `2026-10-14-v1` | Stored with each lead |
| `SEND_EMAILS` | `true` | `false` → emails `skipped` (testing) |
| `MAX_LEADS_PER_EMAIL_PER_HOUR` | `3` | §5.3 |
| `MAX_LEADS_PER_HOUR` | `30` | §5.3 |

### Frontend — build-time variables (`.env`, GitHub repository *variables*, not secrets)
| Variable | Example |
|---|---|
| `PUBLIC_LEAD_ENDPOINT_URL` | Apps Script `/exec` URL; locally `http://127.0.0.1:8787/exec` (mock, §9) |
| `PUBLIC_CALENDLY_URL` | `https://calendly.com/rcasanas/1hr` |
| `PUBLIC_CONTACT_EMAIL` | `rcasanas@gmail.com` |
| `PUBLIC_LINKEDIN_URL` | `https://www.linkedin.com/in/raul-casanas/` |
| `PUBLIC_SITE_URL` | `https://raulc87.github.io` (Pages) / `https://digitalstrike-solutions.com` |
| `PUBLIC_BASE_PATH` | `/DigitalStrike-main-page` (Pages) / `/` (own domain) |
| `PUBLIC_SHOW_CLIENT_LOGOS` | `true` / `false` (FR-009) |
| `PUBLIC_SHOW_PENDING_BADGES` | `true` in preview builds, `false` in production |

## 9. Local mock

`scripts/mock-lead-endpoint.mjs` (Agent 3) serves `POST /exec` on `127.0.0.1:8787` implementing this contract (validation, honeypot, fill time, an in-memory store, CORS `*`), plus `GET /__leads` to inspect stored rows in tests. Setting the mock env var `MOCK_FAIL=storage` makes every valid request return `storage_unavailable`. The Playwright e2e suite runs against this mock; the real Apps Script is verified manually (runbook smoke test).
