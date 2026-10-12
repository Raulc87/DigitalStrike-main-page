# apps-script — lead endpoint

Google Apps Script web app that implements `docs/specs/LEAD_ENDPOINT_CONTRACT.md` v1.0
(ADR-002, ADR-004, ADR-005). Owner: Implementation Agent 3. Setup and deployment:
`docs/runbooks/APPS_SCRIPT_SETUP.md`.

## Files

| File | Role |
|---|---|
| `appsscript.json` | Manifest: V8, `America/Costa_Rica`, web app executed as the deploying user, access "Anyone"; scopes limited to Sheets, `script.send_mail` (the `MailApp` quota check) and `gmail.send` (sending) |
| `Code.js` | Entry points only: `doPost`, `doGet` (health), `setupSheet()`. Wires the Google services into the pure logic |
| `lib/constants.js` | Contract constants: limits, sheet columns A–S, statuses, enumerations with ES/EN labels (§4) |
| `lib/config.js` | Script Properties → typed configuration with the defaults of §8 |
| `lib/validation.js` | Body size, JSON parsing, honeypot, minimum fill time, normalization and validation (§3, §5 steps 1–5) |
| `lib/lead.js` | Costa Rica time, `lead_id`, row building with the formula-injection guard, reading a row back (§6) |
| `lib/throttle.js` | Per-email, hourly and daily throttles counted from the stored rows (§5.3) |
| `lib/sheet.js` | The `leads` sheet behind a small store interface; `setupLeadsSheet` |
| `lib/gmail.js` | Maps a composed email to `GmailApp.sendEmail(recipient, subject, body, options)` (`replyTo` only when set) |
| `lib/emails.js` | Owner "cover letter" and visitor confirmation of CONTENT §14 (HTML + plain text, ES/EN, every visitor value HTML-escaped, Reply-To per ADR-005) |
| `lib/handler.js` | The pipeline of §5 (order, one script lock around steps 7–10, idempotency with recovery of `pending` emails, email statuses) and the response bodies of §7 |

## Design notes

- **One global scope.** Apps Script loads every file into one global scope in an order that is
  not guaranteed. The `lib/` files therefore only use top-level `function` and `var`
  declarations (no `import`/`export`, no top-level `const`/`let`) and no top-level code that
  reads another file's values. Helper names ending in `_` are file-private by convention.
- **Pure logic, injected services.** `handleLeadRequest(rawBody, deps)` receives the lock,
  the sheet store, the mailer, the clock and the logger, so the full flow runs in Node tests
  with fakes. Only `Code.js` touches `SpreadsheetApp`, `LockService`, `MailApp`, `GmailApp`,
  `PropertiesService` and `ContentService`.
- **Sending through GmailApp.** On the Workspace account, Gmail rejected `MailApp.sendEmail`
  messages to external addresses ("Message rejected"), while `GmailApp.sendEmail` messages
  were delivered (owner test, 2026-10-11). So emails are sent with `GmailApp`
  (scope `gmail.send`, never the broader `mail.google.com`). `MailApp.getRemainingDailyQuota()`
  still guards the shared recipients quota (scope `script.send_mail`).
- **Durable throttles and idempotency.** Both are read from the sheet under the script lock
  (column R for `submission_id`, columns A and E of the last `max(MAX_LEADS_PER_DAY,
  MAX_LEADS_PER_HOUR) + 1` rows for throttles). CacheService is not used: at this volume the
  sheet reads are cheap, and the contract allows the cache only as an optional optimisation.
- **Costa Rica time.** `America/Costa_Rica` has no daylight saving time, so dates are computed
  with a fixed UTC-06:00 offset in pure code; the manifest sets the same time zone.
- **Plain-text columns.** `setupSheet()` formats every data column except `consent` as plain
  text, so Sheets never turns `submitted_at` into a date or a phone number into a number.
- **No personal data in logs.** Log entries hold only event names, `lead_id`, error codes and
  the names of invalid fields (NFR-006).

## Tests

Vitest in Node. `tests/helpers/loadAppsScript.ts` reads `lib/*.js` (and `Code.js` when a test
needs the entry points) and runs them in a fresh **`node:vm` context**, the same way Apps
Script shares one global scope; top-level declarations become properties of that context.
This was chosen over a CommonJS/ESM shim because the deployed files stay exactly as they run in
Apps Script, with no export boilerplate. Fakes of the Google services are in
`tests/helpers/fakes.ts`.

The root Vitest config runs them as the `apps-script` project: `npm test` (or
`npx vitest run --project apps-script`).

## Lint

`apps-script/eslint.config.js` applies to this folder (ESLint looks up the nearest config per
file). It lints `Code.js` and `lib/*.js` as classic scripts and declares the Google services and
every top-level declaration of those files as globals, so `no-undef` still catches a missing
function; unused checks apply to locals only. The tests get the same TypeScript rules as the
root config. It reads the plugin rules directly instead of `tseslint.configs`, which would
register a second tsconfig root and break typescript-eslint for the whole repository.

## Deploying

Code here is the source of truth. It is copied to the Apps Script project by hand or with
`clasp push` (`.claspignore` pushes only `appsscript.json`, `Code.js` and `lib/*.js`;
`.clasp.json` is owner-specific and git-ignored). See the runbook.
