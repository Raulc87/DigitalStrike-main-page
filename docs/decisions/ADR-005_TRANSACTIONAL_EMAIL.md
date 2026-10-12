# ADR-005 — Transactional email (owner notification and visitor confirmation)

- Status: **Accepted** — effective when PR #1 is merged (revised 2026-10-10: corporate mailbox in place; revised 2026-10-11: sending moved from `MailApp` to `GmailApp`)
- Date: 2026-10-09 · revised 2026-10-10 · revised 2026-10-11
- Decision owner: Raul Casañas
- Related specs: PROJECT_SPEC FR-012–FR-014, BR-009; CONTENT §14; US-010, US-011, US-012

## Decision Request
How are the two emails sent: the owner's "cover letter" for each lead and the visitor confirmation?

## Context
- The owner wants a "cover letter" email for each lead and a confirmation to the visitor.
- **2026-10-10:** Google Workspace is configured on `digitalstrike-solutions.com`, and the corporate mailbox is **`manager@digitalstrike-solutions.com`**. DNS was checked the same day:
  - MX records point to Google;
  - SPF includes `_spf.google.com`;
  - DKIM (`google._domainkey`) is published;
  - DMARC is published with `p=quarantine`.
- This replaces the earlier plan: `rcasanas@gmail.com` for now, a future `pitcher@` address later.
- Apps Script `MailApp` and `GmailApp` both send as the account that runs the script. On a Workspace account the daily recipients quota (shared by both) is about 1,500, against about 100 on consumer Gmail.
- **2026-10-11, smoke test:** on this new Workspace account (started as a trial, upgraded to paid the same night), Gmail rejected every `MailApp.sendEmail` to an external address in about 0.1 s ("Message rejected", support.google.com/mail/answer/69585), even for a plain-text message without links. Internal mail was delivered, and so was mail typed in Gmail. `GmailApp.sendEmail` from the same project with the `gmail.send` scope was delivered to Gmail. DKIM (active in Admin), SPF and DMARC were checked and are not the cause. Google does not document this; community reports match it on new or trial Workspace accounts.

## Options Considered
- **A — Apps Script sending from a project owned by and deployed as `manager@digitalstrike-solutions.com` (chosen).** First with `MailApp.sendEmail` (scope `script.send_mail`); since 2026-10-11 with `GmailApp.sendEmail` (scope `gmail.send`, send only), because `MailApp` mail to external addresses was rejected (Context). Free and native. The sender is the corporate address, and the mail is signed by the domain's DKIM and aligned with SPF and DMARC.
- B — Transactional provider (Resend, Postmark, SES): needs an API key and extra DNS records; not justified at this volume.
- C — The Apps Script under a personal Gmail with a "Send mail as" alias and `GmailApp`: more moving parts, and the mail is not DKIM-aligned with the domain.

## Decision
Option A.
- The leads sheet and the Apps Script project are created **while signed in as `manager@digitalstrike-solutions.com`**. The web app is deployed with "Execute as: Me" and "Who has access: Anyone".
- Sender: `manager@digitalstrike-solutions.com`, display name `SENDER_NAME` ("DigitalStrike Solutions").
- Owner notification: to `OWNER_NOTIFICATION_EMAIL` = `manager@digitalstrike-solutions.com`, with `Reply-To` = the visitor's email.
- Visitor confirmation: `Reply-To` = `REPLY_TO_EMAIL` = `manager@digitalstrike-solutions.com`.
- Sending uses `GmailApp.sendEmail` with the OAuth scope `https://www.googleapis.com/auth/gmail.send` only (never `https://mail.google.com/`, which would also allow reading and deleting mail). `MailApp.getRemainingDailyQuota()` stays as the quota check (contract step 10), so the `script.send_mail` scope stays too. Changing scopes requires running the script once to re-authorize, then deploying a new version of the same deployment (the `/exec` URL is unchanged).
- All addresses stay configuration (Script Properties and `PUBLIC_CONTACT_EMAIL`), never hard-coded (BR-009).
- A role address such as `pitcher@` can be added later as a Workspace alias: a configuration change only, no new ADR.

## Consequences
- Positive:
  - From day one, emails come from the company domain.
  - Better deliverability: DKIM, SPF and DMARC are aligned.
  - The quota is far above the throttles of contract §5.3 (40 leads/day = 80 recipients).
- Negative:
  - The sheet and the script live in the Workspace account; access depends on that account and its admin settings.
  - The script holds a Gmail send permission on the company mailbox (`gmail.send`). It cannot read mail, but anyone who can edit the project could send mail as manager@: keep the project unshared.
  - If the Workspace admin restricts sharing outside the domain, deploying a web app with "Anyone" access can be blocked. The runbook (`APPS_SCRIPT_SETUP.md`) includes checking this setting.

## Validation
Release smoke test:
- both emails received, from `manager@digitalstrike-solutions.com`;
- `Reply-To` correct on both;
- ES and EN versions;
- HTML escaped;
- message headers show `dkim=pass` and `spf=pass`;
- the Workspace email log (Admin → Reporting → Email log search) shows the confirmation as delivered to the external inbox, not bounced.

## Review Trigger
`MailApp` external delivery works again on this account (option to return to the narrower `script.send_mail`-only setup); deliverability problems; quota warnings; the backend moves (ADR-002 stage 1); a need for a dedicated sending address.
