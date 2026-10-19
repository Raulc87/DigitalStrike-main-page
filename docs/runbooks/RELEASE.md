# RELEASE — preview, release and production smoke test (owner runbook)

For: Raul Casañas (owner). Covers US-016 (AC1–AC3), ADR-001, NFR-003 and the Sprint 001 Definition
of Done. One-time GoDaddy setup, the cPanel upload and rollback: `docs/runbooks/DEPLOYMENT.md`.
Apps Script: `docs/runbooks/APPS_SCRIPT_SETUP.md`.

| Where | URL | Deployed by |
|---|---|---|
| Preview (review only, never linked publicly, `noindex`) | <https://raulc87.github.io/DigitalStrike-main-page/> | `.github/workflows/pages.yml`, on every push to `main` (and by hand) |
| Production | <https://digitalstrike-solutions.com> | `.github/workflows/release-cpanel.yml`, when a GitHub Release is published (US-017) |

---

## 1. One-time setup

### 1.1 GitHub Pages
**Settings → Pages → Build and deployment → Source: "GitHub Actions"** (already done on 2026-10-11).
Nothing else: the workflow builds with the base path `/DigitalStrike-main-page` and deploys.

### 1.2 Repository variables (public values, not secrets)
**Settings → Secrets and variables → Actions → Variables tab → New repository variable.** They are
used by both the preview and the production build. An unset variable falls back to the value in
contract §8, except the endpoint.

| Variable | Value |
|---|---|
| `PUBLIC_LEAD_ENDPOINT_URL` | The Apps Script `/exec` URL (APPS_SCRIPT_SETUP.md step 6). **Required**; without it the form shows the error with the email fallback |
| `PUBLIC_CALENDLY_URL` | `https://calendly.com/rcasanas/1hr` (optional, same default) |
| `PUBLIC_CONTACT_EMAIL` | `manager@digitalstrike-solutions.com` (optional, same default) |
| `PUBLIC_LINKEDIN_URL` | `https://www.linkedin.com/in/raul-casanas/` (optional, same default) |
| `PUBLIC_PRIVACY_NOTICE_VERSION` | `2026-10-14-v1` (optional, same default). It must be listed in the Apps Script property `ACCEPTED_PRIVACY_NOTICE_VERSIONS` **before** a build showing it is deployed (US-018 AC2) |
| `PUBLIC_SHOW_CLIENT_LOGOS` | `true` (optional; `false` hides the clients section) |

Set by the workflows themselves, not as variables: `PUBLIC_SITE_URL`, `PUBLIC_BASE_PATH`,
`PUBLIC_NOINDEX` (`true` only on the preview) and `PUBLIC_SHOW_PENDING_BADGES` (`true` on the
preview, `false` in production).

After adding or changing a variable, rebuild the preview: **Actions → Pages → Run workflow** (branch `main`).

## 2. Check the preview (after each merge, and before a release)

1. **Actions → Pages**: the latest run on `main` is green.
2. Open <https://raulc87.github.io/DigitalStrike-main-page/>: it sends you to `/es/` or `/en/`; both
   pages load with styles, fonts and images (US-016 AC2).
3. Once `PUBLIC_LEAD_ENDPOINT_URL` is set: send a test lead from the preview, check the row in the
   sheet, then set its `status` to `rejected`.

Pending-content badges ("Contenido provisional") are expected on the preview only.

## 3. Cut a release

Preconditions:
- CI is green on the `main` commit you are releasing (**Actions → CI**).
- The preview of that commit looks right (section 2).
- The Apps Script is deployed with the current code, and its `ACCEPTED_PRIVACY_NOTICE_VERSIONS`
  includes the version the site shows. "Current code" includes the Gmail sending change
  (`lib/gmail` and the `gmail.send` scope, authorized once). Redeploy it as a **new version of
  the same deployment** (APPS_SCRIPT_SETUP.md §8), so the `/exec` URL does not change.
- The three `CPANEL_*` secrets are set (`CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_PASSWORD`; DEPLOYMENT.md §2).

Steps (first release: `v0.1.0`):
1. **Releases → Draft a new release**.
2. **Choose a tag** → type `v0.1.0` → **Create new tag: v0.1.0 on publish**. Target: `main`.
3. Title `v0.1.0`; description: the PRs included (**Generate release notes** fills it).
4. **Publish release.** This starts **Actions → Release to cPanel**, which builds for
   `https://digitalstrike-solutions.com` and uploads it (replacing the holding page on the first release).
5. When that run is green, do the smoke test (section 4) before announcing anything.

Later releases follow [semantic versioning](https://semver.org/): `v0.1.1` for fixes, `v0.2.0` for
new features. To roll back, see DEPLOYMENT.md.

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

## 5. If something fails

- **Release workflow red or skipped:** DEPLOYMENT.md (secrets, FTP account, rollback). The holding
  page stays live until the first successful upload.
- **Lead flow fails:** APPS_SCRIPT_SETUP.md §7 (curl smoke test) and the Apps Script
  **Executions** log, which shows only `lead_id` and error codes.
- **A visible defect:** fix it on a branch, merge, check the preview, then publish a new patch
  release (`v0.1.1`). Or roll back to the previous release (DEPLOYMENT.md).
