# SPRINT 002 — Post-release follow-ups

## Metadata
- Status: **DONE** — all stories merged; `v0.1.2` released and deployed to `https://digitalstrike-solutions.com` on 2026-10-19; production smoke test passed (owner). US-021 shipped earlier in `v0.1.1` (2026-10-13). Outcome and backlog: "Sprint outcome" below.
- Duration: 7 business days (IMPLEMENTATION_PLAN §6)
- Start: 2026-10-19 (go-ahead) · planned end: 2026-10-27 (7 business days)
- Freeze: ended with the meet-up (2026-10-14); during it production only changed for US-021 (`v0.1.1`)
- Final reviewer: Raul Casañas

## Entry gates (2026-10-19)

| # | Gate | Status |
|---|---|---|
| 1 | Sprint plan, stories US-022…US-027 with testable ACs, and ADR-006 merged (#32, #33, #34) | Done |
| 2 | Readiness checklist (below) with no open blocking item | Done |
| 3 | Agent prompts for this sprint (`SPRINT_002_AGENT_PROMPTS.md`) merged | Done (#38) |
| 4 | Explicit go-ahead from the human owner | **Done** (2026-10-19) |

### Readiness checklist result (2026-10-19)

| Section | Result |
|---|---|
| 1. Repository and bootstrap | Paths in PROJECT_CONTEXT exist; key `DS`; branch per story listed below; `AGENTS.md` and `CLAUDE.md` byte-identical to `sdd_starter_kit` main `b179c8d`. OK |
| 2. Documentation consistency | Stories, ADR-006, contract 1.0.1 §8 (preview variable), RELEASE/DEPLOYMENT runbooks and this plan agree; runbook edits are Agent 3's (US-026, US-027). OK |
| 3. User stories | US-022…US-027 have testable ACs (reviewed in #32/#34) and one owner each. OK |
| 4. Contracts and integrations | Lead contract 1.0.1 unchanged on the wire; staging endpoint (US-026) reuses it; no other interface changes. OK |
| 5. Data, legal, security | Privacy notice v1 unchanged (legal review pending, accepted risk, task 7); no new personal data. OK |
| 5.1 UI | No visual change except ones the owner approves in US-023's PR; CEO photo stays the 200 px source (task 5). OK |
| 6. Stack and environment | Same stack; CI with six required checks on `main`; production on `v0.1.1`. **Open (not blocking): previews still post to the production endpoint** (`pages.yml` uses `PUBLIC_LEAD_ENDPOINT_URL`, ADR-006 Gap 2) until US-026 merges and its AC3 passes. **Interim rule until then:** no test leads from the Pages preview; if one is sent anyway, set its row's `status` to `rejected` right away (as RELEASE.md §4.2 step 6 does for the smoke test). This suspends RELEASE.md §2 step 3 (test lead from the preview) until US-026 AC3; US-026 AC4 rewrites that step. US-026 needs the owner's Google console steps (task 10). **Closed 2026-10-19:** US-026 AC3 passed (preview lead in the staging sheet, none in production; recorded on #39), so the interim rule is lifted |
| 7. Parallelization | 3 agents, disjoint files per the Sprint 001 ownership map; no shared file between the stories. OK |
| 7.1 Merge control | Prompts state "never merge/approve"; review-only agent in its own session; the coordinator session follows `AGENTS.md` → Coordinator session (relays owner decisions, never writes code, never merges). OK |
| 8. Go-ahead | Given 2026-10-19. OK |

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
| US-021 Poliart screenshot in the showroom | Owner (file) + Agent 1 | Owner supplies the image | `DS-021-poliart-screenshot` | **Done** — #36/#35, released in `v0.1.1` (2026-10-13) |
| US-022 CEO photo: lazy loading and right-sized modern format | Agent 1 | — | `DS-022-photo-delivery` | **Done** — #40 (+ #41 docs), `v0.1.2` |
| US-023 Mobile performance: main-thread and render-blocking CSS | Agent 1 | US-022 | `DS-023-mobile-performance` | **Done** — #46 (+ #48 follow-up), `v0.1.2` |
| US-024 Reliable lead-flow e2e (`elapsed_ms` check) | Agent 2 | — | `DS-024-lead-flow-e2e-stability` | **Done** — #45, `v0.1.2` |
| US-025 Readable deploy logs (`CPANEL_TARGET_DIR` as a variable) | Agent 3 | — | `DS-025-deploy-log-masking` | **Done** — #42 (+ #44 docs), `v0.1.2`; dry run with readable paths (owner, 2026-10-19) |
| US-026 Staging lead endpoint for the preview (ADR-006) | Agent 3 + owner (console steps) | — | `DS-026-staging-endpoint` | **Done** — #39, `v0.1.2`; AC3 passed (owner, 2026-10-19) |
| US-027 Urgent-fix procedure in RELEASE.md (ADR-006) | Agent 3 | — | `DS-027-urgent-fix-runbook` | **Done** — #43, `v0.1.2` |

Stories and acceptance criteria: `docs/specs/USER_STORIES.md` (US-021 … US-027). Branching and release model: ADR-006 (trunk-based on `main`, production = release tags, `release/vX.Y.x` only for urgent fixes).

## Release plan
- **US-021 first.** When the owner supplies the Poliart screenshot, Agent 1 adds it in a one-file PR; the owner merges it and publishes **`v0.1.1`**. If the file is ready before Wednesday 2026-10-14 noon (CR), it may be released before the meet-up, because it only adds an image (the card already switches from initials to the screenshot when the file exists, and the provisional badge disappears on the preview). Otherwise it ships with the rest of the sprint; the card keeps the "PI" initials meanwhile, which is acceptable in production.
- Everything else ships as `v0.1.2` (patch: no new features; the meet-up feedback added none).

## Owner tasks (outside the agents)

| # | Task | When |
|---|---|---|
| 1 | **Poliart screenshot**: 1200×750 px JPG of the reporting platform, sanitized | **Done** (2026-10-13): supplied, sanitized (user name blurred, report list cropped out), released in `v0.1.1` |
| 2 | Add required status checks to the `main` ruleset: `lint`, `typecheck`, `unit`, `build`, `e2e`, `lighthouse` | **Done** (2026-10-12) |
| 3 | Paste the `v0.1.0` smoke-test record and PageSpeed links into the release description (RELEASE.md §4.7) | **Done** (2026-10-12) |
| 4 | Collect meet-up feedback | **Done** (2026-10-19): visitors reacted well and saw DigitalStrike as a new option; the audience was smaller than expected. No copy, scope or feature changes requested, so no new stories |
| 5 | Larger CEO photo (≥ 800×800 px); when supplied, Agent 1 swaps it within US-022's pipeline | **Deferred** (owner, 2026-10-19): no better photo yet; the current 200 px photo stays |
| 6 | Email reputation: keep normal sending from `manager@` (replies help); optionally register the domain in Google Postmaster Tools; recheck whether Outlook/Hotmail still sends the confirmation to spam | **Done** (2026-10-12): set up; keep normal sending and recheck Outlook/Hotmail placement at sprint end |
| 7 | Legal review of privacy notice v1 by Cinthia; any change goes through CONTENT §13 with a new notice version (US-018 AC2 order: Apps Script `ACCEPTED_PRIVACY_NOTICE_VERSIONS` first) | **Pending, accepted risk** (owner, 2026-10-19): her approval is still needed; until then notice v1 (`2026-10-14-v1`) stays as published |
| 8 | `holding-page/`: **kept as the emergency fallback** (owner decision 2026-10-12). If a release breaks production and no earlier tag fixes it, re-upload `holding-page/holding-page.zip` through cPanel File Manager (DEPLOYMENT.md §6 and `holding-page/README.md`) | **Done** (2026-10-12) |
| 9 | Add `release/*` to the branch ruleset (PR required, the six required checks with **"Require branches to be up to date before merging"** on, no force push or deletion), so an urgent-fix branch is protected like `main` (ADR-006) | **Done** (owner, 2026-10-19): `release/*` added to the ruleset after `v0.1.2`, before any release branch exists |
| 10 | US-026 console steps: create the staging sheet and Apps Script project as `manager@`, deploy it, set repository variable `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW` (runbook from DS-026) | **Done** (2026-10-19): staging copy live; AC3 passed |
| 11 | US-025 switch: create repository variable `CPANEL_TARGET_DIR` = `/`, dry run, delete the old secret after the release (DEPLOYMENT.md §2.1) | **Done** (2026-10-19): variable set, dry run with readable paths, secret deleted after `v0.1.2` |

## File Ownership Map
Unchanged from Sprint 001 (`SPRINT_001.md`, "File Ownership Map"). In short: Agent 1 owns `src/layouts/**`, `src/pages/**`, `src/components/sections/**`, `src/styles/**`, `public/**` except `public/.htaccess`, and its section e2e specs; Agent 2 owns the lead/schedule/privacy components and the other e2e specs; Agent 3 owns `apps-script/**`, `scripts/**`, `.github/workflows/**`, `public/.htaccess` and `docs/runbooks/**`; docs and `holding-page/**` belong to the owner (via `DS-DOCS-*` PRs).

## Merge / Integration Order
1. `DS-021-poliart-screenshot` as soon as it exists → release `v0.1.1`.
2. In any order with green CI: DS-024, DS-022, DS-025, DS-026, DS-027; then DS-023 (it measures against DS-022). DS-026 needs the owner's console steps (staging Apps Script + `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW`) before its AC3 check.
3. Release, smoke test (RELEASE.md §4), record the production PageSpeed scores.

## Review Model
As in Sprint 001: focused PRs; the review-only agent posts a COMMENT review with full-file coverage on every PR (the owner, or the coordinator session on the owner's behalf, asks it to start); the human owner approves and merges.

## Sprint Definition of Done
- Must stories meet their ACs; CI green on `main` with the required checks.
- Production smoke test passed and recorded for every release in the sprint.
- CI `lhci` gate green (mobile Performance ≥ 95 once US-023 merges, ≥ 90 before); production PageSpeed recorded for every release per NFR-003: if GoDaddy's injected script pulls it below 90, the owner decides.
- No known critical regression; owner approves.

Agent kickoff prompts: `docs/sprints/SPRINT_002_AGENT_PROMPTS.md` (fresh sessions for this sprint, same models as Sprint 001).

## Sprint outcome (2026-10-19)

### Delivered
- Every planned story is done (table above). `v0.1.2` was released on 2026-10-19, and the production smoke test (RELEASE.md §4) passed (owner); the record is in the release description.
- Two small follow-ups were approved by the owner and shipped in `v0.1.2`: **#47** (DS-015 fix: CI keeps the `lighthouse-reports` artifact, `include-hidden-files: true`) and **#48** (US-023 follow-up: the privacy pages no longer preload a font they do not use).
- CI `lhci` on our own build (from the #47 artifact): mobile Performance 0.99, Accessibility, Best practices and SEO 1, on `/es/` and `/en/`; CLS 0 after the font preloads (#46).

### Production PageSpeed (NFR-003)
- PageSpeed `/es/` mobile: Performance **94**, Accessibility 100 after `v0.1.2` (owner, release description). On `v0.1.0` PageSpeed gave 96 (input section above), so production is flat within PageSpeed's run-to-run noise, not a gain; the 88 recorded for `v0.1.0` came from a different tool (the coordinator's own Lighthouse run). Above the NFR-003 production threshold of 90.
- The remaining gap to our build's 0.99 comes mainly from GoDaddy's injected monitoring script (ADR-001). **Owner decision (2026-10-19): accepted; GoDaddy will not be asked to remove the script.**

### Owner decisions on the deferred options (2026-10-19)
- Fewer or variable font files: **declined**; the fonts stay as they are. Subsetting the existing files (same families) was not decided; it is listed in the backlog.
- Asking GoDaddy to remove its script: **declined** (above).

### Backlog (candidates for a later sprint; not committed)

The owner confirmed (2026-10-19) that the "some follow ups needed for next release" note in the `v0.1.2` release description refers to the items below.

| Item | Source | Notes |
|---|---|---|
| Metric-adjusted fallback font (`size-adjust` / `ascent-override`) so text does not shift when web fonts arrive late | US-023 review (#46) | Keeps the same fonts; changes only the brief pre-swap rendering, so it needs the owner's approval. Gain is small on phones whose fallback is close to Archivo |
| `content-visibility` on below-the-fold sections | US-023 (#46) | No score change measured; anchor-jump risk; one e2e check would need rewriting |
| `lhci` median-run aggregation | US-023 (#46) | A stricter, less noisy gate |
| RELEASE.md §6.5: say to push to staging from the `DS-FIX` branch checkout, and put the inline `git checkout main` in a command block | Review of #43 | Wording only |
| Font subsetting (same families, fewer bytes) | US-023 (#46) | Does not touch the layout-shift cause; characters outside the subset typed into the form would fall back to another font |
| Larger CEO photo (≥ 800×800 px) | Task 5 | When the owner has one; US-022 serves 2× automatically |
| Privacy notice legal review (Cinthia) | Task 7 | Pending, accepted risk |
| **Security baseline story (kit v1.1.0, required)**: write `docs/security/SECURITY_BASELINE.md` from the kit's `SECURITY_BASELINE_TEMPLATE.md`, with the ASVS 5.0.0 inventory scaled to the project (the lead form handles personal data, so every requirement of the chosen level is listed, covered or marked not applicable with the reason), the OWASP Top 10 (2025) risks that apply as testable acceptance criteria in the stories that touch them, the NIST SSDF mapping, and secret and dependency scanning in CI. Plus `docs/security/PENTEST_PLAN.md` from the kit's `PENTEST_PLAN_TEMPLATE.md` | Kit v1.1.0 (`AGENTS.md` → Security baseline, Document map) | Planned for the next sprint; the baseline must be approved by the end of that sprint. **PTES penetration test required** (live site, personal data): before the next production release, unless the owner records a dated deadline in the baseline; once that deadline passes, the test gates every release. Run only by people the owner authorizes in writing, under a written scope; never by an implementation agent, and no attack tools or scans against production by agents. OSSTMM only if the baseline classifies the project as high-risk or complex |
| **Developer guide story (kit v1.1.0)**: write `CONTRIBUTING.md` at the repository root from the kit's `docs/DEVELOPER_GUIDE_TEMPLATE.md` (setup, commands, structure, conventions from `TECH_STACK.md` and the runbooks) | Kit v1.1.0 (`AGENTS.md` → Document map, Code readability) | Planned for the next sprint; from then on, a PR that changes setup, commands or structure updates it |
