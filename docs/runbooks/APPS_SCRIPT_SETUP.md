# APPS_SCRIPT_SETUP — lead endpoint (owner runbook)

For: Raul Casañas (owner). Covers US-010 AC6–AC7, ADR-002, ADR-005 and contract §8.
Source code: `apps-script/` in this repository (the source of truth).

**Starting point (done on 2026-10-11):** the Workspace account `manager@digitalstrike-solutions.com`
exists; an empty Google Sheet **"DigitalStrike Leads"** with a tab **`leads`** was created under
that account; the Workspace setting for sharing outside the domain was checked.

> Do every step **signed in only as `manager@digitalstrike-solutions.com`** (use a separate
> browser profile or an incognito window). The script sends mail as the account that owns and
> deploys it (ADR-005); if it is created under another account, the emails come from that account.

---

## 1. Confirm the Workspace setting for "Anyone" web apps (US-010 AC7)

A web app with "Who has access: Anyone" is only possible when the domain allows sharing outside
the organization.

1. Open <https://admin.google.com> → **Apps → Google Workspace → Drive and Docs → Sharing settings**.
2. Under **Sharing options**, "Sharing outside of DigitalStrike Solutions" must be **ON**
   (it was checked on 2026-10-11; just confirm it has not changed).
3. You will confirm it again in step 6: the deployment dialog must offer **"Anyone"**
   (not only "Anyone within DigitalStrike Solutions").

## 2. Copy the sheet ID

Open "DigitalStrike Leads". The ID is the part of the URL between `/d/` and `/edit`:
`https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`. Keep it for step 4.

Do not rename the `leads` tab. Do not add columns or write anything in the sheet yet.

## 3. Create the Apps Script project

Choose **one** of the two ways.

### Option A — copy by hand (no tools needed)

1. Open <https://script.google.com> → **New project**. Rename it "DigitalStrike Lead Endpoint".
2. **Project Settings** (gear icon) → tick **"Show 'appsscript.json' manifest file in editor"**.
3. Back in **Editor**, open `appsscript.json` and replace its whole content with
   `apps-script/appsscript.json` from the repository.
4. Open `Code.gs` and replace its whole content with `apps-script/Code.js`.
5. For each file in `apps-script/lib/` add a script file (**+ → Script**) named with its path
   without the extension (`lib/config`, `lib/constants`, `lib/emails`, `lib/gmail`,
   `lib/handler`, `lib/lead`, `lib/sheet`, `lib/throttle`, `lib/validation`)
   and paste the file's content.
6. **Save** (Ctrl/Cmd + S).

### Option B — clasp (command line)

1. Turn on the Apps Script API: <https://script.google.com/home/usersettings>.
2. Install and log in (a browser opens; choose `manager@digitalstrike-solutions.com`):
   ```bash
   npm install -g @google/clasp
   clasp login
   ```
3. Create an empty project at <https://script.google.com> (**New project**, name
   "DigitalStrike Lead Endpoint"), then copy its **Script ID** from **Project Settings**.
4. In the repository, create `apps-script/.clasp.json` (git-ignored, never commit it):
   ```json
   { "scriptId": "<SCRIPT_ID>", "rootDir": "." }
   ```
5. Push (the `.claspignore` sends only `appsscript.json`, `Code.js` and `lib/*.js`):
   ```bash
   cd apps-script
   clasp push --force
   ```

## 4. Set the Script Properties (contract §8)

**Project Settings → Script Properties → Add script property**, one per row. Values are never
committed to the repository.

| Property | Value |
|---|---|
| `SHEET_ID` | the ID from step 2 |
| `OWNER_NOTIFICATION_EMAIL` | `manager@digitalstrike-solutions.com` |
| `REPLY_TO_EMAIL` | `manager@digitalstrike-solutions.com` |
| `SENDER_NAME` | `DigitalStrike Solutions` |
| `CALENDLY_URL` | `https://calendly.com/rcasanas/1hr` |
| `SITE_URL` | `https://digitalstrike-solutions.com` |
| `ACCEPTED_PRIVACY_NOTICE_VERSIONS` | `2026-10-14-v1` |
| `SEND_EMAILS` | `true` (`false` records the emails as `skipped`, for testing) |
| `MAX_LEADS_PER_EMAIL_PER_HOUR` | `3` |
| `MAX_LEADS_PER_HOUR` | `20` |
| `MAX_LEADS_PER_DAY` | `40` |

Notes:
- If `ACCEPTED_PRIVACY_NOTICE_VERSIONS` is missing, **every** lead is rejected with
  `invalid_option` on `privacy_notice_version`.
- A new privacy-notice version is **added** to this list (comma-separated, e.g.
  `2026-10-14-v1,2027-01-15-v2`) **before** deploying a frontend that shows it (US-018 AC2).
  Remove the old version only after the new frontend is live.
- Changing a Script Property takes effect immediately; no redeploy is needed.

## 5. Prepare the sheet: run `setupSheet()`

1. In the **Editor**, open `Code.gs`. In the toolbar's **function dropdown** (next to **Run** and
   **Debug**), select **`setupSheet`** before clicking **Run**. The editor runs the function
   selected in that dropdown, not the one under the cursor. If it still shows `doGet`, clicking
   Run only runs the health check, and the sheet does not change.
2. Click **Run**. The first run asks for permissions: **Review permissions** → choose
   `manager@digitalstrike-solutions.com` → allow "See, edit, create and delete your
   spreadsheets", "Send email as you" and "Send email on your behalf" (the Gmail permission
   that `GmailApp` uses to send). (If Google shows "app isn't verified", it is your
   own script: **Advanced → Go to DigitalStrike Lead Endpoint**.) After you allow access, check
   that the dropdown still shows `setupSheet` and click **Run** again if the run was interrupted.
3. **Success looks like this:**
   - the **Execution log** at the bottom shows a line containing `setup_sheet_done`, then
     "Execution completed";
   - in the sheet, the `leads` tab has the 19-column header in row 1, from A `submitted_at` to
     S `last_contact_at`, in bold and frozen;
   - column B has a dropdown with `new`, `contacting`, `accepted`, `rejected`.

   If the log shows a different function name, or no `setup_sheet_done`, go back to item 1.
   "Set the SHEET_ID Script Property first" means step 4 is missing `SHEET_ID`. "Row 1 … has a
   different header" means row 1 already had other text; clear it and run again.

`setupSheet()` is safe to run again: it never deletes rows, and it refuses to overwrite a
different header. Run it again if the sheet ever grows beyond its current rows, so new rows
keep the dropdown and the plain-text format.

## 6. Deploy as a web app

1. **Deploy → New deployment** → gear icon → **Web app**.
2. Description: `v1`. **Execute as: Me (manager@digitalstrike-solutions.com)**.
   **Who has access: Anyone**. If "Anyone" is missing, go back to step 1.
3. **Deploy**, authorize if asked, then copy the **Web app URL**. It ends in `/exec`:
   `https://script.google.com/macros/s/<deployment_id>/exec`.
4. Put it in GitHub: **Settings → Secrets and variables → Actions → Variables → New repository
   variable** `PUBLIC_LEAD_ENDPOINT_URL` = that URL. It is public by design (contract §2), so it
   is a *variable*, not a secret.

## 7. Smoke test with curl

These commands are for the **macOS or Linux Terminal** (zsh or bash). Each grey block is one
copy-paste: paste it, press Enter, and read the result before the next one. The blocks contain
no `#` comments, because zsh, the default macOS shell, rejects pasted comment lines with
"command not found: #". On **Windows**, use Git Bash (installed with Git for Windows), or use
the no-terminal check at the end of this step.

The requests use `Content-Type: text/plain`, like the site (contract §2). `-L` follows Google's
redirect to the JSON answer.

**7.1 Set the two values.** Replace both placeholders before pressing Enter: `<deployment_id>`
with the part of your `/exec` URL from step 6 (or paste the whole URL between the quotes), and
`<your-test-inbox>` with an email address you can read. Keep the single quotes.

```bash
URL='https://script.google.com/macros/s/<deployment_id>/exec'
EMAIL='<your-test-inbox>'
```

**7.2 Health check.** Expected answer: `{"ok":true,"service":"ds-lead-endpoint"}`.

```bash
curl -sSL "$URL"; echo
```

**7.3 New test id.** Each test lead needs a new `submission_id`. This prints it.

```bash
SID=$( (uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid) | tr 'A-Z' 'a-z'); echo "$SID"
```

**7.4 Send a test lead.**

```bash
curl -sSL -H 'Content-Type: text/plain;charset=utf-8' --data '{"name":"Prueba Humo","email":"'"$EMAIL"'","phone":"","company":"","project_type":"website","budget_range":"not_sure","timeline":"flexible","message":"Prueba de humo del endpoint de prospectos.","language":"es","consent":true,"privacy_notice_version":"2026-10-14-v1","submission_id":"'"$SID"'","website":"","elapsed_ms":15000}' "$URL"; echo
```

Expected:
1. The answer is `{"ok":true,"lead_id":"DS-yyyyMMdd-XXXXXX"}`.
2. A new row in the sheet, with `status` `new`, that `lead_id`, and both `owner_email_status`
   and `confirmation_email_status` set to `sent`.
3. The owner notification in `manager@` and the confirmation in the test inbox. Check the
   sender, `Reply-To`, and in **Show original** `dkim=pass` and `spf=pass` (ADR-005).

**7.5 Idempotency.** Paste block 7.4 again **without** running 7.3. Expected: the same
`lead_id`, no new row and no new email.

**7.6 Honeypot decoy.** Run 7.3 first (new id), then the block below. Expected: `"ok":true`,
but no new row and no email.

```bash
curl -sSL -H 'Content-Type: text/plain;charset=utf-8' --data '{"name":"Prueba Humo","email":"'"$EMAIL"'","phone":"","company":"","project_type":"website","budget_range":"not_sure","timeline":"flexible","message":"Prueba de humo del endpoint de prospectos.","language":"es","consent":true,"privacy_notice_version":"2026-10-14-v1","submission_id":"'"$SID"'","website":"x","elapsed_ms":15000}' "$URL"; echo
```

**7.7 Validation.** Expected: `"error_code":"validation_failed"` with
`"field_errors":{"email":"invalid_format"}`.

```bash
curl -sSL -H 'Content-Type: text/plain;charset=utf-8' --data '{"name":"Prueba Humo","email":"bad","phone":"","company":"","project_type":"website","budget_range":"not_sure","timeline":"flexible","message":"Prueba de humo del endpoint de prospectos.","language":"es","consent":true,"privacy_notice_version":"2026-10-14-v1","submission_id":"'"$SID"'","website":"","elapsed_ms":15000}' "$URL"; echo
```

Then set the test row's `status` to `rejected` (US-016 AC3), or delete the row.

If something looks wrong:
- **An HTML page instead of JSON:** the deployment is not "Anyone", or the URL is not the
  `/exec` one.
- **`storage_unavailable`:** check `SHEET_ID`, and that the tab is named `leads`.
- **The row shows `failed` for an email:** open **Executions** for the error. If the
  confirmation was rejected by Gmail ("Message rejected"), make sure the deployed version
  includes the Gmail sending change (`lib/gmail`, the `gmail.send` scope) and that you
  authorized it (step 8, item 2).
- **`zsh: no matches found` or `parse error`:** a placeholder from 7.1 still has its `<` `>`, or
  a quote is missing; paste 7.1 again.
- **Error details:** they appear in **Executions** (left menu) and contain only `lead_id` and
  codes.

**No-terminal alternative.** You can skip curl and test from the site instead:
1. Set the repository variable `PUBLIC_LEAD_ENDPOINT_URL` to the `/exec` URL (RELEASE.md §1.2).
2. Run **Actions → Pages → Run workflow**.
3. Submit the form on the preview <https://raulc87.github.io/DigitalStrike-main-page/es/>, and
   check items 1–3 of 7.4 in the sheet and in both inboxes.

## 8. Redeploy after a code change (the URL stays the same)

1. Update the project code (Option A: paste the changed files; Option B: `clasp push --force`).
   Paste `appsscript.json` too when it changed (Project Settings must show the manifest, step 3).
2. **If the update adds a permission** (for example the Gmail sending change, which adds the
   `gmail.send` scope), authorize it before deploying. In the function dropdown select
   `setupSheet`, then click **Run** and allow the new permission ("Send email on your behalf").
   Re-running `setupSheet` is harmless. Without this step, the deployed web app cannot send
   email, and both email statuses become `failed`.
3. **Deploy → Manage deployments** → select the existing web-app deployment → **Edit** (pencil)
   → **Version: New version** → description (e.g. `v2 — <change>`) → **Deploy**.
4. Run the smoke test of step 7 again. After the Gmail sending change, also check that the
   visitor confirmation reaches an **external** inbox (for example a personal Gmail), not
   only `manager@`.

Never use **New deployment** for an update: it creates a different URL, and the site keeps
calling the old one until `PUBLIC_LEAD_ENDPOINT_URL` is changed and the site rebuilt.

---

## 9. Working with the sheet (rules that keep the endpoint correct)

- Only **edit** `status` (B), `notes` (Q) and `last_contact_at` (S). The script writes the other
  columns (and only columns O and P after creation).
- **Do not sort the sheet in place** and do not insert rows between leads: the throttles read
  the **last** rows as the most recent ones. To view leads in another order, use
  **Data → Create a filter view**.
- Deleting whole rows (retention, deletion requests) is fine.
- Emails with status `failed` or `quota_exceeded`: answer that lead by hand from the row.
- Test leads: set `status` to `rejected` (or delete them) so they are not counted as leads.

## 10. Personal-data procedures (US-010 AC6, PROJECT_SPEC §7, privacy notice)

These match what the privacy notice promises: retention up to 24 months from the last contact,
and answers to access, correction and deletion requests within **5 business days**.

### 10.1 Record each contact — `last_contact_at`
Every time you contact a lead after the first submission (email, call, meeting), write the date
in column **S** as `yyyy-MM-dd` (e.g. `2026-11-03`). Retention counts from this date; while it is
empty, it counts from `submitted_at` (column A).

### 10.2 Monthly retention review (first business day of each month)
1. Open the `leads` tab. For each row, take `last_contact_at` (S), or `submitted_at` (A) when S
   is empty.
2. Delete every row whose date is **more than 24 months ago** (right-click the row number →
   **Delete row**).
3. For each deleted lead, also delete its emails as in 10.4 steps 2–4.

### 10.3 Access and correction requests
1. Find the person's rows: **Ctrl/Cmd + F** for their email address.
2. Access: reply with the data held (the row's fields and that the emails exist).
3. Correction: edit the cell(s) by hand and reply confirming. Note the date in `notes` (Q).
4. Reply within 5 business days of the request.

### 10.4 Deletion requests (and withdrawn consent)
Deletion covers every copy you hold:
1. **Sheet:** find every row with that email (Ctrl/Cmd + F) and delete the whole row. Note the
   `lead_id` of each first.
2. **Owner notification** (your inbox): in Gmail, search `subject:<lead_id>` (e.g.
   `subject:DS-20261014-K7Q2XM`) and delete the message.
3. **Visitor confirmation** (your Sent folder): search `in:sent to:<their email>` and delete it.
   Also delete your later conversation with them if the request covers it.
4. **Trash:** open **Trash** and **Delete forever** those messages (otherwise Gmail keeps them
   for 30 days).
5. Reply confirming the deletion, within 5 business days of the request.

The Apps Script execution logs contain only `lead_id` and codes, never personal data, so they
need no action.

**Sheets version history (owner decision 2026-10-11: accepted, no extra step).** Google
Sheets keeps an automatic version history (File → Version history) that can still show a
deleted row in older versions; individual versions cannot be deleted. Only people with edit
access to the sheet (you) can see it. Deleting the row as above is the deletion procedure; the
sheet is not copied to a new file.
