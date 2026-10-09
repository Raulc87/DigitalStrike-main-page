# ADR-001 — Hosting and deployment

- Status: Proposed
- Date: 2026-10-09
- Decision owner: Raul Casañas
- Related specs: PROJECT_SPEC §9, TECH_STACK §2, §9; US-016, US-017

## Decision Request
Where does the site run for the first release on 2026-10-14, and how do releases reach production on GoDaddy?

## Context
- Production target is GoDaddy cPanel with `digitalstrike-solutions.com`. As of 2026-10-09 the domain is decided but not yet bought (legal-fase0 §1.3), and the hosting plan status is unconfirmed.
- The owner needs a public, working page by Wednesday 2026-10-14 for an entrepreneur meet-up.
- The repository is public, so GitHub Pages is free.
- The site is static (ADR-002 moves the backend to Apps Script), so any static host works.

## Decision Drivers
- A public URL by 2026-10-14 without depending on the domain or the hosting purchase.
- "Deploy on release" automation requested by the owner.
- Zero cost now; easy move to the final domain.

## Options Considered

### Option A — GitHub Pages now, GoDaddy cPanel on release (chosen)
Pros: public in minutes; preview of every merge to `main`; the GoDaddy workflow is ready the day the plan exists.
Cons: two build targets (base path `/DigitalStrike-main-page/` vs `/`).
Risks: base-path bugs — mitigated by building both in CI and testing links.

### Option B — GoDaddy only
Pros: one target. Cons: blocked on buying hosting + domain + DNS + SSL before Wednesday. Risk: miss the meet-up.

### Option C — Point the domain at GitHub Pages permanently (no GoDaddy hosting)
Pros: free hosting forever with HTTPS; the domain can still be bought at GoDaddy. Cons: no server-side runtime if a Python backend is later wanted on the same host (not needed while ADR-002 holds).
Note: a valid option to reconsider before paying for cPanel hosting renewal (~10–14 USD/month per costos-y-tarifas).

## Decision
Option A. `main` deploys to GitHub Pages (`https://raulc87.github.io/DigitalStrike-main-page/`). Publishing a GitHub Release deploys the same commit to GoDaddy cPanel over FTPS; the job is skipped with a notice until the cPanel secrets exist.

## Rationale
Meets the date with no purchases, gives the owner the release-driven deployment, and keeps production on GoDaddy as requested.

## Consequences
### Positive
- Every merge is visible publicly for review; production releases are deliberate.
### Negative / Trade-offs
- The first release URL is the GitHub Pages one; QR codes/cards printed for the meet-up should point to it or to a short link that can be changed later.

## Architecture Impact
Static `dist/` only. `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` drive canonical URLs, sitemap and links.

## Implementation Impact
Workflows `pages.yml` and `release-cpanel.yml` (Agent 3); `.htaccess` in `public/` for cPanel (ignored by Pages).

## Validation
Release smoke test (runbook) on Pages on 2026-10-13; the same on cPanel at the first GoDaddy release.

## Review Trigger
Domain and hosting bought; a server-side backend is needed (ADR-002); Pages limits become a problem.
