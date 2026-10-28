# RELEASE — preview, release and production smoke test (owner runbook)

For: Raul Casañas (owner). Covers US-016 (AC1–AC3), US-027 (urgent fix, section 6), ADR-001,
ADR-006, NFR-003 and the Sprint 001 Definition of Done. One-time GoDaddy setup, the cPanel upload and rollback: `docs/runbooks/DEPLOYMENT.md`.
Apps Script: `docs/runbooks/APPS_SCRIPT_SETUP.md`.
Updated 2026-10-19 (US-026, ADR-006): the preview posts leads to the **staging** Apps Script
project; Apps Script changes reach production only as part of a release (§3).

| Where | URL | Deployed by | Leads go to |
|---|---|---|---|
| Preview (review only, never linked publicly, `noindex`) | <https://raulc87.github.io/DigitalStrike-main-page/> | `.github/workflows/pages.yml`, on every push to `main` (and by hand) | Staging Apps Script, sheet "DigitalStrike leads (staging)" |
| Production | <https://digitalstrike-solutions.com> | `.github/workflows/release-cpanel.yml`, when a GitHub Release is published (US-017) | Production Apps Script, sheet "DigitalStrike Leads" |

---

## 1. One-time setup

### 1.1 GitHub Pages
**Settings → Pages → Build and deployment → Source: "GitHub Actions"** (already done on 2026-10-11).
Nothing else: the workflow builds with the base path `/DigitalStrike-main-page` and deploys.

### 1.2 Repository variables (public values, not secrets)
**Settings → Secrets and variables → Actions → Variables tab → New repository variable.** Each
build uses its own lead endpoint variable; all the other variables are used by both the preview
and the production build. An unset variable falls back to the value in contract §8, except the
two endpoints.

| Variable | Value |
|---|---|
| `PUBLIC_LEAD_ENDPOINT_URL` | **Production build only.** The `/exec` URL of the production Apps Script project (APPS_SCRIPT_SETUP.md step 6). **Required**; without it the production form shows the error with the email fallback |
| `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW` | **Preview build only.** The `/exec` URL of the staging Apps Script project (APPS_SCRIPT_SETUP.md §11). Without it the preview form shows the error with the email fallback; the preview never falls back to the production URL, and its build fails if both variables hold the same URL |
| `PUBLIC_CALENDLY_URL` | `https://calendly.com/rcasanas/1hr` (optional, same default) |
| `PUBLIC_CONTACT_EMAIL` | `manager@digitalstrike-solutions.com` (optional, same default) |
| `PUBLIC_LINKEDIN_URL` | `https://www.linkedin.com/in/raul-casanas/` (optional, same default) |
| `PUBLIC_PRIVACY_NOTICE_VERSION` | `2026-10-14-v1` (optional, same default). It must be listed in the Apps Script property `ACCEPTED_PRIVACY_NOTICE_VERSIONS` of **both** projects, staging and production, **before** a build showing it is deployed (US-018 AC2) |
| `PUBLIC_SHOW_CLIENT_LOGOS` | `true` (optional; `false` hides the clients section) |

Set by the workflows themselves, not as variables: `PUBLIC_SITE_URL`, `PUBLIC_BASE_PATH`,
`PUBLIC_NOINDEX` (`true` only on the preview) and `PUBLIC_SHOW_PENDING_BADGES` (`true` on the
preview, `false` in production).

After adding or changing a variable, rebuild the preview: **Actions → Pages → Run workflow** (branch `main`).

## 2. Check the preview (after each merge, and before a release)

1. **Actions → Pages**: the latest run on `main` is green.
2. Open <https://raulc87.github.io/DigitalStrike-main-page/>: it sends you to `/es/` or `/en/`; both
   pages load with styles, fonts and images (US-016 AC2).
3. Once `PUBLIC_LEAD_ENDPOINT_URL_PREVIEW` is set (APPS_SCRIPT_SETUP.md §11): send a test lead
   from the preview. It lands in the **staging** sheet "DigitalStrike leads (staging)", never in
   "DigitalStrike Leads". Check the row, then set its `status` to `rejected` (or delete it). If
   `main` has Apps Script changes, deploy them to staging first (APPS_SCRIPT_SETUP.md §8).

Pending-content badges ("Contenido provisional") are expected on the preview only.

## 3. Cut a release

Preconditions:
- CI is green on the `main` commit you are releasing (**Actions → CI**).
- The preview of that commit looks right (section 2).
- Apps Script changes since the last release (if any) are deployed to **staging** and tested from
  the preview (section 2, APPS_SCRIPT_SETUP.md §8). Production gets them only in step 1 below.
- `ACCEPTED_PRIVACY_NOTICE_VERSIONS` includes the version the site shows, in **both** Apps
  Script projects.
- The three `CPANEL_*` secrets are set (`CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_PASSWORD`; DEPLOYMENT.md §2).
- **Security gate** (`docs/security/SECURITY_BASELINE.md` once it exists; the kit default, which DS may make stricter, never looser; kit v1.3.0): no open critical or high security finding on the commit you release (from the pre-release security agent's code review and staging scan, or from the last penetration test and production scan), every critical and high fix re-checked, and every medium or low finding has a fix story or an accepted risk signed by the owner. A security hotfix (section 6) may be released while other findings are open. **Overdue test:** DS was already in production when it adopted the baseline; if the deadline recorded in the baseline has passed and the required penetration test has not run, do not release (a security hotfix aside): the test runs first on the production already live ([`AGENTS.md`](../../AGENTS.md) → Security baseline). Expected: no deadline passed, or the test has run.
- **Before the release that is followed by the post-release security step** (section 4.8: DS's next release, or the dated deadline recorded in the baseline): check that the pre-release security agent's code review covers the commit you release ([`AGENTS.md`](../../AGENTS.md) → Pre-release security agent), and that these are signed and in place: the owner's written approval and scope for the agent's production scan, with a time window that opens right after this release (`docs/security/PENTEST_PLAN.md` → Agent scans); the PTES tester's written authorization and scope with the same timing (`PENTEST_PLAN.md` §1); and the person who can stop each one, named. Expected: all signed; otherwise do not release yet.

Steps (first release: `v0.1.0`):
1. **Only if the release includes Apps Script changes:** deploy them to the **production**
   project now, as a **new version of the same deployment** (APPS_SCRIPT_SETUP.md §8), so the
   `/exec` URL does not change. This is the only time production Apps Script is redeployed.
   No Apps Script change since the last release: skip this step.

   Deploy the code of the `main` commit you are releasing (the one CI is green on), not a local
   work in progress. **Option A (by hand):** copy the files from GitHub with the branch selector
   on `main`. **Option B (clasp):** first update your checkout and check that the last commit
   shown is that commit, then push with the **production** block of APPS_SCRIPT_SETUP.md §8
   item 1. On macOS or Linux:

   ```bash
   git checkout main && git pull --ff-only origin main && git log -1 --oneline
   ```

   On Windows (PowerShell):

   ```powershell
   git checkout main; git pull --ff-only origin main; git log -1 --oneline
   ```
2. **Releases → Draft a new release**.
3. **Choose a tag** → type `v0.1.0` → **Create new tag: v0.1.0 on publish**. Target: `main`.
4. Title `v0.1.0`; description: the PRs included (**Generate release notes** fills it).
5. **Publish release.** This starts **Actions → Release to cPanel**, which builds for
   `https://digitalstrike-solutions.com` and uploads it (replacing the holding page on the first release).
6. When that run is green, do the smoke test (section 4) before announcing anything. It also
   tests the production Apps Script (section 4.2).

Later releases follow [semantic versioning](https://semver.org/): `v0.1.1` for fixes, `v0.2.0` for
new features. To roll back, see DEPLOYMENT.md; if step 1 redeployed the production Apps Script,
also set it back to its previous version (APPS_SCRIPT_SETUP.md §8, "To undo a deployment").

## 4. Production smoke test (US-016 AC3; Sprint 001 Definition of Done)

Do it on `https://digitalstrike-solutions.com` right after each release. Note the date, the version
and every result in the release's description (**Releases → Edit**).

### 4.1 Both languages over HTTPS
- `http://digitalstrike-solutions.com` and `http://www.digitalstrike-solutions.com` end on
  `https://…` (padlock shown).
- `https://digitalstrike-solutions.com/` sends you to `/es/` or `/en/`; both pages show every
  section; the `ES | EN` toggle switches language.

### 4.2 Lead flow with the real endpoint
1. On `/es/`, send a test lead with an inbox you can read (message, for example, "Prueba de humo
   del release v0.1.0.").
2. The page shows "¡Recibido, …!".
3. In the sheet: a new row with `status` `new`, and `owner_email_status` and
   `confirmation_email_status` both `sent`.
4. Both emails arrive: the owner notification in `manager@` and the confirmation in the test
   inbox (in Spanish). Check the sender, `Reply-To`, and in **Show original**: `dkim=pass` and
   `spf=pass` (ADR-005).
5. Repeat once on `/en/` and check the English confirmation.
6. Set both test rows' `status` to `rejected`.

Recommended (UX §3 autofill decision): fill the form once with the browser's or a password
manager's autofill and check that the row still lands in the sheet.

### 4.3 Calendly
In **Agenda tu sesión 0**, nothing from Calendly loads until you click **Ver horarios disponibles**;
after the click, the calendar appears. After a successful submission, it appears prefilled with the
name and email.

### 4.4 Privacy notice in both languages
Open the notice from the form and from the footer, on `/es/privacidad/` and `/en/privacy/`. It shows
the version `2026-10-14-v1` and mentions GoDaddy's **access logs**, its **monitoring script** and
its **cookies** (CONTENT §13, ADR-001).

### 4.5 Live cookies and third-party domains (fresh browser profile)
Use a browser profile with no history (Chrome: profile menu → **Add** → **Continue without an
account**; an Incognito window also works) so nothing is left from earlier visits.

1. Open DevTools (**F12**) → **Network** tab → tick **Preserve log**. Then load
   `https://digitalstrike-solutions.com/es/` and scroll to the bottom **without clicking anything**.
2. **Third-party domains:** in the Network filter, type `-domain:digitalstrike-solutions.com`.
   The only expected entries are:
   - a script from **`img1.wsimg.com`** (GoDaddy's `…/tccl.min.js`);
   - requests to **`csp.secureserver.net`** (its beacons).

   Nothing from `calendly.com` before you click (FR-016), and no other domain.
3. **Cookies:** **Application** tab → **Storage → Cookies → `https://digitalstrike-solutions.com`**.
   The expected list:

   | Cookie | Expected lifetime (Expires / Max-Age column) |
   |---|---|
   | `_tccl_visitor` | about 1 year (no longer than 1 year) |
   | `_tccl_visit` | short (the visit) |
   | `_scc_session` | short (the visit / session) |

   No other cookie on the domain. The site's own code sets none; `ds_lang` lives in Local Storage,
   not in cookies.
4. Compare with the baseline (US-016 AC3, ADR-001, PROJECT_SPEC §7). **If there is any new cookie,
   a longer lifetime, or a new third-party domain, stop: do not announce the release.** Update
   the privacy notice first (CONTENT §13, change management), because this is ADR-001's review
   trigger. Then decide whether to ask GoDaddy support to remove the script.

### 4.6 Production Lighthouse (NFR-003)
1. Open <https://pagespeed.web.dev/>, enter `https://digitalstrike-solutions.com/es/`, then
   **Analyze**. Read the **Mobile** tab.
2. Record **Performance** and **Accessibility** in the release description.
3. Below **90** (Performance) or **95** (Accessibility): this is your decision under NFR-003.
   Either accept it (GoDaddy's injected script is outside our code; the CI gate on our own build
   still passes), or ask GoDaddy to remove the script (ADR-001). Note the decision in the release.

### 4.7 Smoke test record (copy into the release description)

```text
Smoke test vX.Y.Z — yyyy-MM-dd hh:mm (CR), by <name>
- HTTPS + /es/ + /en/ + toggle:            ok / issue
- Lead ES: row + 2 emails (dkim/spf pass): ok / issue  (lead_id …, marked rejected)
- Lead EN: row + confirmation EN:          ok / issue  (lead_id …, marked rejected)
- Calendly (after click / after submit):   ok / issue
- Privacy notice ES/EN (GoDaddy logs, script, cookies, version): ok / issue
- Fresh profile: domains = img1.wsimg.com, csp.secureserver.net only: ok / issue
- Fresh profile: cookies = _tccl_visitor (≤1 year), _tccl_visit, _scc_session only: ok / issue
- PageSpeed mobile /es/: Performance __, Accessibility __  (decision if below 90/95: …)
```

### 4.8 Post-release security (right after the release; kit v1.3.0)

Only for a release that the security gate in section 3 marks as followed by this step. It starts exactly after the release: its trigger is the smoke test above passing ([`AGENTS.md`](../../AGENTS.md) → Security baseline).
1. Tell the coordinator that the smoke test passed: it starts the pre-release security agent's **production scan**, inside the time window of its signed approval. Expected: the scan starts within the window, passive or baseline unless the approval names more, and always passive baseline only on a host the baseline marks "passive baseline only" (`SECURITY_BASELINE.md` §5.1).
2. Confirm to the tester that the release is live: the **human PTES test** on production starts inside its window (DS handles personal data through the lead form). Expected: the tester confirms the start.
3. During both: the named person watches production and can stop either one. If production degrades, stop it and roll back (section 5, DEPLOYMENT.md). Expected: the smoke-test checks still pass while they run.
4. Findings go to the coordinator, which creates the remediation stories. A critical finding is fixed as a hotfix (section 6), released, smoke-tested, and re-checked by the security agent. Expected: no critical finding left open.
5. Record in the release description the dates of the scan and of the test report (not their content), and that the step ran. The tester runs the test and writes a report; never write that the release was "certified". Expected: dates recorded.

The findings gate the **next** release (section 3).

## 5. If something fails

- **Release workflow red or skipped:** DEPLOYMENT.md (secrets, FTP account, rollback). The holding
  page stays live until the first successful upload.
- **Lead flow fails:** APPS_SCRIPT_SETUP.md §7 (curl smoke test) and the Apps Script
  **Executions** log, which shows only `lead_id` and error codes. If the release redeployed the
  production Apps Script (section 3, step 1), set it back to its previous version
  (APPS_SCRIPT_SETUP.md §8, "To undo a deployment") together with the site rollback.
- **A visible defect:** fix it on a branch, merge, check the preview, then publish a new patch
  release (`v0.1.1`). Or roll back to the previous release (DEPLOYMENT.md). If `main` has merged
  work that is not released yet, use the urgent-fix procedure (section 6) instead.

## 6. Urgent fix (ADR-006 Decision 4; US-027)

Added 2026-10-19. A production fix that must ship **without** the unreleased work on `main`. It
is published from a short-lived branch `release/vMAJOR.MINOR.x` instead of `main`. Rare by
design: release often, so `main` seldom holds unreleased work.

### 6.1 When to use it, and when not

Open **Code → Releases**. Under the latest release, GitHub shows **"N commits to main since this
release"**; click it to list them (no such line means no commits).

- **No commits, or only commits you are happy to ship now** (for example docs-only commits, as
  on 2026-10-19 after `v0.1.1`): **do not use this section.** Fix on `main` as usual (story or `DS-FIX-…` branch → PR to `main`), then release from `main` (section 3).
- **Merged work that must not reach production yet:** use this section.

### 6.2 One-time prerequisite: protect `release/*` (owner)

Do this **before the first release branch is ever created** (SPRINT_002 owner task 9). It makes
GitHub enforce the gate in 6.5.

1. GitHub → **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. **Ruleset name:** `release branches`. **Enforcement status:** **Active**.
3. **Target branches → Add target → Include by pattern** → `release/*` → **Add inclusion
   pattern**.
4. Under **Branch rules**, tick:
   - **Restrict deletions**;
   - **Require a pull request before merging**;
   - **Require status checks to pass**, then tick **Require branches to be up to date before
     merging**, and with **Add checks** add the six checks `lint`, `typecheck`, `unit`, `build`,
     `e2e`, `lighthouse` (source: GitHub Actions);
   - **Block force pushes**.
5. **Create**.

**Success:** **Settings → Rules → Rulesets** lists `release branches` as **Active**, targeting
`release/*`, next to the `main` ruleset.

### 6.3 Values to have ready

| Value | Example | Where it comes from |
|---|---|---|
| Last tag (what production runs) | `v0.1.2` | **Code → Releases**, the latest release |
| Release branch | `release/v0.1.x` | `release/` + the last tag's `vMAJOR.MINOR` + `.x` |
| New tag | `v0.1.3` | The last tag with PATCH + 1 |

### 6.4 Create the release branch (if it does not exist yet)

If **Code → Branches** already lists the release branch, skip to the check at the end of this
step.

**No-terminal (GitHub UI):**
1. **Code** tab → branch dropdown (top left, shows `main`) → **Tags** tab → click the last tag.
2. Open the same dropdown again → **Branches** tab → type the release branch name, e.g.
   `release/v0.1.x` → click **Create branch release/v0.1.x from v0.1.2** (the line names the
   tag you selected in item 1; if it says `from main`, go back to item 1).

**Terminal alternative.** First set the two values (edit them in this block only):

```bash
LAST_TAG='v0.1.2'
RELEASE_BRANCH='release/v0.1.x'
```

Then, on macOS or Linux:

```bash
git fetch origin --tags && git push origin "refs/tags/$LAST_TAG^{commit}:refs/heads/$RELEASE_BRANCH"
```

On Windows (PowerShell), set the values and push:

```powershell
$LAST_TAG = 'v0.1.2'; $RELEASE_BRANCH = 'release/v0.1.x'
```

```powershell
git fetch origin --tags; git push origin "refs/tags/$LAST_TAG^{commit}:refs/heads/$RELEASE_BRANCH"
```

**Check (also when the branch already existed):** open the comparison of the release branch
with the last tag. In the browser, the address is
`https://github.com/Raulc87/DigitalStrike-main-page/compare/` followed by the two values from
6.3, e.g. `…/compare/release/v0.1.x...v0.1.2`. If you set the values in the terminal above, this
prints the address to open, on macOS or Linux:

```bash
echo "https://github.com/Raulc87/DigitalStrike-main-page/compare/$RELEASE_BRANCH...$LAST_TAG"
```

On Windows (PowerShell):

```powershell
"https://github.com/Raulc87/DigitalStrike-main-page/compare/$RELEASE_BRANCH...$LAST_TAG"
```

Expected: "There isn't
anything to compare" (the tag is already in the branch). If it lists commits, the last release
was published from `main` after the branch was created. First bring that tag in: a branch made
from the tag (name `DS-FIX-sync-<last tag>`, e.g. `DS-FIX-sync-v0.1.2`) and a PR from it into the
release branch, with the gate of 6.5. Then continue.

### 6.5 The fix PR and the gate

1. The fix is made on a branch `DS-FIX-<slug>` created **from the release branch**, and its PR
   has **base: the release branch** (not `main`). CI runs on every PR; the review-only agent
   reviews it as usual. Keep it to the fix only.
2. If the fix changes `apps-script/`, it is deployed to the **staging** project and tested with
   curl first (APPS_SCRIPT_SETUP.md §7 and §8); production gets it only in 6.6.
3. **Gate.** This replaces section 3's preconditions "CI is green on the `main` commit" and "the
   preview looks right", which a release branch cannot meet (`pages.yml` previews only `main`).
   Merge the fix PR only when:
   - the six required checks are green on the PR's **latest commit**;
   - the PR is **up to date** with the release branch: the PR page does not show "This branch is
     out-of-date with the base branch". If it does, click **Update branch** and wait for the six checks
     again. The ruleset of 6.2 blocks the merge otherwise, so the merged commit is the one CI
     tested;
   - the review is done and you approve.

   There is **no preview step**. The production smoke test right after the deploy (6.7) is the
   real check.
4. Merge the PR (you, the owner).

**Success:** the release branch's latest commit is the fix, and **Actions → CI** shows a green
run for the `push` to the release branch.

### 6.6 Publish the patch release from the release branch

1. **Only if the fix changes `apps-script/`:** deploy it to the **production** project now, as
   a new version of the same deployment (APPS_SCRIPT_SETUP.md §8). Deploy the code of the
   release branch's latest commit, not `main`. **Option A (by hand):** copy the files from GitHub
   with the branch selector on the release branch. **Option B (clasp):** set the values of 6.4
   (terminal alternative) first, check out the release branch as below, then push with the
   **production** block of APPS_SCRIPT_SETUP.md §8 item 1. On macOS or Linux:

   ```bash
   git fetch origin && git checkout "$RELEASE_BRANCH" && git pull --ff-only origin "$RELEASE_BRANCH" && git log -1 --oneline
   ```

   On Windows (PowerShell):

   ```powershell
   git fetch origin; git checkout "$RELEASE_BRANCH"; git pull --ff-only origin "$RELEASE_BRANCH"; git log -1 --oneline
   ```

   The last line shown must be the fix's merge commit. Afterwards, go back to `main`
   (`git checkout main`).
2. **Releases → Draft a new release**.
3. **Choose a tag** → type the new tag, e.g. `v0.1.3` → **Create new tag: v0.1.3 on publish**.
4. **Target: the release branch**, e.g. `release/v0.1.x`. This is the control that decides what
   ships: with `main` as Target, the unreleased work on `main` would ship too.
5. Title: the new tag. **Generate release notes**, with **Previous tag:** the last tag.
6. **Publish release.**

**Actions → Release to cPanel** deploys **the release's tag**, whatever its Target branch. The
checkout step in `.github/workflows/release-cpanel.yml` is
`ref: ${{ github.event_name == 'release' && github.event.release.tag_name || inputs.ref || github.ref }}`,
so a release event always builds `github.event.release.tag_name`.

**Success:** the run for the new tag is green and ends with the notice **"Deployed — … is
live"**; the short commit it names is the release branch's latest commit.

### 6.7 Smoke test right after the deploy

Do the full production smoke test (section 4) at once and record it in the release.

**If it fails:** roll back to the last tag (DEPLOYMENT.md §6: **Run workflow** with the last tag,
**Dry run** unticked); if the fix included Apps Script, also set the production deployment back
to its previous version (APPS_SCRIPT_SETUP.md §8, "To undo a deployment"). Note the rollback in the release, then fix
again from 6.5.

### 6.8 Bring the fix to `main`

The next release from `main` must keep the fix.
1. **Pull requests → New pull request**, **base:** `main`, **compare:** the release branch.
   **Create pull request** with the title `[DS-FIX] Bring <new tag> fix to main`. It goes
   through the normal review and the `main` checks.
2. If GitHub reports conflicts, close that PR. Instead, the fix's author creates
   `DS-FIX-<slug>-main` from `main`, cherry-picks the fix commit(s), resolves the conflicts and
   opens the PR to `main`.

**Success:** the PR is merged, CI is green on `main`, and the Pages preview shows the fix.

If the fix changed `apps-script/`, staging now runs the release branch's code (6.5 item 2), which
lacks any unreleased Apps Script change on `main`. Once the fix is on `main`, redeploy staging
from `main` (APPS_SCRIPT_SETUP.md §8, staging), so the preview tests the next release's code.

Leave the release branch in place: the next urgent fix on the same `vMAJOR.MINOR` line reuses
it (after the check in 6.4). A release of a new MINOR version gets its own branch only if it
ever needs an urgent fix.
