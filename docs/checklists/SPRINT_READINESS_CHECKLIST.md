# SPRINT READINESS CHECKLIST

Run this checklist before starting any sprint. Record the result in the sprint plan's "Entry Gates" section. Any unchecked item marked **(blocking)** prevents the sprint from starting.

## 1. Repository and bootstrap
- [ ] **(blocking)** Every path listed in [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) exists.
- [ ] **(blocking)** [`AGENTS.md`](../../AGENTS.md) and [`CLAUDE.md`](../../CLAUDE.md) are present and match the Starter Kit version (or differences are intentional and documented).
- [ ] [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) has the repository URL, status, and active sprint filled in.
- [ ] `README.md` status matches [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md).
- [ ] **(blocking)** The project key is defined in [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md), and the sprint plan lists the planned branch name for each story (naming rules in [`AGENTS.md`](../../AGENTS.md)).

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
- [ ] **(blocking for the first sprint that writes code)** `docs/security/SECURITY_BASELINE.md` is approved: classification, OWASP ASVS level and its ASVS inventory at the scale the baseline sets (one row per chapter for a simple level-1 project with no personal data, authentication or payments; every requirement of the level otherwise), each row covered or not applicable with a reason, the Top 10 / API Top 10 risks that apply, and what the project adds to the SSDF practices ([`AGENTS.md`](../../AGENTS.md) → Security baseline). For a project that already writes code when it adopts the baseline, the baseline is a story in its next sprint, and this item is blocking from the sprint after that.
- [ ] **(blocking)** Every sprint story that touches an applicable OWASP risk has acceptance criteria that verify it (`USER_STORIES.md` → Security).
- [ ] Secret scanning and dependency scanning are set up, or planned as a story in this sprint (`SECURITY_BASELINE.md` §6).
- [ ] **(blocking for a go-live sprint, for any sprint that releases to production while a live project's penetration test is still due, and for a high-risk or complex project's sprint that releases a major new attack surface)** The pre-release security agent ([`AGENTS.md`](../../AGENTS.md) → Pre-release security agent) runs in its own session and has finished its first three steps: the security baseline updated (including which staging case applies and why: `SECURITY_BASELINE.md` §5.1), the first security code review done with its findings turned into stories (a review of the changes merged during the sprint is planned before the release story), and, if the baseline requires a penetration test, `docs/security/PENTEST_PLAN.md` approved.
- [ ] **(blocking for the same sprints)** Each agent scan has the owner's written approval and scope for that run, with its time window (staging before the release, only when staging can be scanned; production right after the release), passive or baseline unless the approval names more (never more on a host the baseline marks "passive baseline only", such as GitHub Pages, even with an approval), and a named person who can stop it. If the baseline requires a penetration test, the tester's written authorization and scope are signed and the test is scheduled on production right after the release story. Both start when the release's production smoke test passes (`RELEASE.md` → Post-release security), and fixing critical findings as hotfixes is planned for after it.

## 5.1 User interface (skip if the project has no UI)
- [ ] The visual identity status is stated in `UX_UI_DIRECTION.md`: approved (tokens, type, components recorded) or explicitly provisional.
- [ ] Until approved, UI colors and fonts are theme tokens, not literals in components.
- [ ] **(blocking for a go-live sprint)** Final brand assets are available or have a dated owner: logo (vector or transparent PNG), photos (≥800 px, consent), final copy.

## 6. Stack and environment
- [ ] Hosting runtime capabilities are confirmed, or an ADR records the assumption and a fallback.
- [ ] Local development/demo environment is defined (how to run the full flow locally).
- [ ] The formatter and linter are named in `TECH_STACK.md` and run in CI, or are set up by a story in this sprint ([`AGENTS.md`](../../AGENTS.md) → Code readability).
- [ ] **(blocking for the first sprint that runs code)** The developer guide (`CONTRIBUTING.md`, from `docs/DEVELOPER_GUIDE_TEMPLATE.md`) exists, or is a story in this sprint so it exists by the sprint's end; in later sprints it is current.
- [ ] Test tools, lint tools, and CI checks are named; once CI exists, its checks are required on `main`.
- [ ] **(blocking for a sprint that deploys anything, a preview included)** The branching and release model is recorded (ADR), and the deployment runbook exists or is a story in this sprint ordered before its first deploy story ([`AGENTS.md`](../../AGENTS.md) → Document map, Runbooks).
- [ ] **(blocking for a go-live sprint)** The release runbook (preview check, how a change reaches production, smoke test, rollback) exists or is a story in this sprint ordered before the release story.
- [ ] Previews and automated tests use their own data store (staging sheet, database or endpoint), never production data (the marked submissions of each production smoke test, deleted or marked right after, are the only exception).
- [ ] If the project sends transactional email, a real-delivery test to an external Gmail and Outlook inbox is planned before release.

## 7. Parallelization
- [ ] **(blocking)** Workstreams are assigned (max 3 implementation agents).
- [ ] **(blocking)** A file/directory ownership map exists in the sprint plan.
- [ ] Foundation/scaffold work and its owner are identified and sequenced before parallel work.
- [ ] Merge order and the integration PR owner are defined.
- [ ] **(blocking)** The merge order has no dependency cycle: no PR waits, directly or through others, on a PR that waits on it ([`AGENTS.md`](../../AGENTS.md) → Parallel agent rules).
- [ ] Conflict-resolution rule is stated.

## 7.1 Merge control
- [ ] **(blocking)** Every agent prompt states that agents never merge or approve PRs; only the human owner merges after approval ([`AGENTS.md`](../../AGENTS.md)).
- [ ] **(blocking)** If a review-only agent is used, it runs in its own session, and its prompt states the reviewer-independence rule: it never changes code, commits, or posts patches ([`AGENTS.md`](../../AGENTS.md)).
- [ ] **(blocking)** Every agent prompt, the review-only agent's and the coordinator's included, requires an attribution line on everything the agent posts on GitHub ([`AGENTS.md`](../../AGENTS.md) → Attribution of agent posts).
- [ ] Every implementation prompt states the review flow: subscribe only to your own PRs and keep them current with the base branch, ask the review-only agent for a review after every push, and ask the automated reviewer at most twice per PR, and send owner questions to the coordinator as well as posting them; the reviewer's prompt states who may trigger it, how it reports a ready PR and how it raises an owner question ([`AGENTS.md`](../../AGENTS.md) → Parallel agent rules, Review-only agent → Review flow, Automated PR reviewers).
- [ ] `main` is protected in GitHub (pull request required, no force pushes or deletions).
- [ ] If the project uses `release/*` branches, they have the same protection rule as `main`, and CI runs on pull requests targeting them.
- [ ] **(blocking for a sprint with a pre-release security agent)** Its prompt states that it never changes code, scans only under a written approval for that run and the safeguards in [`AGENTS.md`](../../AGENTS.md) → Security baseline, and reports findings to the coordinator; every implementation prompt states that implementation agents never run penetration tests, attack tools or security scans, in any environment.
- [ ] If a coordinator session is used, its instructions follow [`AGENTS.md`](../../AGENTS.md) → Coordinator session (relays verbatim, records decisions in docs PRs, never writes code, merges or approves).

## 8. Go-ahead
- [ ] **(blocking)** The human owner has given explicit go-ahead.
