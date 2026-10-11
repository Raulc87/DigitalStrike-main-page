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
   without the extension (`lib/config`, `lib/constants`, `lib/emails`, `lib/handler`,
   `lib/lead`, `lib/sheet`, `lib/throttle`, `lib/validation`)
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

1. In the **Editor**, select `Code.gs`, choose **`setupSheet`** in the function list, click **Run**.
2. The first run asks for permissions: **Review permissions** → choose
   `manager@digitalstrike-solutions.com` → allow "See, edit, create and delete your
   spreadsheets" and "Send email as you". (If Google shows "app isn't verified", it is your
   own script: **Advanced → Go to DigitalStrike Lead Endpoint**.)
3. The execution log shows `setup_sheet_done`. In the sheet, the `leads` tab now has the
   19-column header (A `submitted_at` … S `last_contact_at`), row 1 frozen, and a dropdown in
   column B (`new`, `contacting`, `accepted`, `rejected`).

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

The request uses `Content-Type: text/plain` like the site (contract §2). `-L` follows Google's
302 redirect to the JSON response.

```bash
URL='https://script.google.com/macros/s/<deployment_id>/exec'

# Health check → {"ok":true,"service":"ds-lead-endpoint"}
curl -sSL "$URL"; echo

# A test lead (use an inbox you can read; a fresh submission_id each time)
SID=$(uuidgen | tr 'A-Z' 'a-z')   # Windows PowerShell: [guid]::NewGuid().ToString()
curl -sSL -H 'Content-Type: text/plain;charset=utf-8' --data "{
  \"name\": \"Prueba Humo\", \"email\": \"<your-test-inbox>\", \"phone\": \"\",
  \"company\": \"\", \"project_type\": \"website\", \"budget_range\": \"not_sure\",
  \"timeline\": \"flexible\", \"message\": \"Prueba de humo del endpoint de prospectos.\",
  \"language\": \"es\", \"consent\": true, \"privacy_notice_version\": \"2026-10-14-v1\",
  \"submission_id\": \"$SID\", \"website\": \"\", \"elapsed_ms\": 15000 }" "$URL"; echo
```

Expected:
1. The response is `{"ok":true,"lead_id":"DS-yyyyMMdd-XXXXXX"}`.
2. A new row with `status` `new`, that `lead_id`, and `owner_email_status` and
   `confirmation_email_status` both `sent`.
3. The owner notification in `manager@` and the confirmation in the test inbox (ADR-005
   checks: sender, `Reply-To`, and in "Show original" `dkim=pass` and `spf=pass`).
4. Sending **the same command again with the same `$SID`** returns the same `lead_id` and adds
   no row and no email (idempotency).
5. Changing `"website": ""` to `"website": "x"` (with a new `SID`) returns `ok: true` but adds
   no row (honeypot decoy).
6. Changing `"email"` to `"bad"` returns `validation_failed` with `field_errors.email`.

Then set the test row's `status` to `rejected` (US-016 AC3), or delete the row.

If the response is an HTML page instead of JSON: the deployment is not "Anyone" or the URL
is not the `/exec` one. `storage_unavailable`: check `SHEET_ID` and that the tab is named
`leads`. Errors appear in **Executions** (left menu); they contain only `lead_id` and codes.

## 8. Redeploy after a code change (the URL stays the same)

1. Update the project code (Option A: paste the changed files; Option B: `clasp push --force`).
2. **Deploy → Manage deployments** → select the existing web-app deployment → **Edit** (pencil)
   → **Version: New version** → description (e.g. `v2 — <change>`) → **Deploy**.
3. Run the smoke test of step 7 again.

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

**Known limit to decide on (owner):** Google Sheets keeps a **version history**
(File → Version history) that still shows deleted rows, and individual versions cannot be
deleted. If a full deletion must also cover the history, the option is to copy the remaining
rows to a new sheet and update `SHEET_ID`. This runbook does not do that by default.
