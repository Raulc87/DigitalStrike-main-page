# IMPLEMENTATION_PLAN — DigitalStrike Solutions main page

## Metadata
- Version: 0.1
- Status: **Approved** by Raul Casañas — effective when PR #1 is merged
- Related: PROJECT_SPEC, USER_STORIES, LEAD_ENDPOINT_CONTRACT, UX_UI_DIRECTION, CONTENT, TECH_STACK, ADR-001…006

## 1. Delivery strategy

| Sprint | Window | Goal |
|---|---|---|
| **001 — First release** (short sprint, exception to the 7-day rule, see §6) | Go-ahead (target Sat 2026-10-10) → release cut **Tue 2026-10-13 18:00 (CR)** → demo Wed 2026-10-14 | Public bilingual page on `https://digitalstrike-solutions.com` (GoDaddy cPanel, deployed by CI/CD on release; previews on GitHub Pages) with services, showroom, CEO, working lead flow (sheet + 2 emails) and Calendly |
| 002 — Production and polish | Thu 2026-10-15 → Fri 2026-10-23 (7 business days) | High-resolution photo, logo text converted to outlines, Poliart screenshot, carry-overs |

## 2. Repository layout (target)

```
apps-script/              # Apps Script source (Agent 3)
  appsscript.json
  Code.js                 # doPost / doGet / setupSheet — thin wrappers
  lib/*.js                # pure logic: validation, throttle, row, lead_id, email templates
  tests/*.test.ts         # Vitest (Node) for lib/
scripts/mock-lead-endpoint.mjs
src/
  layouts/BaseLayout.astro
  pages/index.astro  pages/es/index.astro  pages/en/index.astro
  pages/es/privacidad.astro  pages/en/privacy.astro
  components/sections/*.astro
  components/lead/*        components/schedule/*   components/privacy/*
  i18n/index.ts  i18n/{es,en}/content.ts  i18n/{es,en}/form.ts
  lib/i18n/*  lib/lead/*  lib/schedule/*
  styles/global.css        # Tailwind v4 @theme tokens
public/brand/*  public/favicon.svg  public/.htaccess  public/og-image.png
tests/unit/**  tests/e2e/**
.github/workflows/ci.yml  pages.yml  release-cpanel.yml
docs/runbooks/LOCAL_DEVELOPMENT.md  APPS_SCRIPT_SETUP.md  RELEASE.md  DEPLOYMENT.md
```

## 3. Workstreams (3 implementation agents + 1 review-only)

| Agent | Workstream | Stories |
|---|---|---|
| Agent 1 | Site shell, content sections, i18n, SEO | US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008 |
| Agent 2 | Lead form, privacy notice, Calendly, e2e integration | US-009, US-013, US-014 (client), US-018 |
| Agent 3 | Apps Script endpoint and emails, mock, CI/CD, runbooks | US-010, US-011, US-012, US-014 (server), US-015, US-016, US-017 |
| Review-only | Comment-only reviews of every PR | — |

## 4. Sequencing

1. **Phase 0 (foundation, merged first):** `DS-001-frontend-scaffold` (Agent 1). Agent 3 starts at the same time on `apps-script/` and the mock, which do not depend on the scaffold.
2. **Phase 1 (parallel):** Agent 1 sections; Agent 2 form → privacy → Calendly (after the scaffold merges); Agent 3 endpoint → emails → CI → Pages preview → cPanel production release.
3. **Human owner (in parallel, by Mon 2026-10-12 EOD):** signed in as `manager@digitalstrike-solutions.com`, create the sheet and the Apps Script project from `apps-script/`, deploy, set Script Properties, set repository variables, enable Pages (source: GitHub Actions), protect `main` (runbook `APPS_SCRIPT_SETUP.md`); create the dedicated cPanel FTP account and set the `CPANEL_*` repository secrets (runbook `DEPLOYMENT.md`).
4. **Integration (Tue 2026-10-13):** Agent 2 `DS-009-integration-e2e` against the mock; owner checks the Pages preview with the real endpoint; review fixes.
5. **Release:** owner tags `v0.1.0` and publishes the GitHub Release; `release-cpanel.yml` deploys it to `https://digitalstrike-solutions.com` (replacing the holding page), then the owner runs the release smoke test there (`RELEASE.md`).

## 5. Testing strategy
- Contract rules are tested twice: client validation (Vitest, Agent 2) and server validation (Vitest on `apps-script/lib`, Agent 3), both from contract §3–5.
- E2E (Playwright, Agent 2) against `astro preview` + mock: ES/EN detection and toggle, happy path, validation errors, storage failure, rate limit, network failure, Calendly container and fallback, 390 px.
- Real endpoint: manual smoke test (RELEASE.md) before the release and after each Apps Script redeploy.
- Accessibility: Playwright + `@axe-core/playwright` on `/es/` and `/en/` (no serious/critical violations).

## 6. Process exception — short Sprint 001
The kit's sprint length is 7 business days. Sprint 001 is shortened to meet the 2026-10-14 meet-up; scope is cut to what the release needs (production deploy to GoDaddy included, US-017). The exception is approved when the owner approves this plan. Sprint 002 returns to 7 business days.

## 7. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Too little time for reviews and merges | Small PRs; review-only agent reviews as PRs open; owner merges in the order of SPRINT_001 |
| Apps Script not deployed in time | Mock keeps all tests green; the form shows the generic error with the `mailto` fallback if the endpoint is unset — the page is still demoable |
| Copy changes requested late | Copy lives only in CONTENT.md and the dictionaries; late edits are a dictionary change, not a layout change |
| No photo by Tuesday | Monogram placeholder (US-007 AC2) |
| Base-path bugs on Pages | CI builds with the Pages base path; e2e runs against that build |
| Production deploy fails on release day (FTP secrets, network) | Secrets set and a manual dry run of `release-cpanel.yml` by Mon 2026-10-12; the holding page stays live until the first successful upload; rollback = re-run on the previous tag |
