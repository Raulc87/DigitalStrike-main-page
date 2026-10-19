# DEPLOYMENT — production on GoDaddy cPanel (owner runbook)

For: Raul Casañas (owner). Covers US-017 (AC1–AC5) and ADR-001. Workflow:
`.github/workflows/release-cpanel.yml` (**Actions → Release to cPanel**). Cutting a release and
the smoke test: `docs/runbooks/RELEASE.md`.

**State on 2026-10-11 (done by the owner):** a dedicated FTP account limited to `public_html`
exists, and the `CPANEL_*` repository secrets are set. **Update 2026-10-19 (US-025):** the
target folder is now the repository **variable** `CPANEL_TARGET_DIR` (default `/`, because that
account's root is `public_html`), no longer a secret; move it once as in §2.1. AutoSSL is active and HTTPS is forced (2026-10-10). The **dry
run** in §4 passed on 2026-10-12, with `CPANEL_HOST` set to the server's full host name (§2). Next
step: the release (RELEASE.md §3).

---

## 1. Dedicated FTP account (one time; done)

The workflow uses its own FTP account, never the main cPanel login. If you ever recreate it:
1. **cPanel → Files → FTP Accounts → Add FTP Account.**
2. Log in: `deploy` (the full login becomes `deploy@digitalstrike-solutions.com`).
3. Password: use the generator (long, random), and copy it once into the secret in §2.
4. **Directory: `public_html` exactly.** cPanel suggests `public_html/deploy`; delete the
   `/deploy` part. The account must not reach anything above `public_html`.
5. Quota: Unlimited. **Create FTP Account.**

## 2. Repository secrets (one time; done)

**GitHub → Settings → Secrets and variables → Actions → Secrets tab.** These are secrets, never
variables, and are never written in any file.

| Secret | Value |
|---|---|
| `CPANEL_HOST` | The server's **full host name** (below), not the `ftp.digitalstrike-solutions.com` name cPanel suggests. Host name only (no `ftp://`, no trailing `/`), because the workflow adds the scheme |
| `CPANEL_USERNAME` | The full FTP login, e.g. `deploy@digitalstrike-solutions.com` |
| `CPANEL_PASSWORD` | That account's password |

**Finding the full host name for `CPANEL_HOST`.** cPanel's **FTP Accounts → Configure FTP Client →
FTP Server** shows `ftp.digitalstrike-solutions.com`. That name has no DNS record (checked on
2026-10-12: NXDOMAIN), so the workflow fails with "Name or service not known" (§7). Use the
server's own name instead:

1. **cPanel → General Information → Server Information**: copy the **Server Name** (it looks like
   `p3plzcpnlNNNNNN`) and the **Shared IP Address**.
2. Add the suffix `.prod.phx3.secureserver.net`, for example
   `p3plzcpnlNNNNNN.prod.phx3.secureserver.net`.
3. Check it on your machine: `nslookup p3plzcpnlNNNNNN.prod.phx3.secureserver.net` (macOS, Linux,
   Windows) must answer the **Shared IP Address** from step 1. If it does not resolve, or answers
   another address, ask GoDaddy support for the FTP host name of the account's server.

That host name also matches the server's TLS certificate, so `CPANEL_TLS_VERIFY` stays unset.

If any of these three is missing, the workflow does not fail. It ends with the notice
**"Deploy skipped — Repository secrets not set: …"** and deploys nothing (US-017 AC2).

**Masked values in the logs.** GitHub replaces every secret's value with `***` in the run's log.
The host name therefore shows as `***` (for example `open: ***: …`). That is expected. Paths are
readable (`_astro/…`), because the target folder is a variable (§2.1), not a secret.

### 2.1 Repository variables (public values, not secrets)

**GitHub → Settings → Secrets and variables → Actions → Variables tab.** Both are optional.

| Variable | Value |
|---|---|
| `CPANEL_TARGET_DIR` | `/` (the FTP account's root is already `public_html`). Unset means `/` |
| `CPANEL_TLS_VERIFY` | Unset by default, which means the certificate is checked. Only see §7 if the dry run reports a certificate problem |

**Moving `CPANEL_TARGET_DIR` from a secret to a variable (one time, after US-025 is merged).**
Until 2026-10-19 the folder was a secret. Because its value is `/`, GitHub masked **every `/`**
in the log as `***` (`_astro/…` showed as `_astro***…`). To move it:
1. **Variables tab → New repository variable.** **Name:** `CPANEL_TARGET_DIR`. **Value:** `/`.
   **Add variable.**
2. Run the dry run (§4).

**Success:** the Variables tab lists `CPANEL_TARGET_DIR` = `/`; in the dry run's step **Upload
over FTPS**, the file lists show plain paths such as `_astro/…` and `es/index.html`, and only the
host name shows as `***`.

3. **After the first release that includes US-025 (`v0.1.2`) is deployed**, remove the old
   secret: **Secrets tab** → the row `CPANEL_TARGET_DIR` → trash icon → **Yes, remove it**. Not
   earlier: **Re-run all jobs** on the run of an older release (§6, alternative) runs that
   release's own copy of the workflow, which still needs the secret.

**Success:** the Secrets tab lists only `CPANEL_HOST`, `CPANEL_USERNAME` and `CPANEL_PASSWORD`.

## 3. AutoSSL (check once; active since 2026-10-10)

**cPanel → Security → SSL/TLS Status.** `digitalstrike-solutions.com` and
`www.digitalstrike-solutions.com` show a green padlock ("AutoSSL Domain Validated"). AutoSSL renews
by itself. The deploy never touches `.well-known/`, which AutoSSL uses to validate the domain. If
a domain shows a red icon, click **Run AutoSSL** and wait (minutes to a few hours).

The site's `.htaccess` (`public/.htaccess`, uploaded with every release) keeps the holding page's
rules:
- HTTP → HTTPS with a 301;
- no directory listings;
- unknown paths show the root page, which sends visitors to `/es/` or `/en/`;
- cache times (pages 5 minutes, build files 1 year).

## 4. Dry run (Monday 2026-10-12, before the release)

It connects with the real secrets and shows what would change. **It uploads and deletes nothing:
the holding page stays live.**

1. **Actions → Release to cPanel → Run workflow.**
2. Branch: `main`. Tag or branch to deploy: leave empty. **Dry run: ticked** (the default).
   Click **Run workflow**.
3. Open the run → job **deploy** → step **Upload over FTPS**. Expect, in order:
   - **"Target directory before the deploy"** lists the holding page: `.htaccess`, `index.html`,
     `assets/`, and cPanel's own folders such as `.well-known/` and `cgi-bin/`;
   - **"Dry run: what would be uploaded"** lists the site's files (`es/index.html`,
     `en/index.html`, `_astro/…`, `.htaccess`, …);
   - **"holding-page files that would be deleted if present"** lists `assets/…` (the holding
     page's logos and fonts), `README.md` and `holding-page.zip`.
4. A green run means the secrets, the login, TLS and the folder are all right, and the release on
   Tuesday will deploy. A red run: see §7.

## 5. What a real deploy does

It runs automatically when a GitHub Release is published (RELEASE.md §3), or by hand with
**Dry run** unticked.

1. Builds the release's tag for `https://digitalstrike-solutions.com`:
   - base path `/`;
   - indexable (no `noindex`), no pending badges;
   - `PUBLIC_*` from the repository variables.

   It fails if the build is missing a page or `.htaccess`. It warns if `PUBLIC_LEAD_ENDPOINT_URL`
   is unset.
2. Uploads all of `dist/` into `CPANEL_TARGET_DIR` over **FTPS** (TLS required for login and
   data; the password is passed through the environment, never printed).
3. Deletes only:
   - files in `_astro/` (hashed build files) that the new build no longer has;
   - the holding page's leftovers: the files in this repository's `holding-page/` folder that
     the site does not replace (`assets/` with its logos and fonts, `README.md`,
     `holding-page.zip`). Its `index.html` and `.htaccess` are overwritten by the site's (US-017 AC5).
4. **Leaves everything else as it is.** That includes `.well-known/`, `cgi-bin/`, logs and any
   file you add yourself. Nothing outside `CPANEL_TARGET_DIR` is touched.
5. Checks the live site: `/`, `/es/` and `/en/` answer 200 over HTTPS, `/es/` contains
   "DigitalStrike Solutions", and `http://` answers a 301. Then it ends with the notice
   **"Deployed — … is live"**. Next: the smoke test (RELEASE.md §4).

The first release (`v0.1.0`) replaces the holding page. Until a deploy succeeds, the holding page
stays live.

## 6. Roll back

To put the previous release back:
1. **Actions → Release to cPanel → Run workflow.**
2. Branch: `main`. **Tag or branch to deploy: the previous tag**, e.g. `v0.1.0`. **Dry run:
   unticked.** Click **Run workflow**.
3. When it is green, run the smoke test (RELEASE.md §4) and note the rollback in the release's
   description.

Alternative: open the previous release's own run under **Actions → Release to cPanel** →
**Re-run all jobs**. For releases older than `v0.1.2` this needs the old secret
`CPANEL_TARGET_DIR` (§2.1); once it is removed, use steps 1–3 above.

Pages that exist only in the newer release stay on the server, unlinked. That is harmless; delete
them in cPanel **File Manager** if needed. To go back to the holding page itself, upload
`holding-page/holding-page.zip` by hand as in `holding-page/README.md`.

## 7. Troubleshooting

| What the run shows | What to do |
|---|---|
| Notice "Deploy skipped — Repository secrets not set: …" | Add the named secrets (§2) and run again |
| `open: ***: Name or service not known` | `CPANEL_HOST` is a name with no DNS record, usually `ftp.digitalstrike-solutions.com`. Set it to the server's full host name (§2) and run again |
| `Login failed: 530` | Wrong `CPANEL_USERNAME` (use the full `deploy@digitalstrike-solutions.com`) or wrong `CPANEL_PASSWORD`. Reset the password in cPanel → FTP Accounts → **Change Password**, then update the secret |
| `Certificate verification: … NOT trusted` or a host-name mismatch | `CPANEL_HOST` must be exactly the server's full host name from §2. If it still fails, set the repository **variable** `CPANEL_TLS_VERIFY` to `false` and run again. The connection stays encrypted but the server's identity is not checked. Ask GoDaddy support which host name matches the certificate, then delete the variable |
| `cd: Access failed` | The folder in the repository variable `CPANEL_TARGET_DIR` does not exist for that account. It should be `/`, or the variable unset (§2.1) |
| Every `/` in the log shows as `***` | The run used a workflow from before US-025 (a re-run of an older release's run), which reads the old secret. Use **Run workflow** from `main` instead (§6). If a run from `main` still shows it, remove the old secret (§2.1, step 3) |
| Notice "Deploy skipped — Repository secrets not set: CPANEL_TARGET_DIR" | A re-run of a release older than `v0.1.2` after the old secret was removed. Use **Run workflow** from `main` with that tag (§6, steps 1–3) |
| Timeouts / `Connection refused` | GoDaddy FTP briefly unavailable or blocking passive connections; run again. If it persists, ask GoDaddy support whether FTPS (port 21, passive mode) is allowed for the account |
| Step "Check the live site" fails | The upload worked but the site does not answer as expected; open it, check `.htaccess` in File Manager, and roll back (§6) if needed |

## 8. Visitor statistics (PROJECT_SPEC §8)

Visits come from the server's own logs, not from any script of ours:
- **cPanel → Metrics → Awstats** → choose `digitalstrike-solutions.com` (the **SSL** row, since
  the site is HTTPS) → **View**. It shows visitors, pages, countries and referrers per month, and
  updates about once a day.
- **cPanel → Metrics → Visitors**: the most recent individual hits (raw access log).

## 9. Security

- The FTP password lives only in the repository secret and in cPanel. The workflow never prints
  it.
- Change it every few months, and at once if it may have leaked:
  1. cPanel → FTP Accounts → **Change Password**;
  2. update `CPANEL_PASSWORD`;
  3. check **File Manager** for unknown files;
  4. redeploy the latest release (§6, with the latest tag).
- Never give this account a directory above `public_html`.
