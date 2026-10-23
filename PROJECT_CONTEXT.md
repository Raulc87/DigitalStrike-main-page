# Project Context

## Project
- Name: DigitalStrike Solutions — main page
- Project key: **DS** (branches `DS-<NNN>-<slug>` / `DS-<TYPE>-<slug>`, PR titles `[DS-NNN]`, commits `DS-NNN:`; see `AGENTS.md`)
- Repository: https://github.com/Raulc87/DigitalStrike-main-page
- Starter Kit: https://github.com/Raulc87/sdd_starter_kit (private: attach it to the sessions that read its templates, guides and skills) · Edition: Full · Synced to kit v1.1.0. This is the project's only record of its kit version: templates, guides and kit skills such as `/ux-proposals` are read from the kit at this ref, and each kit sync PR updates it.
- Repository visibility: public, as the owner's portfolio (owner decision, kit #16) · current setting public
- Status: **`v0.1.2` live on https://digitalstrike-solutions.com (2026-10-19); Sprint 002 done; no sprint active**
- Product owner / final reviewer: Raul Casañas (CEO, manager@digitalstrike-solutions.com)
- Documentation level: Simple (the kit's "Documentation depth")

## Active documentation
- Project spec: `docs/specs/PROJECT_SPEC.md`
- User stories: `docs/specs/USER_STORIES.md`
- Integration contracts: `docs/specs/LEAD_ENDPOINT_CONTRACT.md` (1.0.1)
- Feature specs: Not required (simple project)
- Architecture spec: Not required (simple project; architecture in TECH_STACK + ADRs)
- UX/UI direction: `docs/ux/UX_UI_DIRECTION.md`
- Content (ES source → EN): `docs/ux/CONTENT.md`
- Brand assets: `docs/assets/brand/`
- Tech stack: `TECH_STACK.md`
- ADRs: `docs/decisions/` (ADR-001 … ADR-006)
- Implementation plan: `docs/plans/IMPLEMENTATION_PLAN.md`
- Sprint plans: `docs/sprints/SPRINT_002.md` (done; outcome and backlog at the end; prompts: `docs/sprints/SPRINT_002_AGENT_PROMPTS.md`) and `docs/sprints/SPRINT_001.md` (done). No sprint is active
- Readiness checklist: `docs/checklists/SPRINT_READINESS_CHECKLIST.md`
- Runbooks: `docs/runbooks/` (created by Agent 3 during Sprint 001)
- Visual identity process: `docs/process/VISUAL_IDENTITY_PROCESS.md` (`/ux-proposals` runs from the kit)
- Kit process guides kept as local copies: `docs/process/VISUAL_IDENTITY_PROCESS.md` and `docs/process/RUNBOOK_STYLE.md`, byte-identical to the kit at the recorded ref, kept because this repo's runbooks, sprint prompts and this file link to them. **The kit at the recorded ref wins**; each kit sync re-copies them unchanged, and they are never edited here
- Security baseline: `docs/security/SECURITY_BASELINE.md`: not written yet; planned in the backlog (`SPRINT_002.md` → "Sprint outcome"), to be approved by the end of the next sprint (`AGENTS.md` → Document map)
- Penetration-test plan: `docs/security/PENTEST_PLAN.md`: required (live site with a lead form, which is personal data); planned with the security baseline
- Developer guide: `CONTRIBUTING.md`: not written yet; planned in the backlog for the next sprint

## Current sprint
- None active. Next sprint: to be planned with the owner, from the backlog in `SPRINT_002.md` → "Sprint outcome".
- Last: Sprint 002 — Post-release follow-ups — **done** 2026-10-19; `v0.1.1` (2026-10-13) and `v0.1.2` (2026-10-19) released and smoke-tested
- Before: Sprint 001 — done; `v0.1.0` released and smoke-tested 2026-10-12

## Agent allocation
- Implementation Agent 1: Site shell, sections, i18n, SEO — Sonnet 5.5
- Implementation Agent 2: Lead form, privacy, Calendly, e2e integration — Opus 5.5
- Implementation Agent 3: Apps Script endpoint + emails, mock, CI/CD, runbooks — Opus 5.5
- Review-only Agent: Opus 5.5, separate session, comment-only
- Conflict resolution: human owner with the agent owning the conflicting file

## Important constraints
- Branching and releases: trunk-based on `main` (always releasable), production = release tags, `release/vX.Y.x` only for urgent fixes; lead endpoint has a staging copy for the preview (ADR-006)
- Hosting: GoDaddy cPanel (Deluxe, `digitalstrike-solutions.com`, bought 2026-10-10) for production, deployed on GitHub Release; GitHub Pages for previews of `main` (ADR-001)
- Backend: Google Apps Script + Google Sheets + Gmail (ADR-002, ADR-005); Python/Java roadmap in ADR-002
- Languages / locales: Spanish (source) and English; `/es/`, `/en/`; browser detection + saved toggle (ADR-003)
- Naming conventions: data/API fields English `snake_case`; TS `camelCase`; components `PascalCase`
- Personal data / legal jurisdiction: Costa Rica, Ley 8968; consent checkbox; privacy notice v1 (`2026-10-14-v1`) published; Cinthia's legal review pending, accepted risk (owner, 2026-10-19)
- Where the sprint deliverable runs: public on `https://digitalstrike-solutions.com`, endpoint on Apps Script

## Open questions
- Logo lockups: convert the wordmark text to outlines before printing / trademark filing (owner)
- Raul's photo ≥ 800×800 px: deferred (owner, 2026-10-19); the 200 px photo stays
- Cami's sign-off on the approved identity (Origo governance; does not block the build)
- Legal review of privacy notice v1 (Cinthia): pending; notice v1 stays until she approves or asks for changes
