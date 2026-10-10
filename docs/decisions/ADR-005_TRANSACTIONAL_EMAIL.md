# ADR-005 — Transactional email (owner notification and visitor confirmation)

- Status: **Accepted** — effective when PR #1 is merged
- Date: 2026-10-09
- Decision owner: Raul Casañas
- Related specs: PROJECT_SPEC FR-012–FR-014, BR-009; CONTENT §14; US-011, US-012

## Decision Request
How are the two emails sent now, and how do we move to the corporate sender later?

## Context
The owner wants a "cover letter" email for each lead and a confirmation to the visitor. For now the sender is `rcasanas@gmail.com`; later `pitcher@digitalstrike-solutions.com`.

## Options Considered
- **A — `MailApp.sendEmail` from the Apps Script owner's account (chosen now).** Free, native; sender is the account running the script.
- B — Transactional provider (Resend, Postmark, SES). Better deliverability and custom domain, but needs an API key and DNS records; not possible before the domain exists.
- C — `GmailApp` with a `from` alias. Requires the alias to be verified in Gmail ("Send mail as").

## Decision
A now. Sender display name = `SENDER_NAME` ("DigitalStrike Solutions"); owner email has `Reply-To` = visitor; visitor email has `Reply-To` = `REPLY_TO_EMAIL`.

**Later (when the domain and Google Workspace or another mailbox exist):** either run the Apps Script under the `pitcher@digitalstrike-solutions.com` account (simplest), or verify it as a Gmail "Send mail as" alias and switch to `GmailApp` with `from`; set SPF, DKIM and DMARC on the domain. If volume or deliverability demands it, move to a transactional provider (new ADR, aligned with ADR-002 stage 1).

## Consequences
- Positive: works on day one; all addresses are configuration (Script Properties).
- Negative: confirmations come from a personal Gmail until the switch; consumer Gmail quota ~100 recipients/day.

## Validation
Smoke test: both emails received, Reply-To correct, ES and EN versions, HTML escaped.

## Review Trigger
Corporate mailbox created; deliverability problems; quota warnings.
