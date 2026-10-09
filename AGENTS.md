# AGENTS.md

## Purpose

This repository follows Spec-Driven Development (SDD).

The goal is not to write code as quickly as possible. The goal is to deliver software that conforms to approved specifications and acceptance criteria.

## Mandatory workflow

Requirement -> Discovery -> Specs -> User Stories -> Architecture/UX/Stack -> Plan -> Sprint -> Implementation -> Review -> Verification

Do not skip required stages.

## Source-of-truth priority

When sources conflict, use this order:

1. Approved specification (including feature specs and integration contracts)
2. Approved ADR
3. Approved implementation plan
4. Sprint plan
5. User story and acceptance criteria
6. Existing code
7. Informal comments or assumptions

If code conflicts with an approved spec, the spec wins unless the spec is explicitly changed.

## Document map

`PROJECT_CONTEXT.md` is the authoritative list of the active documents and their paths. Standard locations:

| Document | Path | Required |
|---|---|---|
| Project context | `PROJECT_CONTEXT.md` | Always |
| Project spec | `docs/specs/PROJECT_SPEC.md` | Always |
| User stories | `docs/specs/USER_STORIES.md` | Always |
| Feature specs | `docs/specs/FEATURE_SPEC_<name>.md` | Standard/complex projects, or when listed in `PROJECT_CONTEXT.md` |
| Architecture spec | `docs/specs/ARCHITECTURE_SPEC.md` | Standard/complex projects, or when listed |
| Integration contracts | `docs/specs/<NAME>_CONTRACT.md` | Whenever two workstreams share an interface |
| UX/UI direction | `docs/ux/UX_UI_DIRECTION.md` | Projects with a user interface |
| Tech stack | `TECH_STACK.md` | Always |
| ADRs | `docs/decisions/ADR-<NNN>_<TITLE>.md` | When a decision needs recording |
| Implementation plan | `docs/plans/IMPLEMENTATION_PLAN.md` | Always |
| Sprint plans | `docs/sprints/SPRINT_<NNN>.md` (the active one is named in `PROJECT_CONTEXT.md`) | Always |
| Readiness checklist | `docs/checklists/SPRINT_READINESS_CHECKLIST.md` | Before every sprint |

Templates in the Starter Kit end in `_TEMPLATE.md`. When a project instantiates one, it copies the file to the path above without the `_TEMPLATE` suffix.

If a path listed in `PROJECT_CONTEXT.md` does not exist, or a required document is missing, stop and report it before implementing.

## Before implementing

Read, in this order:

1. `PROJECT_CONTEXT.md`
2. `docs/specs/PROJECT_SPEC.md`
3. relevant feature specs and integration contracts listed in `PROJECT_CONTEXT.md`
4. `docs/specs/USER_STORIES.md`
5. `docs/ux/UX_UI_DIRECTION.md` (if the project has a UI)
6. `TECH_STACK.md`
7. relevant ADRs in `docs/decisions/`
8. `docs/plans/IMPLEMENTATION_PLAN.md`
9. the active sprint plan `docs/sprints/SPRINT_<NNN>.md`

Do not invent business requirements.

If ambiguity materially changes behavior, scope, security, cost, data handling, or architecture, stop and request clarification.

Small implementation details may be decided autonomously when they do not alter the approved behavior.

## Sprint readiness

- A sprint starts only after its readiness check (`docs/checklists/SPRINT_READINESS_CHECKLIST.md`) has no open blocking items and the human owner gives an explicit go-ahead.
- Agents do not start a sprint on their own initiative.

## Parallel agent rules

- Maximum recommended implementation agents in parallel: 3.
- Agents must not knowingly modify the same responsibility without an explicit integration plan.
- Shared interfaces/contracts must be defined and locked before parallel implementation.
- Shared foundations (project scaffold, configuration, shared conventions) are merged before parallel work starts.
- The sprint plan must include a file/directory ownership map. Each agent owns only its assigned scope and edits only files it owns; changes needed in another owner's files are requested, not made.
- Merge conflicts are resolved when found, by the human owner together with the agent that owns the conflicting file. An agent must not rewrite another agent's files to resolve a conflict.
- Integration must be verified after merging parallel work.
- A change is not complete merely because its own tests pass; it must not break already accepted functionality.

## Branch, PR, and commit naming

Every project defines a short uppercase **project key** (its initials, 2–5 letters) in `PROJECT_CONTEXT.md`, e.g. `GK`.

### Branches

| Work | Pattern | Example |
|---|---|---|
| User story | `<KEY>-<NNN>-<short-slug>` | `GK-004-lead-form` |
| Fix or follow-up for a story | `<KEY>-<NNN>-fix-<short-slug>` | `GK-004-fix-phone-validation` |
| Work outside the stories | `<KEY>-<TYPE>-<short-slug>` | `GK-DOCS-sprint-001-readiness` |

- `<NNN>` is the story number with three digits (`US-004` → `004`). When Jira is adopted, use the Jira issue number instead.
- `<TYPE>` for non-story work: `DOCS`, `CHORE`, `CI`, `FIX`, `SPIKE`.
- `<short-slug>`: lowercase, kebab-case, a few words, total branch name at most 60 characters.
- One branch per story and agent. If a branch serves several stories, name it after the primary story and list the others in the PR.
- Never commit directly to `main`.

### Pull request titles

`[<KEY>-<NNN>] <Short description>` or `[<KEY>-<TYPE>] <Short description>`, e.g. `[GK-004] Lead form with client-side validation`.

### Commit messages

Start the subject with the same key: `GK-004: add phone normalization`.

## Pull requests

Use `.github/pull_request_template.md`, including its **Ownership** section: the owning agent/workstream, the owned paths changed, and any change outside that scope with who approved it. Each implementation agent should:

1. Work on an isolated branch named as above.
2. Reference the related user stories and acceptance criteria.
3. Keep the PR focused.
4. Include verification evidence.
5. Call out risks, assumptions, and unresolved items.
6. Avoid unrelated refactors.

## Merging and approval

**Agents never merge pull requests.** Only the human owner merges, and only after the human owner has approved the PR.

This applies to every agent (implementation and review-only). Agents must not:

- merge a PR, or enable auto-merge on it
- approve a PR (the review-only agent posts comment-only reviews)
- push or commit directly to `main` or any other protected/base branch
- close or reopen PRs they do not own, or delete other agents' branches

Agents may keep their **own** PR branch up to date (for example, merge `main` into it and resolve conflicts in files they own), then report to the human owner that the PR is ready. When a PR is ready, the agent says so and stops; merging is the human owner's decision.

Recommended enforcement in GitHub: protect `main` (require a pull request before merging, block force pushes and deletions). If agents act through the human owner's GitHub account, GitHub cannot distinguish them from the owner, so this rule must also be stated in every agent prompt.

## Review-only agent

A review-only agent may inspect PRs but must not implement features, approve PRs, or merge PRs. It posts comment-only reviews.

### Reviewer independence

A reviewer that changes the code it reviews becomes a co-author: it starts defending its own fixes, stops seeing the PR with fresh eyes, and loses impartiality. To keep reviews independent:

- The review-only agent **never changes code or any other file**: no fixes, not even small ones, in the PR under review, on a follow-up branch, or anywhere else in the repository. It never commits, pushes, or opens PRs.
- It does not post ready-to-apply patches (no GitHub "suggested changes" blocks, no diffs). A finding states the problem, the evidence, the violated spec or acceptance criterion, and the expected outcome. How to fix it is the author's decision.
- It does not resolve review threads on the author's behalf.
- It may run the code, tests, and checks locally to gather evidence, without committing anything.
- Fixes are always made by the owning implementation agent. The reviewer then reviews the new commits as a fresh review.
- A session that has written code for the project must not review that code. The review-only agent always runs in its own session, separate from every implementation agent.

It should verify:

- spec compliance
- acceptance criteria
- code quality
- regressions
- security concerns
- stack compliance
- tests
- integration risks

The human reviewer remains the final approver.

## Automated PR reviewers

A repository may also run an automated reviewer on every pull request, for example the Codex GitHub integration. Treat it as an additional, independent reviewer:

- Every finding gets a visible outcome. The PR's author (the owning agent, or the human owner for docs PRs) checks it against the current head and the specs, then either pushes a fix or replies on the thread explaining why no change is needed (for example: already fixed, reviewed an older commit, or contradicts an approved spec). No finding is left without an answer.
- Give feedback on each finding when the tool asks for it (e.g. 👍 useful and correct, 👎 wrong or not useful). This tunes the reviewer for the project. When a fix was pushed, name its commit in the reply; otherwise the reply states the reason instead.
- It does not outrank the specs. A finding that needs a requirement or contract change goes through change management (spec first), and the human owner decides.
- It does not replace the review-only agent or the human owner's approval. Its comments are never an approval.
- The review-only agent may triage its findings (valid, obsolete, invalid) in its own review, but under reviewer independence it never fixes them.
- Leave resolving its threads to the human owner unless they ask the author to do it.

## Testing

Tests must derive from the spec and acceptance criteria.

At minimum, verify:

- happy path
- validation/error path
- critical integration behavior
- regression risk for touched areas

## Definition of Done

Work is done only when:

- implementation matches approved specs
- acceptance criteria pass
- tests pass
- integration remains healthy
- documentation is updated if needed
- review-only agent has completed review when configured
- final human reviewer approves

## Change management

If implementation reveals a requirement change:

1. Update the spec first.
2. Update user stories/acceptance criteria if required.
3. Update plan/sprint scope if required.
4. Then update code.

Never silently change product behavior in code.
