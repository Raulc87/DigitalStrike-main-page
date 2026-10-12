# SPRINT 002 — Post-release follow-ups

## Metadata
- Status: **PLANNED — not started.** Starts only after this docs PR is merged, the readiness check has no open blocking items and the human owner gives an explicit go-ahead (AGENTS.md). Exception: US-021 (Poliart screenshot) may ship as soon as the owner supplies the file (see "Release plan").
- Duration: 7 business days (IMPLEMENTATION_PLAN §6)
- Start: on go-ahead, after the meet-up (target Thursday 2026-10-15)
- Freeze: from the `v0.1.0` release until the end of the meet-up (Wednesday 2026-10-14) production only changes for US-021 or a production incident
- Final reviewer: Raul Casañas

## Sprint Goal
Polish the live site after `v0.1.0`: complete the showroom (Poliart screenshot), make the page faster on mobile, make the test suite fully reliable and close the operational loose ends from the first release, plus anything the meet-up feedback adds.

## Required Deliverable
- Release `v0.1.1` (or later patch releases) deployed to `https://digitalstrike-solutions.com` by `release-cpanel.yml`, with the smoke test (RELEASE.md §4) passed and recorded in the release description.
- CI green on `main`, with the six checks required by the `main` ruleset.

## Input: `v0.1.0` results (2026-10-12)
- Smoke test passed (owner, 2026-10-12 11:06 CR): HTTPS, `/es/` + `/en/` + toggle; leads ES and EN (rows, both emails, DKIM/SPF pass); Calendly; privacy notice ES/EN; third-party domains and cookies match the disclosed baseline.
- PageSpeed `/es/` (owner): mobile Performance 96, Accessibility 100. Lighthouse from the coordinator the same day: mobile 88 / 100 / 100 / 100, desktop 99 / 100 / 100 / 100 (Performance / Accessibility / Best practices / SEO). Mobile findings: Speed Index 6.9 s, main-thread work 2.2 s (0.9 s style and layout), the CEO photo loads eagerly below the fold (14 KB, about 8 KB saveable with a right-sized modern format), one render-blocking stylesheet (7 KB). The cache-policy and legacy-JavaScript warnings come from GoDaddy's injected script (`img1.wsimg.com`), accepted in ADR-001; not actionable by us.

## Planned Stories

| Story | Owner | Depends on | Branch | Priority |
|---|---|---|---|---|
| US-021 Poliart screenshot in the showroom | Owner (file) + Agent 1 | Owner supplies the image | `DS-021-poliart-screenshot` | **Must — first** |
| US-022 CEO photo: lazy loading and right-sized modern format | Agent 1 | — | `DS-022-photo-delivery` | Must |
| US-023 Mobile performance: main-thread and render-blocking CSS | Agent 1 | US-022 | `DS-023-mobile-performance` | Should |
| US-024 Reliable lead-flow e2e (`elapsed_ms` check) | Agent 2 | — | `DS-024-lead-flow-e2e-stability` | Must |
| US-025 Readable deploy logs (`CPANEL_TARGET_DIR` as a variable) | Agent 3 | — | `DS-025-deploy-log-masking` | Could |
| US-026 Staging lead endpoint for the preview (ADR-006) | Agent 3 + owner (console steps) | — | `DS-026-staging-endpoint` | Must |
| US-027 Urgent-fix procedure in RELEASE.md (ADR-006) | Agent 3 | — | `DS-027-urgent-fix-runbook` | Should |
| Meet-up feedback | Owner → docs PR | Meet-up 2026-10-14 | `DS-DOCS-meetup-feedback` | Added by change management |

Stories and acceptance criteria: `docs/specs/USER_STORIES.md` (US-021 … US-027). Branching and release model: ADR-006 (trunk-based on `main`, production = release tags, `release/vX.Y.x` only for urgent fixes).

## Release plan
- **US-021 first.** When the owner supplies the Poliart screenshot, Agent 1 adds it in a one-file PR; the owner merges it and publishes **`v0.1.1`**. If the file is ready before Wednesday 2026-10-14 noon (CR), it may be released before the meet-up, because it only adds an image (the card already switches from initials to the screenshot when the file exists, and the provisional badge disappears on the preview). Otherwise it ships with the rest of the sprint; the card keeps the "PI" initials meanwhile, which is acceptable in production.
- Everything else starts after the meet-up and ships as `v0.1.2` (or `v0.2.0` if the meet-up feedback adds features).

## Owner tasks (outside the agents)

| # | Task | When |
|---|---|---|
| 1 | **Poliart screenshot**: 1200×750 px JPG of the reporting platform, **sanitized** (demo data or blurred: no real customer, employee or financial data; Poliart agreed to be named, not to show its data) | As soon as possible — first item |
| 2 | Add required status checks to the `main` ruleset: `lint`, `typecheck`, `unit`, `build`, `e2e`, `lighthouse` | **Done** (2026-10-12) |
| 3 | Paste the `v0.1.0` smoke-test record and PageSpeed links into the release description (RELEASE.md §4.7) | **Done** (2026-10-12) |
| 4 | Collect meet-up feedback (questions visitors asked, confusing copy, requests); hand it to the coordinator for a docs PR | After 2026-10-14 |
| 5 | Larger CEO photo (≥ 800×800 px); when supplied, Agent 1 swaps it within US-022's pipeline | Optional |
| 6 | Email reputation: keep normal sending from `manager@` (replies help); optionally register the domain in Google Postmaster Tools; recheck whether Outlook/Hotmail still sends the confirmation to spam | **Done** (2026-10-12): set up; keep normal sending and recheck Outlook/Hotmail placement at sprint end |
| 7 | Legal review of privacy notice v1 by Cinthia; any change goes through CONTENT §13 with a new notice version (US-018 AC2 order: Apps Script `ACCEPTED_PRIVACY_NOTICE_VERSIONS` first) | When available |
| 8 | `holding-page/`: **kept as the emergency fallback** (owner decision 2026-10-12). If a release breaks production and no earlier tag fixes it, re-upload `holding-page/holding-page.zip` through cPanel File Manager (DEPLOYMENT.md §6 and `holding-page/README.md`) | **Done** (2026-10-12) |
| 9 | Add `release/*` to the branch ruleset (PR required, the six required checks, no force push or deletion), so an urgent-fix branch is protected like `main` (ADR-006) | Any time |
| 10 | US-026 console steps: create the staging sheet and Apps Script project as `manager@`, deploy it, set repository variable `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW` (runbook from DS-026) | During the sprint |

## File Ownership Map
Unchanged from Sprint 001 (`SPRINT_001.md`, "File Ownership Map"). In short: Agent 1 owns `src/layouts/**`, `src/pages/**`, `src/components/sections/**`, `src/styles/**`, `public/**` except `public/.htaccess`, and its section e2e specs; Agent 2 owns the lead/schedule/privacy components and the other e2e specs; Agent 3 owns `apps-script/**`, `scripts/**`, `.github/workflows/**`, `public/.htaccess` and `docs/runbooks/**`; docs and `holding-page/**` belong to the owner (via `DS-DOCS-*` PRs).

## Merge / Integration Order
1. `DS-021-poliart-screenshot` as soon as it exists → release `v0.1.1`.
2. After the meet-up, in any order with green CI: DS-024, DS-022, DS-025, DS-026, DS-027; then DS-023 (it measures against DS-022). DS-026 needs the owner's console steps (staging Apps Script + `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW`) before its AC3 check.
3. Meet-up feedback stories, if any, after their docs PR is merged.
4. Release, smoke test (RELEASE.md §4), record the production PageSpeed scores.

## Review Model
As in Sprint 001: focused PRs; the review-only agent posts a COMMENT review with full-file coverage on every PR (the owner, or the coordinator session on the owner's behalf, asks it to start); the human owner approves and merges.

## Sprint Definition of Done
- Must stories meet their ACs; CI green on `main` with the required checks.
- Production smoke test passed and recorded for every release in the sprint.
- CI `lhci` gate green (mobile Performance ≥ 95 once US-023 merges, ≥ 90 before); production PageSpeed recorded for every release per NFR-003: if GoDaddy's injected script pulls it below 90, the owner decides.
- No known critical regression; owner approves.

Agent kickoff prompts: written at go-ahead, following `SPRINT_001_AGENT_PROMPTS.md` (same agents and models).
