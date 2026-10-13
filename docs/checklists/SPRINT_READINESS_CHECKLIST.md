# SPRINT READINESS CHECKLIST

Run this checklist before starting any sprint. Record the result in the sprint plan's "Entry Gates" section. Any unchecked item marked **(blocking)** prevents the sprint from starting.

## 1. Repository and bootstrap
- [ ] **(blocking)** Every path listed in `PROJECT_CONTEXT.md` exists.
- [ ] **(blocking)** `AGENTS.md` and `CLAUDE.md` are present and match the Starter Kit version (or differences are intentional and documented).
- [ ] `PROJECT_CONTEXT.md` has the repository URL, status, and active sprint filled in.
- [ ] `README.md` status matches `PROJECT_CONTEXT.md`.
- [ ] **(blocking)** The project key is defined in `PROJECT_CONTEXT.md`, and the sprint plan lists the planned branch name for each story (naming rules in `AGENTS.md`).

## 2. Documentation consistency
- [ ] **(blocking)** Spec, user stories, UX direction, tech stack, plan, and sprint plan agree on scope, field names, and behavior.
- [ ] Data field naming convention is stated and used consistently (e.g. `snake_case`).
- [ ] Supported languages/locales are stated (and how the language is chosen).
- [ ] Every functional requirement maps to at least one user story.

## 3. User stories
- [ ] **(blocking)** Every sprint story has testable acceptance criteria (no undefined terms such as "common widths" or "graceful" without a definition).
- [ ] Every story has an owner in the sprint plan.

## 4. Contracts and integrations
- [ ] **(blocking)** Every interface shared between workstreams has a locked contract: path, method, content type, request fields with types and validation rules, response shape, status codes, error codes, server-generated fields (formats, timezone), configuration variables.
- [ ] Each external integration has a documented failure behavior and fallback.
- [ ] Credentials: owner, storage location, and "never in Git / never client-side" rule are stated.

## 5. Data, legal, and security
- [ ] **(blocking)** If personal data is collected: jurisdiction, consent mechanism, and privacy notice are decided.
- [ ] Abuse/spam protection is either in scope or tracked as a story with a "before public launch" condition.

## 5.1 User interface (skip if the project has no UI)
- [ ] The visual identity status is stated in `UX_UI_DIRECTION.md`: approved (tokens, type, components recorded) or explicitly provisional.
- [ ] Until approved, UI colors and fonts are theme tokens, not literals in components.
- [ ] **(blocking for a go-live sprint)** Final brand assets are available or have a dated owner: logo (vector or transparent PNG), photos (≥800 px, consent), final copy.

## 6. Stack and environment
- [ ] Hosting runtime capabilities are confirmed, or an ADR records the assumption and a fallback.
- [ ] Local development/demo environment is defined (how to run the full flow locally).
- [ ] Test tools, lint tools, and CI checks are named; once CI exists, its checks are required on `main`.
- [ ] **(blocking for a sprint that deploys anything, a preview included)** The branching and release model is recorded (ADR), and the deployment runbook exists or is a story in this sprint ordered before its first deploy story (`AGENTS.md` → Document map, Runbooks).
- [ ] **(blocking for a go-live sprint)** The release runbook (preview check, how a change reaches production, smoke test, rollback) exists or is a story in this sprint ordered before the release story.
- [ ] Previews and tests use their own data store (staging sheet, database or endpoint), never production data.
- [ ] If the project sends transactional email, a real-delivery test to an external Gmail and Outlook inbox is planned before release.

## 7. Parallelization
- [ ] **(blocking)** Workstreams are assigned (max 3 implementation agents).
- [ ] **(blocking)** A file/directory ownership map exists in the sprint plan.
- [ ] Foundation/scaffold work and its owner are identified and sequenced before parallel work.
- [ ] Merge order and the integration PR owner are defined.
- [ ] Conflict-resolution rule is stated.

## 7.1 Merge control
- [ ] **(blocking)** Every agent prompt states that agents never merge or approve PRs; only the human owner merges after approval (`AGENTS.md`).
- [ ] **(blocking)** If a review-only agent is used, it runs in its own session, and its prompt states the reviewer-independence rule: it never changes code, commits, or posts patches (`AGENTS.md`).
- [ ] `main` is protected in GitHub (pull request required, no force pushes or deletions).
- [ ] If the project uses `release/*` branches, they have the same protection rule as `main`, and CI runs on pull requests targeting them.
- [ ] If a coordinator session is used, its instructions follow `AGENTS.md` → Coordinator session (relays verbatim, records decisions in docs PRs, never writes code, merges or approves).

## 8. Go-ahead
- [ ] **(blocking)** The human owner has given explicit go-ahead.
