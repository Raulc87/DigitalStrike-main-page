# apps-script — lead endpoint

Google Apps Script web app that implements `docs/specs/LEAD_ENDPOINT_CONTRACT.md` v1.0
(ADR-002, ADR-004, ADR-005). Owner: Implementation Agent 3. Setup and deployment:
`docs/runbooks/APPS_SCRIPT_SETUP.md`.

## Files

| File | Role |
|---|---|
| `appsscript.json` | Manifest: V8, `America/Costa_Rica`, web app executed as the deploying user, access "Anyone"; scopes limited to Sheets and sending mail |
| `Code.js` | Entry points only: `doPost`, `doGet` (health), `setupSheet()`. Wires the Google services into the pure logic |
| `lib/constants.js` | Contract constants: limits, sheet columns A–S, statuses, enumerations with ES/EN labels (§4) |
| `lib/config.js` | Script Properties → typed configuration with the defaults of §8 |
| `lib/validation.js` | Body size, JSON parsing, honeypot, minimum fill time, normalization and validation (§3, §5 steps 1–5) |
| `lib/lead.js` | Costa Rica time, `lead_id`, row building with the formula-injection guard, reading a row back (§6) |
| `lib/throttle.js` | Per-email, hourly and daily throttles counted from the stored rows (§5.3) |
| `lib/sheet.js` | The `leads` sheet behind a small store interface; `setupLeadsSheet` |
| `lib/handler.js` | The pipeline of §5 (order, one script lock around steps 7–10, idempotency with recovery of `pending` emails, email statuses) and the response bodies of §7 |

Email templates (CONTENT §14) are added by DS-011 (US-011, US-012). Until then the email step
records `failed` for both emails; the lead is still stored.

## Design notes

- **One global scope.** Apps Script loads every file into one global scope in an order that is
  not guaranteed. The `lib/` files therefore only use top-level `function` and `var`
  declarations (no `import`/`export`, no top-level `const`/`let`) and no top-level code that
  reads another file's values. Helper names ending in `_` are file-private by convention.
- **Pure logic, injected services.** `handleLeadRequest(rawBody, deps)` receives the lock,
  the sheet store, the mailer, the clock and the logger, so the full flow runs in Node tests
  with fakes. Only `Code.js` touches `SpreadsheetApp`, `LockService`, `MailApp`,
  `PropertiesService` and `ContentService`.
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

The scaffold's root Vitest config includes `apps-script/tests/**`. Until it is merged, a
temporary local config is kept here:

```bash
npx vitest run --config apps-script/vitest.config.mjs
```

## Deploying

Code here is the source of truth. It is copied to the Apps Script project by hand or with
`clasp push` (`.claspignore` pushes only `appsscript.json`, `Code.js` and `lib/*.js`;
`.clasp.json` is owner-specific and git-ignored). See the runbook.
