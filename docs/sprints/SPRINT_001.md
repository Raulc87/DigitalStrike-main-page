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
- `https://raulc87.github.io/DigitalStrike-main-page/` serving `/es/` and `/en/` with every section of UX §1.
- Lead form → real Apps Script → row in the sheet with `status = new` → both emails received.
- Calendly inline visible and working.
- CI green on `main`; GitHub Release `v0.1.0` published.

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
| 6. Stack and environment | GitHub Pages capability confirmed (public repo); GoDaddy runtime not needed (ADR-001/002); local run defined (dev + mock); test/lint/CI named. **OK.** |
| 7. Parallelization | 3 agents assigned; ownership map, scaffold-first order, integration PR owner (Agent 2), conflict rule below. **OK.** |
| 7.1 Merge control | Every prompt in `SPRINT_001_AGENT_PROMPTS.md` states "never merge/approve"; review-only agent runs in its own session with the independence rule. **OK.** `main` protection: owner. |
| 8. Go-ahead | **Open** (after gates 2 and 3b). |

**Blocking items remaining:** gate 2 (merge this PR = approve specs, copy, privacy notice v1 and contract), gate 3b (merge PR #2 after this one, so the approved visual reference is on `main` before Agent 1 starts), gate 6 (go-ahead). Not blocking but needed for the deliverable: Apps Script deployed + repository variables set by Mon 2026-10-12 EOD (owner), Pages enabled (owner).

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
| US-016 Pages deploy + RELEASE runbook | Agent 3 | US-001 | `DS-016-pages-deploy` | Must |
| US-017 cPanel release workflow | Agent 3 | US-016 | `DS-017-cpanel-release` | Stretch (Must in Sprint 002, PROJECT_SPEC §3) |
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
| `docs/specs/**`, `docs/ux/**`, `docs/plans/**`, `docs/sprints/**`, `docs/decisions/**`, `docs/assets/**`, `AGENTS.md`, `PROJECT_CONTEXT.md`, `README.md` | Human owner (changes via `DS-DOCS-*` PRs) |

## Integration Contract
`docs/specs/LEAD_ENDPOINT_CONTRACT.md` v1.0 — locked for this sprint. Enum labels are duplicated on purpose (Agent 2's `form.ts` for the form, Agent 3's email templates); both copy them verbatim from contract §4.

## Merge / Integration Order
1. `DS-001-frontend-scaffold` (Agent 1). Agent 2 starts after it merges. Agent 3's `DS-010` can merge in any order (it touches only `apps-script/`).
2. Phase 1 PRs in any order, each with green CI once CI exists. Suggested owner merge order: DS-015 (mock) → DS-002 → DS-003 → DS-009 → DS-010 → DS-011 → DS-015-ci → DS-004 → DS-006 → DS-013 → DS-018 → DS-016.
3. `DS-009-integration-e2e` (Agent 2) — integration PR owner.
4. Owner smoke test on Pages with the real endpoint (RELEASE.md), then tag `v0.1.0`.

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
- Smoke test on the Pages URL passed with the real endpoint (row + 2 emails + Calendly).
- No known critical regression; owner approves; `v0.1.0` released.

## Owner checklist (outside the agents)
- [ ] Review/approve this PR (copy in CONTENT.md, privacy notice v1, contract) and merge.
- [ ] Protect `main`; Settings → Pages → Source: GitHub Actions.
- [x] Approve the visual identity — proposal A v3, Palette 1, ball logo and tagline (2026-10-10).
- [ ] Create the leads sheet + Apps Script project, deploy, set Script Properties, put the `/exec` URL in repository variable `PUBLIC_LEAD_ENDPOINT_URL` (runbook from DS-010/DS-016).
- [x] Provisional photo supplied (200 px). A ≥ 800×800 px version later.
- [ ] Tuesday: smoke test, publish release `v0.1.0`.

Agent kickoff prompts and model recommendations: `docs/sprints/SPRINT_001_AGENT_PROMPTS.md`.
