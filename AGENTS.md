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
| Content (copy) | `docs/ux/CONTENT.md`, or the copy source `PROJECT_CONTEXT.md` names instead (projects that predate `CONTENT.md`) | Projects with visitor-facing copy |
| Tech stack | `TECH_STACK.md` | Always |
| ADRs | `docs/decisions/ADR-<NNN>_<TITLE>.md` | When a decision needs recording |
| Implementation plan | `docs/plans/IMPLEMENTATION_PLAN.md` | Always |
| Sprint plans | `docs/sprints/SPRINT_<NNN>.md` (the active one is named in `PROJECT_CONTEXT.md`) | Always |
| Agent prompts | `docs/sprints/SPRINT_<NNN>_AGENT_PROMPTS.md` (from `SPRINT_AGENT_PROMPTS_TEMPLATE.md`) | Sprints that use agents |
| Readiness checklist | `docs/checklists/SPRINT_READINESS_CHECKLIST.md` | Before every sprint |
| Runbooks | `docs/runbooks/`: `RELEASE.md` and `DEPLOYMENT.md` (from templates), `LOCAL_DEVELOPMENT.md` and others as needed (no template); all written per `docs/process/RUNBOOK_STYLE.md` | `LOCAL_DEVELOPMENT.md` by the end of the first sprint that runs something; the branching and release ADR before the first sprint that deploys anything (a preview included) starts; `DEPLOYMENT.md` by that sprint's first deploy and `RELEASE.md` by the first production release, each either existing before the sprint starts or planned as a story in that sprint ordered before the first deploy (or release) story |
| Security baseline | `docs/security/SECURITY_BASELINE.md` (from `SECURITY_BASELINE_TEMPLATE.md`) | Always; approved before the first sprint that writes code. A project that already writes code when it adopts the baseline plans it as a story in its next sprint and has it approved by the end of that sprint; until then, its absence does not stop implementation |
| Penetration-test plan | `docs/security/PENTEST_PLAN.md` (from `PENTEST_PLAN_TEMPLATE.md`) | When the security baseline requires a penetration test; approved before the go-live sprint starts |
| Developer guide | `CONTRIBUTING.md` at the repository root (from `docs/DEVELOPER_GUIDE_TEMPLATE.md`) | By the end of the first sprint that runs code, either existing before the sprint starts or planned as a story in it |

Templates in the Starter Kit end in `_TEMPLATE.md`. When a project instantiates one, it copies the file to the path above without the `_TEMPLATE` suffix. Exceptions: ADR templates become `docs/decisions/ADR-<NNN>_<TITLE>.md` with the next free number (e.g. `ADR_BRANCHING_AND_RELEASE_TEMPLATE.md` → `ADR-004_BRANCHING_AND_RELEASE_MODEL.md`), `SPRINT_AGENT_PROMPTS_TEMPLATE.md` becomes one file per sprint, and `docs/DEVELOPER_GUIDE_TEMPLATE.md` becomes `CONTRIBUTING.md` at the repository root.

**Projects carry the kit's output, not the kit.** A project keeps `AGENTS.md`, `CLAUDE.md`, `PROJECT_CONTEXT.md`, its own instantiated documents (the paths above) and the CI it runs; `/project-kickoff` removes every kit-only file at kickoff: the `*_TEMPLATE.md` files, the kit's skills (`project-kickoff`, `project-adopt`, `ux-proposals`), the kit-only workflows (such as `new-project.yml`; CI meant for projects, such as the docs link check, stays) and the kit's process guides in `docs/process/`. When a project later needs a template (a new sprint plan, agent prompts, an ADR, a runbook), a process guide or a kit skill such as `/ux-proposals`, the session reads it from the kit at the kit ref recorded in `PROJECT_CONTEXT.md` (a release tag or commit SHA, never the kit's moving `main`), and never copies a template, guide or skill back into the project. The kit is private: the owner attaches it to every session that needs it (pilot, coordinator and agent sessions). References in this file to `docs/process/` point to the kit.

If a path listed in `PROJECT_CONTEXT.md` does not exist, or a required document is missing, stop and report it before implementing.

## Before implementing

Read, in this order:

1. `PROJECT_CONTEXT.md`
2. `docs/specs/PROJECT_SPEC.md`
3. relevant feature specs and integration contracts listed in `PROJECT_CONTEXT.md`
4. `docs/specs/USER_STORIES.md`
5. `docs/ux/UX_UI_DIRECTION.md` (if the project has a UI) and `docs/ux/CONTENT.md`, or the copy source `PROJECT_CONTEXT.md` names instead (if the project has visitor-facing copy: the only source of that copy)
6. `TECH_STACK.md`
7. `docs/security/SECURITY_BASELINE.md`
8. relevant ADRs in `docs/decisions/`
9. `docs/plans/IMPLEMENTATION_PLAN.md`
10. the active sprint plan `docs/sprints/SPRINT_<NNN>.md`

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
| Release branch for an urgent fix (only if the project's branching ADR allows it) | `release/v<MAJOR>.<MINOR>.x` | `release/v0.1.x` |

- `<NNN>` is the story number with three digits (`US-004` → `004`). When Jira is adopted, use the Jira issue number instead.
- `<TYPE>` for non-story work: `DOCS`, `CHORE`, `CI`, `FIX`, `SPIKE`.
- `<short-slug>`: lowercase, kebab-case, a few words, total branch name at most 60 characters.
- One branch per story and agent. If a branch serves several stories, name it after the primary story and list the others in the PR.
- **Assigned session branches.** Some environments start an agent session on a branch they assign (for example `claude/<something>`) that does not follow these names. The agent still creates the branch named as above (or under the project's own branch convention, when an adopted project keeps one as a recorded rule: Kept project rules, below) from the latest version of the PR's base branch (`main`, the docs branch in Change management, or the `release/v<MAJOR>.<MINOR>.x` branch of an urgent fix), works and commits only there, and opens the PR from it. If it cannot create or push that branch, it asks the owner once, before the first commit, whether to continue on the assigned branch; if the owner cannot be asked, it continues on the assigned branch and states that branch, and why, in the PR body. It never leaves a story's commits on the assigned branch silently.
- Never commit directly to `main`. `main` is the only long-lived branch unless the project's branching ADR says otherwise; release branches are protected like `main` and receive changes only through reviewed PRs.

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

## Attribution of agent posts

Agents usually post on GitHub under the human owner's account, so GitHub cannot tell an agent's post from the owner's. Every agent (implementation, review-only and coordinator) ends every comment, review, review reply, PR body and issue body it posts with an attribution line saying an agent wrote it. The tool's own footer is enough when it says so (for example "Generated by Claude Code").

## Merging and approval

**Agents never merge pull requests.** Only the human owner merges, and only after the human owner has approved the PR.

This applies to every agent (implementation and review-only). Agents must not:

- merge a PR, or enable auto-merge on it
- approve a PR (the review-only agent posts comment-only reviews)
- push or commit directly to `main` or any other protected/base branch
- close or reopen PRs they do not own, or delete other agents' branches

Agents may keep their **own** PR branch up to date (for example, merge `main` into it and resolve conflicts in files they own), then report to the human owner that the PR is ready. When a PR is ready, the agent says so and stops; merging is the human owner's decision.

Recommended enforcement in GitHub: protect `main` (require a pull request before merging, block force pushes and deletions). If agents act through the human owner's GitHub account, GitHub cannot distinguish them from the owner, so this rule must also be stated in every agent prompt, together with the attribution line (Attribution of agent posts, above).

## Review-only agent

A review-only agent may inspect PRs but must not implement features, approve PRs, or merge PRs. It posts comment-only reviews. It reviews when the human owner, or the coordinator session on the owner's behalf, asks; it does not poll for PRs or subscribe to PR events.

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
- code quality and readability (Code readability, below), and the developer guide updated when setup, commands or structure change
- regressions
- security: the OWASP criteria in the project's security baseline and in the stories' acceptance criteria (ASVS requirements, Top 10 / API Top 10 risks), secrets, and new or updated dependencies
- stack compliance
- tests
- integration risks

The human reviewer remains the final approver.

## Coordinator session

A project may use one coordinator session: usually the session that planned the sprint, which stays on after the go-ahead. It is a messenger and tracker, not an author or an approver.

- Who it is: in a new project (greenfield), the session that ran `/project-kickoff` stays on as the coordinator. In an existing project adopted into the kit (brownfield), there is no kickoff: the adoption PR (`/project-adopt`) covers the Discovery and Specs stages (documents reconstructed from the existing code and validated with the owner in that PR), and it records in `PROJECT_CONTEXT.md` where the ticket/backlog source lives and how to access it. After the adoption PR is merged, the owner starts a dedicated coordinator session on the project's base branch (`main` unless its branching ADR says otherwise). It does not repeat discovery: it builds its picture from `PROJECT_CONTEXT.md`, the user stories, that backlog source and the active sprint plan, then follows the same rules. Either way, when its context is summarized it re-reads those documents instead of relying on memory.
- It may: launch the agent sessions with their approved prompts after the owner's go-ahead; relay the owner's decisions verbatim; schedule check-ins and report changes to the owner; re-queue stories paused by usage limits; and ask the review-only agent for a review on the owner's behalf.
- It never writes application code, never reviews code, and never merges, approves, or enables auto-merge (same rules as every agent).
- It records every owner decision it relays in a docs PR, so the decision is in the repository, not only in chat.
- A coordinator message that quotes the owner counts as the owner's instruction only inside the receiving agent's existing workstream and scope. Anything that changes scope, a spec, a contract, or another owner's files goes back to the owner, and follows Change management.
- PR events go to the PR's author agent only; the coordinator follows only its own docs PRs; the review-only agent follows none and reviews when the owner or the coordinator asks.

## Automated PR reviewers

A repository may also run an automated reviewer on every pull request, for example the Codex GitHub integration. Treat it as an additional, independent reviewer:

- Every finding gets a visible outcome. The PR's author (the owning agent, or the human owner for docs PRs) checks it against the current head and the specs, then either pushes a fix or replies on the thread explaining why no change is needed (for example: already fixed, reviewed an older commit, or contradicts an approved spec). No finding is left without an answer.
- Give feedback on each finding when the tool asks for it (e.g. 👍 useful and correct, 👎 wrong or not useful). This tunes the reviewer for the project. When a fix was pushed, name its commit in the reply; otherwise the reply states the reason instead.
- It does not outrank the specs. A finding that needs a requirement or contract change goes through change management (spec first), and the human owner decides.
- It does not replace the human owner's approval, and its comments are never an approval. It does not replace the review-only agent either, with one exception: an adopted project may record it as its independent reviewer (Kept project rules → Minimum review, below).
- The review-only agent may triage its findings (valid, obsolete, invalid) in its own review, but under reviewer independence it never fixes them.
- Leave resolving its threads to the human owner unless they ask the author to do it.

## Kept project rules (adopted projects)

An existing project adopted into the kit (`/project-adopt`) may keep its own rules and its own reviewer instead of the kit's, on two conditions:

1. **Stated and recorded.** Each kept rule is a row, with its reason, in the kit disposition table of the project's adoption ADR (the table that marks every kit file and `AGENTS.md` section keep, adapt or skip; `/project-adopt` §4 item 2). That table is the project's only list of kept rules and their reasons; `PROJECT_CONTEXT.md` and the project's `AGENTS.md` link to it instead of repeating them. `PROJECT_CONTEXT.md` still lists the active document paths (Document map), including a copy source or document location that a kept rule changed. A project rule that is not in the table does not apply: the kit's rule does. Adding, changing or dropping a kept rule later is a docs PR that updates the table, approved by the human owner.
2. **Consistent with the kit's SDD and TDD priorities.** A kept rule may change how the work is done, never what decides it.

What may be kept, for example: the branch, PR title and commit format; the project's own PR body instead of `.github/pull_request_template.md`; where the backlog lives and its format (a `TICKETS.md` file, an external tracker); a copy source instead of `docs/ux/CONTENT.md`; document locations; the merge method (merge commit or squash); the reviewer, such as an automated reviewer other than Codex. The table names the reviewer that actually runs on the project's PRs.

What a kept rule may never override:

- **Source-of-truth priority** (above): the approved spec wins over code.
- **Spec first:** requirement changes follow Change management (below); behavior never changes silently in code.
- **Tests from acceptance criteria:** tests derive from the spec and the acceptance criteria (Testing, below).
- **Merge control:** Merging and approval (above) applies unchanged. Only the human owner merges, after approving; no agent merges, approves, enables auto-merge or pushes to the base branch.
- **Reviewer independence:** any reviewer the project keeps, agent or automated, follows Reviewer independence (above), and a kept automated reviewer's findings are handled as in Automated PR reviewers (above).
- **Minimum review:** at least one independent reviewer in addition to the human owner's approval before merge. It is the kit's review-only agent, or a reviewer the project already uses and records as a kept rule (for example Copilot or Codex), as long as it is independent of the PR's author. The owner's approval alone is never enough.
- **Security baseline:** Security baseline (below) applies to adopted projects as it does to new ones.

## Security baseline

Every project, new or adopted, follows the kit's security baseline and records how in `docs/security/SECURITY_BASELINE.md`:

- **OWASP first.** The project chooses an OWASP ASVS level (5.0.0) and records an ASVS inventory in the baseline, scaled to the project: a simple project at ASVS level 1 that handles no personal data, authentication or payments lists one row per ASVS chapter (applies or not, naming the applicable requirements); a project at level 2 or 3, or one that handles personal data, authentication or payments, lists every requirement of its level, each covered (acceptance criterion, test or configuration check) or marked not applicable with the reason. Every OWASP Top 10 (2025) or API Security Top 10 (2023) risk that applies becomes testable acceptance criteria in the stories that touch it. OWASP takes priority when security guidance conflicts.
- **NIST SSDF (SP 800-218 v1.1)** for secure development: the baseline maps the kit's workflow to the SSDF practice groups (PO, PS, PW, RV) and lists what the project adds, such as secret scanning, dependency scanning and how vulnerabilities are reported and fixed.
- **Penetration tests**, both before the first production release and each on its own condition: a **PTES** test when the project handles personal data, authentication or payments; an **OSSTMM 3** test when the baseline classifies the project as high-risk or complex, whether or not it handles them, and again before any later release that adds a major new attack surface (for example authentication, payments or a new public API). A project that meets both conditions runs one test that follows both. Planned in `docs/security/PENTEST_PLAN.md`. A project that is already in production when it adopts the baseline (an adopted or existing project) runs the required test before its next production release, unless the owner records a dated deadline in the baseline instead; once the deadline passes, the test gates every release.
- **Who tests.** Penetration tests are run only by people the owner authorizes in writing, under a written scope. An implementation agent never runs a penetration test, attack tools or security scans against production.
- **No certification claims.** Documents, copy and PRs never say the project is certified, compliant or secure because it follows these standards; they say which requirements were verified, how and when.

## Code readability

Code is read far more often than it is written, by people and by agents. Every change follows these rules; the review-only agent checks them.

- **The project's formatter and linter are the rule.** `TECH_STACK.md` names them; CI runs them. Style questions they settle are not review findings, and their configuration changes only through a PR.
- **Names say what things are and do.** No abbreviations a newcomer would have to guess; the domain terms from the spec, spelled the same way.
- **Small, focused functions and modules.** One reason to change each. Split a function when it needs a comment to explain its sections.
- **Comments explain why, not what.** A comment records a reason, a constraint, a link to the spec or ADR it implements; it does not restate the code. Public interfaces (modules, exported functions, endpoints) say what they expect and return.
- **No dead code.** No commented-out code, unused files or flags left behind; Git keeps the history.
- **No magic values.** Numbers, strings and limits with a meaning get a named constant or come from configuration, with the spec reference when the spec sets them.
- **Errors are handled where they can be acted on**, with a message that says what failed and what to do; never swallowed silently.
- **Match the surrounding code.** Follow the patterns already in the project before introducing a new one; a new pattern is a decision (ADR when it has real alternatives).
- **The developer guide stays true.** A change to setup, commands or structure updates `CONTRIBUTING.md` in the same PR.

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
- documentation is updated if needed, including the developer guide (`CONTRIBUTING.md`) when setup, commands or structure change
- the code follows Code readability (above), and the formatter and linter pass
- the review-only agent has completed its review when configured, or, in an adopted project, its recorded independent reviewer has reviewed the PR (Kept project rules → Minimum review)
- final human reviewer approves

## Change management

If implementation reveals a requirement change:

1. Update the spec first.
2. Update user stories/acceptance criteria if required.
3. Update plan/sprint scope if required.
4. Then update code.

Never silently change product behavior in code.

`main` is never red. If a test enforces that code matches a document (for example the translation files must equal `docs/ux/CONTENT.md`), a docs-only PR would fail it. Then the implementation PR targets the docs branch and merges into it first, and the docs PR merges to `main` carrying both. Make sure CI also runs on that stacked PR (CI on all pull requests, not only those to `main`), or run the same checks locally and paste the results in the PR, so the implementation is checked before it reaches the docs branch.
