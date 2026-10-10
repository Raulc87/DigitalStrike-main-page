# ADR-002 — Lead backend: Google Apps Script now, Python/Java later

- Status: **Accepted** — effective when PR #1 is merged
- Date: 2026-10-09
- Decision owner: Raul Casañas
- Related specs: LEAD_ENDPOINT_CONTRACT, PROJECT_SPEC FR-010–FR-018; US-010–US-012, US-014

## Decision Request
What runs the lead endpoint (validate, store in Google Sheets, send two emails)?

## Context
- The owner wants Python as the long-term backend language, possibly Java microservices on AWS later, but wants the simplest option for the first release.
- The pilot (`gaby-main-page`) used Flask on cPanel Passenger with a Google service account; that requires a confirmed cPanel Python runtime and storing a key on the server, and does not run on GitHub Pages.
- ADR-001 serves the first release from GitHub Pages.

## Decision Drivers
- Working form on 2026-10-14 on any static host.
- No secrets to manage; free.
- Keep the door open for the Python/Java roadmap.

## Options Considered

### Option A — Google Apps Script web app (chosen)
Pros: free; native Sheets/Gmail; no keys; works from any origin (simple CORS request); deploys in minutes.
Cons: always HTTP 200; no client IP (throttles by email/global only); quotas; code edited/deployed outside the normal server toolchain.
Risks: quota exhaustion (mitigated by throttles, ADR-004); Google changing web-app behaviour (low).

### Option B — Python (Flask/FastAPI) on GoDaddy cPanel "Setup Python App"
Pros: owner's preferred language; same host as the site; full HTTP semantics.
Cons: needs the hosting plan and a confirmed Python runtime; service-account key on shared hosting; no backend on Pages.
Risks: plan without Python support; SMTP limits on GoDaddy shared hosting.

### Option C — Third-party form service (Formspree, Basin…)
Pros: zero code. Cons: Sheets/email format and confirmation copy constrained; free tiers limited; another processor in the privacy notice.

## Decision
Option A for now. The contract is written so the backend can be replaced without changing the frontend beyond `PUBLIC_LEAD_ENDPOINT_URL`.

## Rationale
Fastest path to a reliable lead flow with zero infrastructure, consistent with ADR-001.

## Consequences
### Positive
- No server to operate; leads and emails work from day one.
### Negative / Trade-offs
- Apps Script code needs a manual (or `clasp`) deploy step; covered by the runbook.

## Future backend roadmap (follow-up record requested by the owner)

| Stage | Trigger (any of) | Target | Notes |
|---|---|---|---|
| 0 — now | — | Apps Script + Sheets + Gmail | This ADR |
| 1 — Python service | 2+ endpoints with shared logic; client portal or admin views; AI features server-side; a real database or CRM; email beyond Gmail quotas | **Python** (FastAPI preferred; Flask acceptable) — on cPanel "Setup Python App" if the plan supports it (pilot precedent), otherwise a small container on a cloud (e.g. AWS App Runner/ECS, Fly.io, Cloud Run) | Keep contract body compatible (`ok`, `error_code`, `field_errors`); add proper HTTP status codes; move storage behind an adapter (Sheets → PostgreSQL); service account or OAuth for Sheets during transition |
| 2 — Java / microservices | Several products or teams; high traffic; integrations that need queues/events; enterprise clients requiring it | **Java 21 + Spring Boot** services on **AWS** (ECS/Fargate or EKS), PostgreSQL (RDS), queues (SQS/Kafka), API gateway | Only when the business needs it — the owner's expertise makes this natural, but it is not justified for one form |

Migration rule: a new ADR supersedes this one; the contract version is bumped first (change management); frontend switches by changing `PUBLIC_LEAD_ENDPOINT_URL`; the old Apps Script stays deployed until the new endpoint passes the release smoke test.

## Architecture Impact
Browser → Apps Script `/exec` (simple CORS POST) → Sheets + Gmail. No server of ours.

## Implementation Impact
`apps-script/` folder in the repo (Agent 3); logic split into pure, unit-tested modules; manifest `appsscript.json` with time zone `America/Costa_Rica`, web app `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`.

## Validation
Unit tests in CI; manual smoke test after each Apps Script deployment (runbook).

## Review Trigger
Any trigger in the roadmap table; Apps Script quota or reliability incidents.
