# SPRINT 002 — Agent Kickoff Prompts

Fresh Claude Code sessions for this sprint, one per agent, each on `Raulc87/DigitalStrike-main-page` (the Sprint 001 sessions are retired: their context is large and belongs to the previous sprint). Start them only after this PR is merged; the go-ahead was given on 2026-10-19 (`SPRINT_002.md`, entry gates). The coordinator session launches them with the owner's yes and relays the owner's decisions.

## Models

Same choices and reasons as `SPRINT_001_AGENT_PROMPTS.md` → Models.

| Agent | Stories | Model | Effort |
|---|---|---|---|
| Agent 1 — Site shell, sections | US-022, then US-023 | Sonnet 5.5 (`claude-sonnet-5-5`) | high |
| Agent 2 — Lead form, e2e | US-024 | Opus 5.5 (`claude-opus-5-5`) | high |
| Agent 3 — Apps Script, CI/CD, runbooks | US-025, US-026, US-027 | Opus 5.5 | high |
| Review-only agent | every PR | Opus 5.5 | high |

## Launch order

All four at once: the stories touch disjoint files. US-023 starts after US-022 is merged (it measures against it). US-026's AC3 waits for the owner's Google console steps (SPRINT_002 owner task 10); Agent 3 writes the runbook steps first so the owner can follow them.

---

## Common rules (paste at the top of every implementation prompt)

```
You are working on Raulc87/DigitalStrike-main-page. Sprint 002 is ACTIVE (go-ahead given by the
human owner, Raul Casañas, on 2026-10-19; planned end 2026-10-27). Production is v0.1.1 on
https://digitalstrike-solutions.com; this sprint ships as patch release v0.1.2.

Before writing code, read in this order: AGENTS.md, CLAUDE.md, PROJECT_CONTEXT.md,
docs/specs/PROJECT_SPEC.md, docs/specs/LEAD_ENDPOINT_CONTRACT.md, docs/specs/USER_STORIES.md
(your stories in full), docs/ux/UX_UI_DIRECTION.md, docs/ux/CONTENT.md, TECH_STACK.md,
docs/decisions/ADR-*.md (ADR-006 = branching and release model), docs/plans/IMPLEMENTATION_PLAN.md,
docs/sprints/SPRINT_002.md, docs/process/RUNBOOK_STYLE.md (if you touch a runbook).

Rules:
- AGENTS.md is authoritative. Do not invent requirements, copy or numbers. If an ambiguity
  materially changes behavior, scope, security, data handling or architecture, stop and ask.
- LEAD_ENDPOINT_CONTRACT.md (1.0.1) is locked; propose changes instead of making them.
- Visitor-facing text comes verbatim from docs/ux/CONTENT.md.
- Edit only files your workstream owns (File Ownership Map, SPRINT_001.md, unchanged in Sprint 002).
  Need a change in another owner's file? Ask; do not edit it.
- Branch per story with the names in SPRINT_002.md, from the latest main (ADR-006: main is the only
  long-lived branch and must stay releasable). I authorize you to create and push those branches.
- One PR per branch, base main. PR title "[DS-NNN] ...", commits "DS-NNN: ...". Fill the PR
  template (Ownership, ACs covered one by one, verification evidence).
- Run lint, typecheck, unit and e2e locally before every push; CI must be green (six required
  checks). Never skip, disable or loosen a test to get green.
- Never commit secrets or real personal data. Never ask for or handle secret values.
- Never merge, approve, or enable auto-merge, and never push to main. When a PR is ready, say so
  and stop. After opening a PR, tell me the link, what is done and what is next.
- Subscribe to your own PR's activity and handle CI and review findings on it.
```

---

## Agent 1 — Site shell, sections (Sonnet 5.5)

```
[Common rules]

Your stories, in order:
1. US-022 CEO photo delivery — branch DS-022-photo-delivery. The only source is the 200×200 photo
   (owner decision 2026-10-19: no larger photo for now). Lazy-load it with explicit size, serve a
   modern format (AVIF/WebP + JPG fallback) at the displayed size; if a 2× variant cannot be made
   from a 200 px source without upscaling, do not upscale: say so in the PR and keep the pipeline
   ready for a larger source (AC2). Show the lhci report evidence for AC3.
2. US-023 Mobile performance — branch DS-023-mobile-performance, from main after DS-022 is merged.
   AC1 is a profile write-up in the PR; AC2 is the CI lhci gate at mobile Performance ≥ 0.95 on
   /es/ and /en/ (raise lighthouserc.json); production PageSpeed is recorded after release, not an
   AC. Any visible change needs the owner's approval in the PR (screenshots at 390 and 1440 px).
   GoDaddy's injected script findings are not actionable (ADR-001).
```

## Agent 2 — Lead form, e2e (Opus 5.5)

```
[Common rules]

Your story: US-024 Reliable lead-flow e2e — branch DS-024-lead-flow-e2e-stability.
The elapsed_ms >= 3000 assertion in tests/e2e/lead-flow.spec.ts failed once under load. Remove the
wall-clock race (e.g. Playwright clock control) while still asserting the contract rule; do not
loosen the rule. Evidence: 20 consecutive passing runs locally and in CI (--repeat-each), linked
in the PR.
```

## Agent 3 — Apps Script, CI/CD, runbooks (Opus 5.5)

```
[Common rules]

Your stories (any order; suggested US-026 first because it needs the owner's console steps):
1. US-026 Staging lead endpoint — branch DS-026-staging-endpoint. pages.yml builds the preview with
   PUBLIC_LEAD_ENDPOINT_URL = vars.PUBLIC_LEAD_ENDPOINT_URL_PREVIEW (unset → warning, form shows its
   error; never fall back to production). APPS_SCRIPT_SETUP.md gets the staging steps (sheet named
   "DigitalStrike leads (staging)", its own SHEET_ID and ACCEPTED_PRIVACY_NOTICE_VERSIONS); fix
   RELEASE.md §1.2 and the APPS_SCRIPT_SETUP §7 "no-terminal alternative". Follow RUNBOOK_STYLE.md.
   Tell me as soon as the runbook steps are ready so the owner can create the staging project; AC3
   (a preview lead lands in the staging sheet) is the owner's check after that.
2. US-025 Readable deploy logs — branch DS-025-deploy-log-masking. CPANEL_TARGET_DIR becomes a
   repository variable (default "/"); the skip-with-notice check covers only CPANEL_HOST,
   CPANEL_USERNAME, CPANEL_PASSWORD. Update DEPLOYMENT.md §2. Tell me when it is merged so the owner
   moves the value from the secret to the variable and runs a dry run.
3. US-027 Urgent-fix runbook — branch DS-027-urgent-fix-runbook. RELEASE.md "Urgent fix" section
   per ADR-006 Decision 4, including the gate that replaces §3's preconditions; cite the
   release-cpanel.yml checkout line (AC3). Optionally add release/** to ci.yml push branches.
```

## Review-only agent (Opus 5.5)

The Sprint 001 reviewer prompt (`SPRINT_001_AGENT_PROMPTS.md` → Review-only agent) applies, with these changes:

```
- Sprint 002: read docs/sprints/SPRINT_002.md and ADR-006 instead of SPRINT_001.md.
- Every review starts with a coverage line "files reviewed N/N" and is a full re-review on every
  push; triage automated-reviewer comments, including collapsed "previously missed" sections.
- Findings are ranked blocking / should fix / nit, each with file:line, evidence, the violated
  reference and the expected outcome.
- Who may start a review: the owner, or the coordinator session on the owner's behalf. Do not
  self-poll and do not subscribe to PRs.
- For US-023, compare screenshots at 390 and 1440 px against main; for US-026, confirm the preview
  can never post to the production endpoint.
```
