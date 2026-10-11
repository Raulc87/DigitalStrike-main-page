# ADR-004 — Spam protection for the lead form

- Status: **Accepted** — effective when PR #1 is merged
- Date: 2026-10-09
- Decision owner: Raul Casañas
- Related specs: LEAD_ENDPOINT_CONTRACT §5; US-014

## Decision Request
How do we keep bots from filling the sheet and burning the email quota, without hurting real visitors?

## Context
Apps Script cannot see the client IP, so the pilot's per-IP rate limit is not possible. Every stored lead triggers two emails (quota ~1,500 recipients/day on the Google Workspace sending account, ADR-005).

## Options Considered
- **A — Honeypot + minimum fill time + throttles per email and global (chosen).** Invisible to people, no third party, no cookies.
- B — Add Cloudflare Turnstile / reCAPTCHA now. Stronger, but adds a third-party script, a privacy-notice processor and a server-side verification call; overkill before any abuse is seen.

## Decision
Option A, as specified in the contract §5: honeypot sent as `website`, read from an input isolated from browser autofill in its own form outside the lead form (UX §3 "Autofill and honeypot"; owner decision 2026-10-11 after the Gaby pilot lost a real lead to autofill on 2026-09-30); client-measured `elapsed_ms` with a 3-second minimum (decoy success); at most 3 leads per email per hour, 20 per hour and 40 per day overall (counted from the stored rows under the script lock, so cache eviction cannot bypass them), configurable via Script Properties; emails sent only while MailApp quota remains; `submission_id` idempotency so retries never duplicate leads or emails.

## Consequences
- Positive: zero friction for visitors; protects the quota.
- Autofill stays fully supported on the visible fields; only the honeypot is hidden from it.
- Negative: a determined bot can still post slowly; the global cap could block real leads during an attack (owner notices from the sheet).

## Validation
Unit tests for each path; manual check that a decoy stores nothing.

## Review Trigger
More than 5 spam rows in a week, or the global cap being hit → add Turnstile (new ADR).
