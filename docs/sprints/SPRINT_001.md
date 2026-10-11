# SPRINT 001 — First release

## Metadata
- Status: **PLANNED — not started.** Starts only after this docs PR is merged and the human owner gives an explicit go-ahead (AGENTS.md).
- Duration: short release sprint (exception, IMPLEMENTATION_PLAN §6)
- Start: on go-ahead (target Saturday 2026-10-10)
- Release cut: Tuesday 2026-10-13, 18:00 America/Costa_Rica
- Demo: Wednesday 2026-10-14 (entrepreneur meet-up)
- Final reviewer: Raul Casañas

## Sprint Goal
Publish the first public, bilingual DigitalStrike Solutions page that explains the services, shows the team's work and the CEO, and turns visitors into leads (Google Sheet + owner email + visitor confirmation) and session-0 bookings (Calendly).

## Required Deliverable
- `https://digitalstrike-solutions.com` (GoDaddy cPanel, deployed by `release-cpanel.yml` from release `v0.1.0`) serving `/es/` and `/en/` with every section of UX §1, over HTTPS, replacing the holding page.
- Previews of `main` on `https://raulc87.github.io/DigitalStrike-main-page/` (`noindex`).
- Lead form → real Apps Script → row in the sheet with `status = new` → both emails received.
- Calendly inline visible and working.
- CI green on `main`; GitHub Release `v0.1.0` published and deployed to production by the workflow.

## Entry Gates

| # | Gate | Status |
|---|---|---|
| 1 | Repository exists and is public (`Raulc87/DigitalStrike-main-page`) | Done |
| 2 | Docs PR `DS-DOCS-discovery-specs` approved and merged (specs, contract, stories, UX, content, stack, ADRs, plan, this sprint) | **Open — owner** |
| 3 | `LEAD_ENDPOINT_CONTRACT.md` v1.0 locked (by merging gate 2) | **Open — owner** |
| 3b | Proposals PR `DS-DOCS-ux-proposals` (#2) merged after #1, so the approved visual reference `docs/ux/proposals/propuesta-a-v3-dugout-logo.html` exists on `main` before Agent 1 starts | **Open — owner** |
| 4 | Readiness checklist run (below) with no open blocking items | **Open — gates 2, 3, 3b, 6** |
| 5 | `main` protected in GitHub (PR required, no force push/deletion) | Recommended — owner |
| 6 | Explicit go-ahead from the human owner | **Open — owner** |

### Readiness checklist result (2026-10-09, before merge)

| Section | Result |
|---|---|
| 1. Repository and bootstrap | Paths in PROJECT_CONTEXT exist once this PR merges; AGENTS.md/CLAUDE.md unchanged from the kit; project key `DS`; branch per story listed below. **OK after merge.** |
| 2. Documentation consistency | Spec, stories, contract, UX, content, stack, plan and sprint agree on scope, field names (`snake_case`), statuses and behaviour; languages and selection rule stated (ADR-003); every FR maps to a story. **OK.** |
| 3. User stories | Every sprint story has testable ACs ("widths" defined); every story has an owner below. **OK.** |
| 4. Contracts and integrations | Contract v1.0 complete (endpoint, CORS, body, enums, processing order, sheet columns, responses, config, mock); failure behaviour defined for Sheets, email and Calendly; credentials rule stated (TECH_STACK §11). **OK — locks on merge.** |
| 5. Data, legal, security | Jurisdiction Costa Rica (Ley 8968); consent checkbox; privacy notice v1 `2026-10-14-v1` decided by the owner (retention 24 months confirmed; Calendly loading disclosed; Cinthia's review to follow); the version the visitor saw is stored per lead; spam protection and idempotency in scope (US-014). **OK.** |
| 5.1 UI | Visual identity **approved** 2026-10-10: proposal A v3, Palette 1 and the ball logo (UX §2; tokens mandatory). Go-live assets: logo kit (vector) ✅; photo ✅ provisional 200 px (≥ 800 px version: Raul, Sprint 002); final copy — all [CONFIRMAR] items answered 2026-10-10, **approved by merging this PR**. |
| 6. Stack and environment | GoDaddy Deluxe cPanel + `digitalstrike-solutions.com` bought 2026-10-10, AutoSSL active and HTTPS forced, Python apps supported (ADR-001/002); GitHub Pages for previews (public repo); local run defined (dev + mock); test/lint/CI/CD named. **OK.** Open for the deliverable (not blocking kickoff): FTP account + `CPANEL_*` secrets (owner, Mon). GoDaddy's injected script kept and disclosed (owner decision 2026-10-11, ADR-001). |
| 7. Parallelization | 3 agents assigned; ownership map, scaffold-first order, integration PR owner (Agent 2), conflict rule below. **OK.** |
| 7.1 Merge control | Every prompt in `SPRINT_001_AGENT_PROMPTS.md` states "never merge/approve"; review-only agent runs in its own session with the independence rule. **OK.** `main` protection: owner. |
| 8. Go-ahead | **Open** (after gates 2 and 3b). |

**Blocking items remaining:** gate 2 (merge this PR = approve specs, copy, privacy notice v1 and contract), gate 3b (merge PR #2 after this one, so the approved visual reference is on `main` before Agent 1 starts), gate 6 (go-ahead). Not blocking but needed for the deliverable, by Mon 2026-10-12 EOD (owner): Apps Script deployed + repository variables set; Pages enabled; cPanel FTP account + `CPANEL_*` secrets.

## Planned Stories

| Story | Owner | Depends on | Branch | Priority |
|---|---|---|---|---|
| US-001 Frontend scaffold & theme | Agent 1 | — | `DS-001-frontend-scaffold` | Must (Phase 0) |
| US-002 Languages, SEO | Agent 1 | US-001 | `DS-002-i18n-routing` | Must |
| US-003 Header, hero, value strip, footer | Agent 1 | US-001 | `DS-003-header-hero-footer` | Must |
| US-004 + US-005 Services cards, process & warranty | Agent 1 | US-001 | `DS-004-services-process` | Must |
| US-006 + US-007 + US-008 Showroom, CEO, clients | Agent 1 | US-001 | `DS-006-work-about-clients` | Must |
| US-009 + US-014 (client) Lead form | Agent 2 | US-001 | `DS-009-lead-form` | Must |
| US-018 Privacy notice | Agent 2 | US-009 | `DS-018-privacy-notice` | Must |
| US-013 Calendly | Agent 2 | US-001 | `DS-013-calendly` | Must |
| Integration e2e (US-009 AC8, US-013 AC4) | Agent 2 | Agent 3 mock + all above | `DS-009-integration-e2e` | Must |
| US-010 + US-014 (server) Apps Script endpoint | Agent 3 | Contract | `DS-010-apps-script-endpoint` | Must |
| US-011 + US-012 Emails | Agent 3 | US-010 | `DS-011-lead-emails` | Must |
| US-015 Mock and CI | Agent 3 | US-001 (CI), contract (mock) | `DS-015-mock-and-ci` | Must |
| US-016 Pages preview + RELEASE runbook | Agent 3 | US-001 | `DS-016-pages-deploy` | Must |
| US-017 cPanel production release workflow | Agent 3 | US-016 | `DS-017-cpanel-release` | Must (production on `digitalstrike-solutions.com`, ADR-001) |
| US-019 Look-and-feel proposals | Claude (docs) + owner | UX/CONTENT | `DS-DOCS-ux-proposals` | Done — proposal A chosen 2026-10-10 |
| US-020 Apply final palette | — | — | — | Withdrawn: palette approved before the build |

Agent 3 may branch `DS-015-mock-and-ci` in two PRs (mock first, CI after the scaffold merges); name the second `DS-015-ci-workflows`.

## File Ownership Map

An agent edits only files it owns. Changes needed in another owner's file are requested, not made.

| Path | Owner |
|---|---|
| `package.json`, lockfile, `astro.config.mjs`, `tsconfig.json`, ESLint/Prettier/Vitest/Playwright config | Agent 1 only. The scaffold pre-installs every dependency and npm script the sprint needs (Agent 1 prompt); anything else another agent needs is requested from Agent 1 through the owner (AGENTS.md) |
| `src/layouts/**`, `src/pages/**`, `src/components/sections/**`, `src/styles/**`, `src/i18n/index.ts`, `src/i18n/{es,en}/content.ts`, `src/lib/i18n/**`, `public/**` except `public/.htaccess` | Agent 1 |
| `src/components/lead/**`, `src/components/schedule/**`, `src/components/privacy/**`, `src/lib/lead/**`, `src/lib/schedule/**`, `src/i18n/{es,en}/form.ts`, `tests/e2e/**` | Agent 2 (stubs created by Agent 1 in Phase 0 are handed over on merge; Agent 1 renders `PrivacyNotice` inside the privacy pages) |
| `apps-script/**`, `scripts/**`, `.github/workflows/**`, `.env.example`, `public/.htaccess`, `docs/runbooks/**` | Agent 3 |
| `tests/unit/**` | Owner of the code under test |
| `docs/specs/**`, `docs/ux/**`, `docs/plans/**`, `docs/sprints/**`, `docs/decisions/**`, `docs/assets/**`, `AGENTS.md`, `PROJECT_CONTEXT.md`, `README.md`, `TECH_STACK.md` | Human owner (changes via `DS-DOCS-*` PRs) |
| `holding-page/**` (temporary page live until `v0.1.0`) | Human owner (changes via `DS-CHORE-*` or `DS-DOCS-*` PRs) |

## Integration Contract
`docs/specs/LEAD_ENDPOINT_CONTRACT.md` v1.0 — locked for this sprint. Enum labels are duplicated on purpose (Agent 2's `form.ts` for the form, Agent 3's email templates); both copy them verbatim from contract §4.

## Merge / Integration Order
1. `DS-001-frontend-scaffold` (Agent 1). Agent 2 starts after it merges. Agent 3's `DS-010` can merge in any order (it touches only `apps-script/`).
2. Phase 1 PRs in any order, each with green CI once CI exists. Suggested owner merge order: DS-015 (mock) → DS-002 → DS-003 → DS-009 → DS-010 → DS-011 → DS-015-ci → DS-004 → DS-006 → DS-013 → DS-018 → DS-016 → DS-017.
3. `DS-009-integration-e2e` (Agent 2) — integration PR owner.
4. Owner checks the Pages preview with the real endpoint, then publishes release `v0.1.0`; `release-cpanel.yml` deploys it to `digitalstrike-solutions.com`; owner runs the smoke test there (RELEASE.md).

## Conflict Resolution
- Resolved when found, by the human owner with the agent that owns the conflicting file.
- No agent rewrites another agent's files. Contract or requirement gaps → stop, change management (spec first).

## Review Model
- Implementation agents open focused PRs (template filled, ACs, evidence).
- Review-only agent posts a COMMENT review on each PR.
- Codex/automated reviewers, if enabled: handled per AGENTS.md.
- Human owner approves and merges.

## Sprint Definition of Done
- Must stories meet their ACs; CI green on `main`.
- Smoke test on `https://digitalstrike-solutions.com` passed with the real endpoint (row + 2 emails + Calendly, HTTPS, privacy notice discloses GoDaddy's logs, monitoring script and cookies, and the live cookies and injected script in a fresh browser profile still match that disclosure; production Lighthouse score recorded — US-016 AC3).
- No known critical regression; owner approves; `v0.1.0` released.

## Owner checklist (outside the agents)
- [ ] Review/approve this PR (copy in CONTENT.md, privacy notice v1, contract) and merge.
- [ ] Protect `main`; Settings → Pages → Source: GitHub Actions.
- [x] Approve the visual identity — proposal A v3, Palette 1, ball logo and tagline (2026-10-10).
- [x] Google Workspace with `manager@digitalstrike-solutions.com` configured; SPF, DKIM and DMARC published (2026-10-10).
- [ ] Signed in as `manager@digitalstrike-solutions.com`: create the leads sheet + Apps Script project, deploy, set Script Properties, put the `/exec` URL in repository variable `PUBLIC_LEAD_ENDPOINT_URL` (runbook from DS-010/DS-016).
- [x] Provisional photo supplied (200 px). A ≥ 800×800 px version later.
- [x] Buy the GoDaddy Deluxe plan and `digitalstrike-solutions.com`; SSL active, HTTPS forced, holding page live (2026-10-10).
- [ ] Create a dedicated cPanel FTP account limited to `public_html`; set repository secrets `CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_PASSWORD`, `CPANEL_TARGET_DIR` (runbook from DS-017) — by Mon.
- [x] GoDaddy's injected monitoring script: keep and disclose it (decision 2026-10-11); visitor statistics in cPanel Metrics → Awstats.
- [ ] Tuesday: publish release `v0.1.0` (deploys to GoDaddy), smoke test on `https://digitalstrike-solutions.com`.

Agent kickoff prompts and model recommendations: `docs/sprints/SPRINT_001_AGENT_PROMPTS.md`.
