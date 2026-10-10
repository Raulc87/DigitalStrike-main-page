# TECH_STACK — DigitalStrike Solutions main page

## Metadata
- Version: 0.1
- Status: Draft — pending human owner approval
- Owner: Raul Casañas
- Reference implementation: `Raulc87/gaby-main-page` (first SDD pilot: same frontend stack, Sheets + Calendly lead flow)

## 1. Complexity Assessment
**Simple.** A bilingual static page, one lead endpoint, one spreadsheet, two emails, one embed. One integration contract (frontend ↔ Apps Script) because two workstreams share it.

## 2. Hosting and Environment Constraints
- Hosting provider: **GitHub Pages** for preview and the first release (2026-10-14); **GoDaddy cPanel** (Linux shared hosting) for production once the plan and `digitalstrike-solutions.com` exist (ADR-001).
- Control panel/runtime: none needed by the site — it is static files. The lead endpoint runs on Google Apps Script (ADR-002).
- Deployment restrictions: cPanel accepts static files over FTPS/SFTP; no build runs on the server.
- Cost constraints: free tiers only (GitHub public repo, Google account, Calendly free).
- Portability: the static `dist/` runs on any web server; the endpoint URL is configuration.
- Runtime availability on the GoDaddy plan: **not required now** (no server code). Recorded in ADR-001 together with the Python path (ADR-002).
- Where the Sprint 001 deliverable runs: **public on GitHub Pages**, endpoint on Apps Script, sheet in the owner's Google Drive.

## 3. Selection Principle
Least-complex stack that meets the requirements, reusing what the pilot proved.

## 4. Frontend
- **Astro 5 (static output)** + **TypeScript (strict)** + **Tailwind CSS v4** (`@theme` tokens) — Node **22 LTS**.
- Fonts: `@fontsource/archivo`, `@fontsource/ibm-plex-mono` (self-hosted).
- Small vanilla TS modules for interactivity (language detection, menu, form controller, Calendly loader). No UI framework.
- Why: static HTML is fast and SEO-friendly, deploys anywhere, Astro i18n routing gives `/es/` and `/en/` (ADR-003); the pilot already validated the stack.
- Not selected: React/Vite SPA (client-rendered content hurts SEO for `/es` `/en`, more JS), Next.js (needs a Node server or export quirks), WordPress (not code-reviewable, plugin risk).

## 5. Backend
- **Google Apps Script web app** (V8 runtime, plain JavaScript) bound to nothing; it opens the sheet by `SHEET_ID` (ADR-002).
- Responsibilities: contract `docs/specs/LEAD_ENDPOINT_CONTRACT.md` — validate, throttle, store, email.
- Code lives in the repo under `apps-script/` (source of truth) and is copied to the Apps Script project manually or with `clasp` (runbook).
- Why: free, no server, no stored service-account keys, Sheets and Gmail are native, works with any static host including GitHub Pages.
- Future backend: Python (Flask/FastAPI) on cPanel or a cloud, later Java/Spring microservices on AWS — triggers and migration path in ADR-002 §Future.

## 6. Persistence
Google Sheets, worksheet `leads`, columns exactly as contract §6. No database.

## 7. Integrations
- Google Sheets + Gmail via Apps Script services (`SpreadsheetApp`, `MailApp`, `CacheService`, `LockService`, `PropertiesService`).
- Calendly inline embed (official `widget.js`), URL `https://calendly.com/rcasanas/1hr`.
- LinkedIn: plain link.

## 8. Testing
- Unit: **Vitest** — frontend logic (validation, language detection, API client, Calendly loader) and Apps Script pure logic (loaded into a Node `vm` context or exported via a tiny shim; the agent chooses and documents).
- End-to-end: **Playwright** (Chromium; desktop + 390 px project) against `astro preview` and the local mock endpoint (`scripts/mock-lead-endpoint.mjs`).
- Manual: the release smoke test against the real Apps Script (runbook).

## 8.1 Code Quality and Conventions
- ESLint (TS + Astro plugins), Prettier, `astro check`.
- Data/API fields `snake_case` (BR-007); TS identifiers `camelCase`; components `PascalCase.astro`.
- Localization: typed dictionaries `src/i18n/{es,en}/{content,form}.ts`, Spanish as source; a test asserts both languages have identical keys.

## 8.2 Local Development
- `npm run dev` (Astro) + `npm run mock:lead` (mock endpoint on 127.0.0.1:8787). `.env.example` lists every `PUBLIC_*` variable.
- Runbook: `docs/runbooks/LOCAL_DEVELOPMENT.md` (Windows/macOS notes from the pilot: Node 22 install, OneDrive locks, port conflicts).

## 9. CI/CD (GitHub Actions)
- `ci.yml` — on PR and push to `main`: install, lint, check, unit, build, e2e (mock).
- `pages.yml` — on push to `main` (and manual): build with Pages base path, deploy to GitHub Pages.
- `release-cpanel.yml` — on `release: published` (and manual): build for the root domain and upload to cPanel over FTPS; skipped with a notice while secrets are missing (ADR-001).

## 10. Hosting / Deployment
See ADR-001 and `docs/runbooks/RELEASE.md`, `docs/runbooks/DEPLOYMENT.md`.

## 11. Security and Secrets
- Repository *variables* (public): `PUBLIC_*` values, including the Apps Script URL (public by nature).
- Repository *secrets*: cPanel FTP credentials only.
- Apps Script Script Properties: sheet ID, emails, limits. Never committed.
- Server-side validation, HTML escaping in emails, formula-injection guard in the sheet, no personal data in logs.

## 12. Observability
- Apps Script execution log (errors with `lead_id` only).
- Sheet columns `owner_email_status` / `confirmation_email_status`.
- Optional later: a daily Apps Script trigger that emails the owner if any row has a `failed` email status.

## 13. Risks
- Apps Script quotas (consumer Gmail: ~100 email recipients/day, 6 min/execution): far above the 20–40 leads/90 days target; global throttle protects it.
- Apps Script cold start can take 1–3 s: the form shows "Enviando…"; 20 s client timeout.
- Response always HTTP 200: clients must read `ok` (contract §1).
- The owner's personal Gmail is the sender until the corporate mailbox exists (ADR-005).

## 14. Upgrade / Scaling Path
Change the backend (ADR-002 §Future) when any of these appear: authenticated users, payments, a client portal, more than one form/endpoint with shared logic, need for a real database or CRM, email volume beyond Gmail quotas, or the need to run AI features server-side.
