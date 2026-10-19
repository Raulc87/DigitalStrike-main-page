# USER_STORIES — DigitalStrike Solutions main page

## Metadata
- Version: 0.2 (2026-10-10: contract pre-lock revisions, click-to-load Calendly, Lighthouse check, proposal A, photo)
- Status: **Approved** by Raul Casañas — effective when PR #1 is merged
- Related: `PROJECT_SPEC.md`, `LEAD_ENDPOINT_CONTRACT.md`, `docs/ux/UX_UI_DIRECTION.md`, `docs/ux/CONTENT.md`
- Story IDs map to branches `DS-<NNN>-<slug>` (AGENTS.md). "Widths" always means 360, 390, 768, 1024 and 1440 px.

Common acceptance criteria for every UI story (**AC-UI**):
- AC-UI1: All copy comes from the i18n dictionaries and matches CONTENT.md verbatim in ES and EN.
- AC-UI2: No horizontal scroll at the widths; touch targets ≥ 44×44 px.
- AC-UI3: Colours and fonts only through theme tokens (UX §2.1); all text pairs pass WCAG AA.
- AC-UI4: Keyboard-operable with visible focus.

---

## US-001 — Frontend scaffold and theme (foundation)
As the team, we need a project skeleton so three agents can work in parallel.
- AC1: Astro (static output) + TypeScript (strict) + Tailwind CSS v4 with the approved tokens of UX §2.1 defined in `@theme`; Archivo and IBM Plex Mono self-hosted with `@fontsource`.
- AC2: npm scripts `dev`, `build`, `preview`, `lint`, `check`, `test`, `test:e2e` exist and pass on the scaffold.
- AC3: Pages `/es/` and `/en/` compose stub components for every section of UX §1 with the right anchors; `src/components/lead/LeadForm.astro` and `src/components/schedule/Scheduling.astro` exist as stubs handed to Agent 2.
- AC4: `astro.config.mjs` reads `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` so the same code builds for GitHub Pages (`/DigitalStrike-main-page/`) and for a root domain; all internal links and assets respect the base path.
- AC5: The approved logo kit is copied unchanged from `docs/assets/brand/` to `public/brand/`, and `favicon.svg` to `public/favicon.svg`; the header shows `logo-mark-on-dark.svg` plus the live wordmark of UX §2.1.

## US-002 — Languages: routing, detection, toggle, SEO
As a visitor, I see the page in my language and can switch it.
- AC1: `/` redirects to the saved `ds_lang` if present; otherwise `/es/` when the first preferred browser language starts with `es`, otherwise `/en/`. Without JS, `/` shows links to both.
- AC2: The `ES | EN` toggle is visible at every width, goes to the same section on the other page and saves `ds_lang`; a later visit to `/` honours it.
- AC3: Each page has `lang`, unique title/description (CONTENT §1), canonical URL, `hreflang` alternates `es`, `en`, `x-default` (→ `/`), Open Graph tags with a 1200×630 PNG built from `logo-horizontal-dark.svg` on the navy token.
- AC4: `sitemap.xml` and `robots.txt` are generated with the correct site URL and base path. When `PUBLIC_NOINDEX=true` (Pages preview), every page has `<meta name="robots" content="noindex">` and `robots.txt` disallows all.
- AC5: Vitest covers the detection function (es-CR, es, es-419, en-US, fr-FR, empty list, saved preference wins, storage throws).

## US-003 — Header, hero, value strip, footer
- AC1: Header as UX §3 (sticky; mobile menu focus-trapped, closes on Esc and on link click; inline nav ≥ 1200 px, menu button below).
- AC2: Hero shows eyebrow, title, subtitle, slogan and two CTAs to `#contacto` and `#agenda`.
- AC3: Value strip shows the three items of CONTENT §4.
- AC4: Footer shows CONTENT §12 with `mailto:` from `PUBLIC_CONTACT_EMAIL`, LinkedIn from `PUBLIC_LINKEDIN_URL` (new tab, `rel="noopener"`) and the privacy page link.
- AC-UI.

## US-004 — Services tier cards
- AC1: Five cards (A, B, C, D, customisations) with title, for whom, includes, and the CTA; no price anywhere (BR-001).
- AC2: The CTA moves to `#contacto` and preselects the card's `project_type` in the form; without JS it still jumps to the form.
- AC3: The note of CONTENT §5 is shown under the grid.
- AC-UI.

## US-005 — How we work and warranty
- AC1: Four steps with numbers `01`–`04`; horizontal ≥ 1024 px, vertical below.
- AC2: Warranty highlight text exactly as CONTENT §6; no mention of refunds (BR-003).
- AC-UI.

## US-006 — Showroom
- AC1: Three cards per CONTENT §7; public repos link to GitHub in a new tab with `rel="noopener"`; the private project shows the "private" label and no link.
- AC2: Images are screenshots when available, otherwise the initials placeholder, with a pending badge in preview builds.
- AC-UI.

## US-007 — About the CEO
- AC1: Name, role, three paragraphs and facts chips per CONTENT §8; figures only from the CV (BR-002).
- AC2: Photo slot shows `public/images/raul-casanas.jpg` (copied from `docs/assets/photos/raul-casanas-200.jpg`, rendered at most 200 CSS px wide while it is the 200 px version) and falls back to the "RC" monogram if the file is missing; replacing it with a high-resolution photo needs only the new file and one size constant.
- AC3: LinkedIn button opens `PUBLIC_LINKEDIN_URL` in a new tab.
- AC-UI.

## US-008 — Clients section (companies Raul has worked with)
- AC1: The section shows `clients.title`, `clients.note` and the four logos listed in CONTENT §9, in that order, each with `clients.logo_alt` as alt text. The logo files are self-hosted under `public/images/clients/` (no third-party request, NFR-005), shown in one light/monochrome treatment, not linked. No wording presents them as DigitalStrike clients (BR-002, BR-004). (Revised 2026-10-12; it was four placeholder slots.)
- AC2: `PUBLIC_SHOW_CLIENT_LOGOS=false` removes the section and its nav entry (if any) from the build.
- AC-UI.

## US-009 — Lead form (client side)
As a visitor, I can describe my need and send it.
- AC1: Fields, order, labels, hints and option labels as UX §3 and CONTENT §10 / contract §4.
- AC2: Client validation implements every rule of contract §3 with the localized messages of CONTENT §10; errors on blur and on submit; on submit with errors, focus moves to the error summary.
- AC3: The request is exactly as contract §2–3 (`text/plain` JSON body, `redirect: follow`, `credentials: omit`, 20 s timeout), including `language`, `privacy_notice_version` (from `PUBLIC_PRIVACY_NOTICE_VERSION`), `website` (honeypot), `elapsed_ms` (monotonic time since first render) and `submission_id` (UUID v4 kept across retries of an unchanged payload, renewed after a success or when a field changes after a failed attempt, contract §5.4).
- AC4: Every `error_code` of contract §7, network errors, timeouts and malformed responses map to the right message; data and `submission_id` are kept on any error, so an unchanged retry cannot create a duplicate lead; editing any field after an error renews `submission_id` (contract §5.4).
- AC5: Submit disabled with "Enviando…" while pending; double submission impossible.
- AC6: On `ok: true` the form is replaced by the thank-you block (focus moves to it) with the visitor's first name; the copy confirms receipt; it may point to the confirmation email and the spam folder, but never states that an email was sent (sending can be `skipped`, `failed` or `quota_exceeded` while the lead is saved).
- AC7: Consent checkbox unchecked by default and required; the privacy dialog opens without losing typed data and closes with Esc.
- AC8: Vitest: a valid and an invalid case per rule; the client maps every response type. Playwright (against the mock): happy path ES and EN at 390 px and desktop, validation errors, `storage_unavailable`, `rate_limited`, network failure.

## US-010 — Lead endpoint (Apps Script): validate and store
As the owner, every lead lands in my Google Sheet.
- AC1: `doPost` implements contract §5 in that order, including idempotency (§5.4) and the daily cap (§5.3); `doGet` returns `{ "ok": true, "service": "ds-lead-endpoint" }` for health checks.
- AC2: A valid lead appends one row with columns A–S in contract §6 order, `submitted_at` in America/Costa_Rica `yyyy-MM-dd HH:mm:ss`, `status = new`, `lead_id` format as specified, formula-injection prefixing applied.
- AC3: A `setupSheet()` function creates the `leads` worksheet header and the `status` dropdown (`new`, `contacting`, `accepted`, `rejected`) idempotently.
- AC4: Sheet write failure → `storage_unavailable`; unexpected exception → `internal_error`; personal data never appears in `console.log`/Stackdriver logs (only `lead_id` and error codes).
- AC5: Pure logic (validation, normalization, enums, throttle decisions, lead_id, row building, email rendering) is in files testable with Vitest in Node; tests cover every rule and error code.
- AC6: `docs/runbooks/APPS_SCRIPT_SETUP.md` includes the owner's data procedures: updating `last_contact_at`, the monthly retention review (delete rows older than 24 months from `last_contact_at`, or `submitted_at` when empty) and handling access/correction/deletion requests within 5 business days, matching the privacy notice. Deletion steps cover the sheet row and the Gmail copies (owner notification by `lead_id`, visitor confirmation in Sent by address, then Trash), per PROJECT_SPEC §7.
- AC7: `docs/runbooks/APPS_SCRIPT_SETUP.md` has the owner create the sheet and the Apps Script project while signed in as `manager@digitalstrike-solutions.com` (ADR-005), and check that the Workspace admin settings allow a web app with "Anyone" access before deploying.

## US-011 — Owner notification email ("cover letter")
- AC1: After the row is stored, an email is sent to `OWNER_NOTIFICATION_EMAIL` with subject and body of CONTENT §14.1, `Reply-To` = visitor email, HTML + plain-text.
- AC2: All visitor values are HTML-escaped.
- AC3: Failure is caught and recorded as `owner_email_status = failed`; success `sent`; `SEND_EMAILS=false` → `skipped`; remaining MailApp quota < 1 → `quota_exceeded` without attempting. The response to the visitor is unaffected. The row is appended with the status `pending`; a retry with the same `submission_id` sends the email only while it is still `pending` (contract §5.4 recovery).

## US-012 — Visitor confirmation email
- AC1: After the owner email attempt, the visitor receives CONTENT §14.2 in the submitted `language`, from `SENDER_NAME`, `Reply-To` = `REPLY_TO_EMAIL`, with the Calendly link.
- AC2: Same escaping and status recording as US-011 (`confirmation_email_status`).
- AC3: Not sent for honeypot/fill-time decoys, rate-limited requests or idempotent repeats (known `submission_id`), except the contract §5.4 recovery: a repeat sends it once if its status is still `pending`.

## US-013 — Scheduling (Calendly inline)
- AC1: The `#agenda` section shows a preview card with the `schedule.open` button and the `schedule.notice` line; **no request to Calendly is made until** the visitor clicks the button or submits the form successfully. Then the official inline widget for `PUBLIC_CALENDLY_URL` loads in place (UX §3).
- AC2: After a successful submission the widget is (re)initialized with name and email prefilled.
- AC3: `PUBLIC_CALENDLY_URL` defaults to `https://calendly.com/rcasanas/1hr` (contract §8) when unset, so a valid URL always exists. If the Calendly script fails or nothing renders within 10 s, the fallback link to that URL (new tab) is shown; a `<noscript>` link always exists.
- AC4: Playwright checks that no request to `*.calendly.com` happens before the click, the container after it, and the fallback (Calendly network blocked in tests).

## US-014 — Spam protection
- AC1 (client, Agent 2): honeypot per UX §3 "Autofill and honeypot" (own form outside the lead form, non-autofill `id`/`name`, the four password-manager ignore attributes, off-screen, `tabindex="-1"`, `aria-hidden` wrapper, Enter in it never reloads), its value sent as `website`, and `elapsed_ms` sent. The visible fields carry the `autocomplete` values of that table. Tests assert this structure, and that a filled lead form (as autofill would leave it) submits with `website` empty and is stored.
- AC2 (server, Agent 3): honeypot, minimum fill time, hourly/daily throttles and idempotency per contract §5.1–5.4 (counted from the stored rows under the script lock, contract §5.3–5.4; CacheService only as an optional optimisation); decoys return the normal success body and store nothing.
- AC3: Tests cover each path, including that rate-limited requests are not stored and send no email.

## US-015 — Local mock, CI
- AC1: `scripts/mock-lead-endpoint.mjs` per contract §9; `npm run mock:lead` starts it.
- AC2: GitHub Actions on every PR and push to `main`: `npm ci`, lint, `astro check`, Vitest (frontend + Apps Script logic), build, Playwright e2e against the built site and the mock.
- AC3: CI never uses real Google endpoints or credentials.
- AC4 (NFR-003): a CI job runs Lighthouse CI (`@lhci/cli`, mobile preset, 3 runs) against the built `/es/` and `/en/` pages served locally and fails below Performance 0.90 or Accessibility 0.95. Calendly is not loaded (click-to-load), so it does not affect the score.

## US-016 — Preview on GitHub Pages and release runbook
- AC1: A workflow deploys `main` to GitHub Pages with `PUBLIC_BASE_PATH=/DigitalStrike-main-page` and the public variables from repository *variables*. The preview is for review only and is never linked publicly; the privacy notice scopes the GoDaddy paragraph to `digitalstrike-solutions.com`. The preview build sets `PUBLIC_NOINDEX=true` (US-002 AC4), so the preview never competes with `digitalstrike-solutions.com` in search (ADR-001).
- AC2: `https://raulc87.github.io/DigitalStrike-main-page/` serves the site; `/es/` and `/en/` work, assets load, and the form submits to the real Apps Script endpoint once `PUBLIC_LEAD_ENDPOINT_URL` is set.
- AC3: `docs/runbooks/RELEASE.md` explains how to cut a release (tag `vX.Y.Z` + GitHub Release, which triggers US-017) and the smoke test on `https://digitalstrike-solutions.com`:
  - both languages, over HTTPS;
  - submit a test lead, check the row and both emails, then mark the test row `rejected`;
  - Calendly visible;
  - the privacy notice in both languages mentions GoDaddy's access logs, monitoring script and cookies (ADR-001);
  - in a fresh browser profile, the cookies set on the domain and the injected script still match the disclosure (CONTENT §13, PROJECT_SPEC §7: `_tccl_visitor` up to 1 year, `_tccl_visit`, `_scc_session`, script from `img1.wsimg.com`, beacons to `csp.secureserver.net`). Any new cookie, a longer lifetime or a new third-party domain → update the notice before announcing the release (ADR-001 review trigger);
  - Lighthouse (PageSpeed Insights, mobile) on `https://digitalstrike-solutions.com/es/`: record the Performance and Accessibility scores; below 90 / 95 → owner decision per NFR-003.

## US-017 — Release deployment to GoDaddy cPanel (production)
- AC1: A workflow triggered by `release: published` builds with `PUBLIC_BASE_PATH=/` and `PUBLIC_SITE_URL` = production URL, and uploads `dist/` to the cPanel document root over FTPS (or SSH/rsync if available), using repository *secrets* `CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_PASSWORD` (or key), `CPANEL_TARGET_DIR` (a repository variable, default `/`, from US-025 in Sprint 002; a secret until then).
- AC2: If the secrets are missing, the job is skipped with a clear notice instead of failing. (For `v0.1.0` the owner sets them by Mon 2026-10-12, so the release does deploy.)
- AC3: `.htaccess` (in `public/`) redirects HTTP→HTTPS (as the live holding page already does), disables directory listing, sets a 404 page, and does not break `/es/` and `/en/`.
- AC4: `docs/runbooks/DEPLOYMENT.md` lists the one-time GoDaddy steps and how to roll back (re-run the workflow on the previous release). Steps:
  - create a dedicated FTP account limited to `public_html`;
  - set the four secrets;
  - check that AutoSSL is active (already done 2026-10-10);
  - where to see visitor statistics (cPanel Metrics → Awstats / Visitors).
- AC5: The upload replaces the holding page: files that are no longer in `dist/` (the holding page's `index.html` and `assets/`) are removed from the target directory, and nothing outside it is touched (e.g. a state file or an explicit clean of the holding-page paths).

## US-018 — Privacy notice
- AC1: Dialog from the form and pages `/es/privacidad/`, `/en/privacy/` with CONTENT §13 text, including its version line (no other status text).
- AC2: The version shown is `PUBLIC_PRIVACY_NOTICE_VERSION`; the runbook states that it must be listed in the Apps Script `ACCEPTED_PRIVACY_NOTICE_VERSIONS` before a frontend with a new version is deployed.
- AC-UI.

## US-021 — Poliart screenshot in the showroom (Sprint 002)
- AC1: `public/images/work/poliart.jpg` exists, 1200×750 px, JPG, ≤ 200 KB; the Poliart card shows it instead of the "PI" initials, with the same alt text pattern as the other cards, and the preview's provisional badge on that card disappears (Work.astro already switches on the file's presence).
- AC2: The image is sanitized: it shows no real customer, employee or financial data (demo data or blurred), confirmed by the owner in the PR.
- AC3: The work e2e spec asserts the Poliart image loads from our domain and no card shows initials.
- AC4: In the same release, a `DS-DOCS-*` PR removes the **[PROVISIONAL]** marker from CONTENT §7 "Images" (all three cards then have screenshots).

## US-022 — CEO photo delivery (Sprint 002)
- AC1: The About photo is lazy-loaded (`loading="lazy"`, `decoding="async"`) with explicit width and height (no layout shift).
- AC2: It is served in a modern format (AVIF or WebP, JPG fallback) at the displayed size. A 2× variant (`srcset`) is produced only when the source is at least twice the displayed size; with the current 200 px source (owner decision 2026-10-19), 1× only, never upscaled, still capped at 200 CSS px. A larger source (≥ 800×800, owner) can replace it later without code changes and then gets the 2× variant.
- AC3: In the CI `lhci` report, the CEO photo is not listed among offscreen or oversized images (audits `offscreen-images` and `image-delivery-insight`, or their successors in the Lighthouse version in use).

## US-023 — Mobile performance (Sprint 002)
- AC1: The PR contains a profile write-up for `/es/` on the Lighthouse mobile preset: what drives the main-thread style/layout time and the Speed Index, and which of those causes the PR fixes, within the approved visual identity (e.g. costly effects or animations on mobile, `content-visibility` for below-the-fold sections, critical CSS inlined so no stylesheet blocks the first render).
- AC2: In the CI `lhci` run of our own build (the NFR-003 gate), mobile Performance ≥ 95 on `/es/` and `/en/`; `lighthouserc.json` is raised to assert `minScore: 0.95` for performance. Accessibility, Best practices and SEO stay at 100. No visual change other than ones the owner approves in the PR. The production PageSpeed score is recorded after release (RELEASE.md §4.6) but is not an acceptance criterion: it also measures GoDaddy's injected script (NFR-003, ADR-001).
- AC3: Findings caused by GoDaddy's injected script are listed as not actionable (ADR-001), not worked around.

## US-024 — Reliable lead-flow e2e (Sprint 002)
- AC1: The lead-flow spec no longer depends on wall-clock timing under load (the `elapsed_ms >= 3000` assertion that failed once on a busy machine): time is controlled in the test (e.g. Playwright clock) or the assertion checks the contract rule without racing.
- AC2: The spec passes 20 consecutive runs locally and in CI (`--repeat-each`), evidence in the PR. No test is skipped, disabled or loosened beyond the contract's rule.

## US-025 — Readable deploy logs (Sprint 002)
- AC1: The release workflow reads the target folder from the repository **variable** `CPANEL_TARGET_DIR` (default `/`), not a secret, so GitHub no longer masks every `/` in the logs; host, user and password stay secrets. This revises US-017 AC1 and ADR-001 (Implementation Impact). The skip-with-notice check (US-017 AC2) now covers only the three secrets `CPANEL_HOST`, `CPANEL_USERNAME` and `CPANEL_PASSWORD`; an unset variable means `/`.
- AC2: DEPLOYMENT.md §2 and the "masked logs" note are updated; a dry run shows readable file lists.

## US-026 — Staging lead endpoint for the preview (Sprint 002, ADR-006)
- AC1: A second Apps Script project, created and deployed as `manager@digitalstrike-solutions.com` from the same `apps-script/` code, with its own sheet named `DigitalStrike leads (staging)` (`leads` tab, same header) and its own Script Properties, including `SHEET_ID` of the staging sheet and `ACCEPTED_PRIVACY_NOTICE_VERSIONS` (US-018 AC2's order now applies to both projects: list a new notice version in staging and production before a build showing it is deployed). Owner does the console steps; Agent 3 writes them in APPS_SCRIPT_SETUP.md.
- AC2: `pages.yml` builds the preview with `PUBLIC_LEAD_ENDPOINT_URL: ${{ vars.PUBLIC_LEAD_ENDPOINT_URL_PREVIEW }}`; `release-cpanel.yml` keeps `PUBLIC_LEAD_ENDPOINT_URL`. When the preview variable is unset, the preview build warns and the form shows its error with the email fallback (never falls back to production).
- AC3: A lead sent from the Pages preview lands in the staging sheet and not in the production sheet (owner check, recorded in the PR).
- AC4: RELEASE.md and APPS_SCRIPT_SETUP.md say: Apps Script changes go to staging first and are tested from the preview; the production deployment gets the new version only as part of a release, followed by the smoke test. In particular, RELEASE.md §1.2 ("`PUBLIC_LEAD_ENDPOINT_URL` … used by both the preview and the production build") and the APPS_SCRIPT_SETUP §7 "no-terminal alternative" (testing production through the preview) are corrected.

## US-027 — Urgent-fix procedure in the release runbook (Sprint 002, ADR-006)
- AC1: RELEASE.md has an "Urgent fix" section with ADR-006 Decision 4: create `release/vX.Y.x` from the last tag, fix PR against it, publish the patch release with that branch as Target, then bring the fix to `main`. It states the gate that replaces §3's preconditions for such a release: the fix PR's six checks green on its head and the PR up to date with the release branch, no preview step, and the production smoke test right after deploy (rollback to the previous tag if it fails). Optionally `ci.yml` also runs on `push` to `release/**`.
- AC2: It states when not to use it (nothing unreleased on `main` → fix on `main` as usual) and that the owner adds `release/*` to the branch ruleset with the six required checks and **"Require branches to be up to date before merging"** enabled, so the gate in AC1 is enforced by GitHub.
- AC3: `release-cpanel.yml` is confirmed (no change expected) to deploy the release's tag regardless of the target branch; the PR cites the checkout line (`ref: ${{ github.event_name == 'release' && github.event.release.tag_name || … }}`).

## US-019 — Look-and-feel proposals (owner decision) — DONE 2026-10-10
- AC1: 2–3 HTML proposals with the brand palette, logo and fonts, built with the `ux-proposals` skill and the approved copy, published for the owner. *(PR #2)*
- AC2: The owner's choice and date are recorded in UX §2.2. *(Proposal A v3 — Dugout with Palette 1 and the ball logo, approved by Raul on 2026-10-10.)*

## US-020 — Apply the final palette — WITHDRAWN 2026-10-10
The final palette and logo were approved before the build started (UX §2), so Sprint 001 builds them directly and this story is not needed. Kept for traceability; a future palette change would be a new story.

## Traceability

| FR / BR | Stories |
|---|---|
| FR-001–003 | US-002 |
| FR-004, FR-019 | US-003 |
| FR-005 | US-004 |
| FR-006 | US-005 |
| FR-007 | US-006 |
| FR-008 | US-007 |
| FR-009 | US-008 |
| FR-010 | US-009 |
| FR-011 | US-010 |
| FR-012 | US-011 |
| FR-013 | US-012 |
| FR-014 | US-010, US-011, US-012 |
| FR-015 | US-009, US-013 |
| FR-016 | US-013 |
| FR-017 | US-009, US-018 |
| FR-018 | US-014 |
| NFR-001–005, NFR-007 | US-001, US-002, all UI stories |
| NFR-006 | US-010, US-015, US-016, US-017 |
| Hosting | US-016, US-017 |
