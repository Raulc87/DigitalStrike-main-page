# Project Context

## Project
- Name: DigitalStrike Solutions — main page
- Project key: **DS** (branches `DS-<NNN>-<slug>` / `DS-<TYPE>-<slug>`, PR titles `[DS-NNN]`, commits `DS-NNN:`; see `AGENTS.md`)
- Repository: https://github.com/Raulc87/DigitalStrike-main-page
- Starter Kit: https://github.com/Raulc87/sdd_starter_kit
- Status: **Planning — Sprint 001 ready pending docs approval and go-ahead**
- Product owner / final reviewer: Raul Casañas (CEO, rcasanas@gmail.com)

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
- ADRs: `docs/decisions/` (ADR-001 … ADR-005)
- Implementation plan: `docs/plans/IMPLEMENTATION_PLAN.md`
- Active sprint plan: `docs/sprints/SPRINT_001.md` (prompts: `docs/sprints/SPRINT_001_AGENT_PROMPTS.md`)
- Readiness checklist: `docs/checklists/SPRINT_READINESS_CHECKLIST.md`
- Runbooks: `docs/runbooks/` (created by Agent 3 during Sprint 001)
- Visual identity process: `docs/process/VISUAL_IDENTITY_PROCESS.md`

## Current sprint
- Sprint: 001 — First release
- Goal: public bilingual page with services, showroom, CEO, lead flow (Sheet + 2 emails) and Calendly
- Start: on go-ahead (target 2026-10-10)
- End: release cut 2026-10-13 18:00 (CR); demo 2026-10-14
- Duration: short release sprint — approved exception to the 7-business-day rule (IMPLEMENTATION_PLAN §6)
- Deliverable: GitHub Pages site + release `v0.1.0`
- Status: Planned

## Agent allocation
- Implementation Agent 1: Site shell, sections, i18n, SEO — Sonnet 5.5
- Implementation Agent 2: Lead form, privacy, Calendly, e2e integration — Opus 5.5
- Implementation Agent 3: Apps Script endpoint + emails, mock, CI/CD, runbooks — Opus 5.5
- Review-only Agent: Opus 5.5, separate session, comment-only
- Conflict resolution: human owner with the agent owning the conflicting file

## Important constraints
- Hosting: GitHub Pages (preview + first release); GoDaddy cPanel on release once hosting and `digitalstrike-solutions.com` exist (ADR-001)
- Backend: Google Apps Script + Google Sheets + Gmail (ADR-002, ADR-005); Python/Java roadmap in ADR-002
- Languages / locales: Spanish (source) and English; `/es/`, `/en/`; browser detection + saved toggle (ADR-003)
- Naming conventions: data/API fields English `snake_case`; TS `camelCase`; components `PascalCase`
- Personal data / legal jurisdiction: Costa Rica, Ley 8968; consent checkbox; privacy notice draft v1 pending legal review
- Where the sprint deliverable runs: public (GitHub Pages), endpoint on Apps Script

## Open questions
- Palette may change (look and feel A approved 2026-10-10) — US-020, Sprint 002
- Raul's photo ≥ 800×800 px (provisional 200 px in use)
- Sanitized screenshot of the Poliart platform for the showroom
- GoDaddy hosting plan bought? cPanel Linux?
- Cami's approval of visual identity v1
- Legal review of privacy notice v1 (Cinthia)
