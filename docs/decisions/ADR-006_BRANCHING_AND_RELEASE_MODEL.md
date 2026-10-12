# ADR-006 — Branching and release model

- Status: **Accepted** — effective when this PR is merged (owner decision 2026-10-12)
- Date: 2026-10-12
- Decision owner: Raul Casañas
- Related specs: AGENTS.md (branch naming, merging), ADR-001 (production on release, Pages preview), ADR-002 (lead backend), US-016, US-017, US-026, US-027

## Decision Request
Now that `v0.1.0` is in production, does the project need a long-lived `develop` branch for unreleased work, or does work keep landing on `main`? And how are urgent production fixes and lead-endpoint changes kept out of production until they are released?

## Context
- Production changes only when a GitHub Release is published: `release-cpanel.yml` builds and uploads **the release's tag** (ADR-001). Merging to `main` never touches production.
- Every merge to `main` is previewed on GitHub Pages (`noindex`), which already works as a staging site for the frontend.
- `main` is protected by a ruleset with required checks (`lint`, `typecheck`, `unit`, `build`, `e2e`, `lighthouse`); every PR gets the review-only agent's review and the owner's approval.
- Small team (owner + agents), one site, frequent small releases.
- Gap 1: if `main` holds unreleased work and production needs an urgent fix, releasing from `main` would ship both.
- Gap 2: the lead endpoint has no staging copy. The preview and production both post to the same Apps Script deployment and the same sheet, so preview tests land in the real sheet and an Apps Script redeploy reaches production immediately, outside the release process.

## Decision Drivers
- Production changes only through deliberate, smoke-tested releases.
- As little process overhead as possible for a small team; no branches to keep in sync.
- An escape hatch for urgent fixes that never ships unreleased work.
- The backend follows the same "test first, then production" rule as the frontend.

## Options Considered

### Option A — Trunk-based on `main`, releases from tags, short-lived release branches only for urgent fixes (chosen)
Pros: one integration branch; the preview always shows exactly what the next release will contain; already how CI, Pages and the release workflow work; no syncing.
Cons: `main` must stay releasable at all times (discipline in PR size, flags for unfinished work).
Risks: unfinished work reaching `main` — mitigated by small self-contained PRs, feature flags and required checks.

### Option B — Git-flow style `develop` + `main`
Pros: familiar; unreleased work is visibly separate from `main`.
Cons: every change merges twice (story → `develop` → `main`); the branches drift and need syncing; Pages, CI, rulesets, agent prompts and runbooks would all need a second target; it duplicates what release tags already give.
Risks: merge conflicts between `develop` and `main`, and confusion about which branch the preview shows.

## Decision
Option A.

1. **`main` is the only long-lived branch.** Story and docs branches (AGENTS.md naming) branch from `main` and merge back through a reviewed PR with the required checks green.
2. **`main` is always releasable.** PRs are small and complete; work that is not ready to show is hidden behind a build flag (`PUBLIC_*`, like `PUBLIC_SHOW_CLIENT_LOGOS`) until it is.
3. **Production = release tags.** A release (`vMAJOR.MINOR.PATCH`, semantic versioning) is published from `main`; `release-cpanel.yml` deploys the tag; the smoke test (RELEASE.md §4) is recorded in the release. Release often, so unreleased work does not pile up.
4. **Urgent fixes while `main` has unreleased work** (rare):
   1. Create `release/vMAJOR.MINOR.x` from the last release tag (e.g. `release/v0.1.x` from `v0.1.0`), if it does not exist yet.
   2. Fix on a `DS-FIX-<slug>` branch from it and open the PR **against `release/vMAJOR.MINOR.x`** (CI runs on every PR; the review-only agent reviews it; the owner merges).
   3. Publish the next patch release (e.g. `v0.1.1`) with **Target = `release/vMAJOR.MINOR.x`**; the workflow deploys that tag only.
   4. Bring the fix to `main` in a normal PR (merge or cherry-pick of the fix commit) so the next release from `main` keeps it.
   When `main` has nothing unreleased, the fix simply goes to `main` and is released from there.

   **Gate for a release-branch patch** (it replaces RELEASE.md §3's "CI green on the `main` commit" and "preview looks right", which a release branch cannot meet: `ci.yml` runs `push` only on `main` and `pages.yml` only previews `main`): the fix PR's six required checks are green on its head, the release-branch ruleset blocks the merge otherwise, and the fix PR is up to date with the release branch, so the merged commit is the one CI tested. There is no preview step; the production smoke test (RELEASE.md §4) right after the deploy is the real check, with rollback to the previous tag if it fails. Agent 3 may also add `release/**` to `ci.yml`'s `push` branches (US-027).
5. **The lead endpoint gets a staging copy (US-026).** A second Apps Script project and sheet, owned by `manager@`, serve the Pages preview through the repository variable `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW`; production keeps `PUBLIC_LEAD_ENDPOINT_URL`. Apps Script changes are deployed to staging first, tested from the preview, and deployed to production (new version of the same deployment, URL unchanged) only as part of a release, with the smoke test after it.

## Rationale
The release tag already separates "integrated" from "in production"; the preview already is the staging site for the frontend. A `develop` branch would add a second merge and a sync problem without adding safety. The two real gaps — urgent fixes and the shared endpoint — are closed with a short-lived release branch and a staging endpoint.

## Consequences
### Positive
- One place for all work; the preview equals the next release.
- Urgent fixes can ship without unreleased work.
- Preview tests no longer touch the real leads sheet; endpoint changes follow the release process.
### Negative / Trade-offs
- `main` must stay releasable: flags for unfinished work, discipline in PR size.
- Two Apps Script projects to keep on the same code (the runbook covers deploying both).

## Architecture Impact
None to the site. A second, identical Apps Script deployment for the preview; its sheet and Script Properties are separate (contract §8).

## Implementation Impact
- AGENTS.md: release-branch naming for urgent fixes.
- US-026 (Agent 3 + owner): staging endpoint, `pages.yml` uses `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW`, runbooks.
- US-027 (Agent 3): RELEASE.md "Urgent fix" section with the steps in Decision 4.
- Owner: add `release/*` to the branch ruleset (PR required, required checks, no force push or deletion).

## Validation
- The next release is published from `main` with the smoke test recorded.
- After US-026: a lead sent from the preview lands in the staging sheet, not the production sheet.
- The first time an urgent fix is needed, the steps in RELEASE.md are followed and the fix reaches `main` afterwards.

## Review Trigger
More than one person or team developing in parallel on long-running features; a need for a long-lived staging site with its own release cadence; repeated urgent fixes (a sign that releases need a stronger gate).
