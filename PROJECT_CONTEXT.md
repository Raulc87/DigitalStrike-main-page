# Project Context

## Project
- Name: DigitalStrike Solutions — main page
- Project key: **DS** (branches `DS-<NNN>-<slug>` / `DS-<TYPE>-<slug>`, PR titles `[DS-NNN]`, commits `DS-NNN:`; see `AGENTS.md`)
- Repository: https://github.com/Raulc87/DigitalStrike-main-page
- Starter Kit: https://github.com/Raulc87/sdd_starter_kit
- Status: **`v0.1.0` live on https://digitalstrike-solutions.com (2026-10-12); Sprint 002 planned**
- Product owner / final reviewer: Raul Casañas (CEO, manager@digitalstrike-solutions.com)

## Active documentation
- Project spec: `docs/specs/PROJECT_SPEC.md`
- User stories: `docs/specs/USER_STORIES.md`
- Integration contracts: `docs/specs/LEAD_ENDPOINT_CONTRACT.md` (v1.0)
- Feature specs: Not required (simple project)
- Architecture spec: Not required (simple project; architecture in TECH_STACK + ADRs)
- UX/UI direction: `docs/ux/UX_UI_DIRECTION.md`
- Content (ES source → EN): `docs/ux/CONTENT.md`
- Brand assets: `docs/assets/brand/`
- Tech stack: `TECH_STACK.md`
- ADRs: `docs/decisions/` (ADR-001 … ADR-006)
- Implementation plan: `docs/plans/IMPLEMENTATION_PLAN.md`
- Active sprint plan: `docs/sprints/SPRINT_002.md` (previous: `docs/sprints/SPRINT_001.md`, done; prompts: `docs/sprints/SPRINT_001_AGENT_PROMPTS.md`)
- Readiness checklist: `docs/checklists/SPRINT_READINESS_CHECKLIST.md`
- Runbooks: `docs/runbooks/` (created by Agent 3 during Sprint 001)
- Visual identity process: `docs/process/VISUAL_IDENTITY_PROCESS.md`

## Current sprint
- Sprint: 002 — Post-release follow-ups
- Goal: Poliart screenshot (first), mobile performance, reliable e2e, operational loose ends, meet-up feedback
- Start: on go-ahead, after the meet-up (target 2026-10-15); US-021 may ship earlier as `v0.1.1`
- Duration: 7 business days
- Deliverable: patch release(s) on `https://digitalstrike-solutions.com`, smoke test recorded
- Status: Planned
- Previous: Sprint 001 — done; `v0.1.0` released and smoke-tested 2026-10-12

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
- Personal data / legal jurisdiction: Costa Rica, Ley 8968; consent checkbox; privacy notice draft v1 pending legal review
- Where the sprint deliverable runs: public on `https://digitalstrike-solutions.com`, endpoint on Apps Script

## Open questions
- Logo lockups: convert the wordmark text to outlines before printing / trademark filing (owner)
- Raul's photo ≥ 800×800 px (the 200 px photo in use is final for v0.1.0; a larger one is an upgrade)
- Sanitized screenshot of the Poliart platform for the showroom (Sprint 002, US-021 — first item)
- Cami's sign-off on the approved identity (Origo governance; does not block the build)
- Legal review of privacy notice v1 (Cinthia)
