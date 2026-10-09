# Spec-Driven Development Starter Kit

A reusable starter kit for projects developed with Spec-Driven Development (SDD) and agentic programming.

## Core flow

1. Raw requirement
2. Discovery
3. PROJECT_SPEC
4. USER_STORIES
5. FEATURE_SPEC(s), when needed
6. ARCHITECTURE_SPEC, when needed
7. UX_UI_DIRECTION, when the project has a user interface (visual identity via `docs/process/VISUAL_IDENTITY_PROCESS.md`, usually after the first functional prototype)
8. TECH_STACK
9. ADRs, when a decision needs to be recorded
10. IMPLEMENTATION_PLAN
11. SPRINT_PLAN
12. Implementation by agents
13. Review by review-only agent
14. Final human review and approval
15. Verification against specs and acceptance criteria

## Working model

- Methodology: Scrum.
- Sprint duration: 7 business days.
- Saturdays and Sundays do not count as business days.
- Every sprint must end with a demonstrable deliverable.
- Up to 3 implementation agents may work in parallel.
- A separate review-only agent may review pull requests.
- The human owner/reviewer is the final approver.
- Parallel work must use explicit contracts and integration boundaries to reduce breakage.
- Specs are the source of truth for product behavior.
- Tests and validation must trace back to requirements and acceptance criteria.
- The least-complex stack that satisfies the requirements should be preferred.

## GitHub usage

This repository should be configured as a GitHub Template Repository.

For a new project:

1. Click **Use this template** in GitHub.
2. Create a new repository.
3. Fill `PROJECT_CONTEXT.md`.
4. Run discovery.
5. Complete the required specs before implementation begins.
6. Start agents only after the sprint plan is approved.

## Starting a new project

1. Create the repository from this template.
2. Copy each `*_TEMPLATE.md` you need to its working path without the `_TEMPLATE` suffix (see the document map in `AGENTS.md`), e.g. `TECH_STACK_TEMPLATE.md` -> `TECH_STACK.md`, `docs/sprints/SPRINT_PLAN_TEMPLATE.md` -> `docs/sprints/SPRINT_001.md`. Delete templates you do not use.
3. Fill `PROJECT_CONTEXT.md` with the real repository URL, the project key (e.g. `GK`), and document paths. Branches, PR titles, and commits follow the naming rules in `AGENTS.md` (`<KEY>-<NNN>-<slug>`).
4. Before each sprint, run `docs/checklists/SPRINT_READINESS_CHECKLIST.md` and record the result in the sprint plan's entry gates.
5. Start agents only after the human owner gives the go-ahead.

## Lessons from the first pilot

The first pilot (`Raulc87/gaby-main-page`) showed that these are usually missing and block parallel work:

- a locked integration contract (paths, validation rules, status codes, formats, timezone) — use `docs/specs/INTEGRATION_CONTRACT_TEMPLATE.md`
- a file ownership map, a scaffold-first merge order, and an integration PR owner in the sprint plan
- supported languages and how the language is chosen
- legal jurisdiction and consent for personal data
- inclusive-language rules applied to the proposed copy itself
- where the sprint deliverable runs (local vs. hosted) and confirmation of the hosting runtime
- a visual-identity step: build the first prototype on provisional theme tokens, then explore 2 proposals from the client's brand material, record the chosen one in the UX spec, and apply it as its own story

## Bundled skill

`.claude/skills/ux-proposals/` loads automatically in Claude Code for any account working in a repository created from this template. It creates look-and-feel proposals from the project's UX spec and the client's brand material, then drafts the spec section for the chosen direction. See `docs/process/VISUAL_IDENTITY_PROCESS.md`.

## Agent bootstrap

All implementation and review agents start from `AGENTS.md`.

For Claude Code, `CLAUDE.md` redirects Claude to the same process.

## Documentation depth

Use the minimum documentation required by complexity.

### Simple project
- PROJECT_SPEC
- Integration contract(s) when workstreams share an interface
- USER_STORIES
- UX_UI_DIRECTION if applicable
- TECH_STACK
- IMPLEMENTATION_PLAN
- SPRINT_PLAN

### Standard project
Add:
- FEATURE_SPEC(s)
- ARCHITECTURE_SPEC
- ADR(s) when needed

### Complex project
Add:
- Detailed architecture
- Multiple feature specs
- ADRs
- Explicit integration contracts
- Migration/rollback strategy
- Stronger automated verification and traceability
