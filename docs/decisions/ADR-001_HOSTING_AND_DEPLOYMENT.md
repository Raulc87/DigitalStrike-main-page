# ADR-001 — Hosting and deployment

- Status: **Accepted** — effective when PR #1 is merged (revised 2026-10-10 after the hosting purchase; revised 2026-10-11: GoDaddy's injected script kept and disclosed)
- Date: 2026-10-09 · revised 2026-10-10 · revised 2026-10-11
- Decision owner: Raul Casañas
- Related specs: PROJECT_SPEC §3, §9; TECH_STACK §2, §9; US-016, US-017

## Decision Request
Where does the site run for the first release on 2026-10-14, and how do releases reach production on GoDaddy?

## Context
- **Bought on 2026-10-10:** the domain `digitalstrike-solutions.com` and the GoDaddy **Deluxe** cPanel (Linux) hosting plan, with the domain attached as the primary domain.
- **Verified on 2026-10-10:**
  - AutoSSL certificate active; HTTP → HTTPS forced in `.htaccess` (301 checked for `www.` and the bare domain).
  - The holding page (`holding-page/`) is live at `https://digitalstrike-solutions.com`.
  - GoDaddy support confirmed the plan offers cPanel "Setup Python App", so the Python roadmap of ADR-002 can run on this host.
- GoDaddy's server injects its own monitoring script (`img1.wsimg.com/.../tccl.min.js`, beacons to `csp.secureserver.net`) into every HTML page. On 2026-10-11 it set three GoDaddy cookies on the domain: `_tccl_visitor` (visitor ID, 1 year), `_tccl_visit` and `_scc_session`. Its comment says to contact hosting support to opt out. This conflicted with the original NFR-005 (no third-party requests or analytics from the site) and with the privacy notice as first approved; the owner resolved it on 2026-10-11 by keeping the script and disclosing it (Decision below), and NFR-005 and the notice were updated to match.
- The owner needs the public site by Wednesday 2026-10-14 (entrepreneur meet-up), and asked for releases to deploy automatically.
- The repository is public, so GitHub Pages is free.
- The site is static (ADR-002 keeps the backend on Apps Script), so it deploys as plain files.

## Decision Drivers
- Production on the company's own domain from the first release (cards and QR codes point to `digitalstrike-solutions.com`).
- "Deploy on release" automation (CI/CD) requested by the owner.
- A preview of every merge for review, without touching production.
- Room for the future Python backend on the same host (ADR-002).

## Options Considered

### Option A — GitHub Pages for the first release, GoDaddy later (original choice, 2026-10-09)
Pros: no dependency on buying hosting. Cons: the meet-up URL would be `raulc87.github.io/...`. **Superseded:** the hosting and the domain now exist.

### Option B — GoDaddy cPanel for production from the first release; GitHub Pages as preview only (chosen, 2026-10-10)
Pros: the company domain from day one; production changes only through a published release; every merge still visible on Pages.
Cons: two build targets (base path `/DigitalStrike-main-page/` on Pages, `/` on cPanel); FTP credentials stored as repository secrets.
Risks:
- Base-path bugs: mitigated by building both in CI and testing links.
- FTP secrets not set before the release cut: owner checklist item with a Monday deadline.

### Option C — Point the domain at GitHub Pages (no GoDaddy hosting)
Pros: free hosting with HTTPS. Cons: no server-side runtime for the Python roadmap; the cPanel plan is already paid. Not chosen.

## Decision
Option B.
- **Production:** publishing a GitHub Release (CI green on that commit) runs `release-cpanel.yml`. It builds with `PUBLIC_BASE_PATH=/` and `PUBLIC_SITE_URL=https://digitalstrike-solutions.com`, then uploads `dist/` to `public_html` over FTPS with a dedicated FTP account restricted to that folder. The first release replaces the holding page.
- **Preview:** every push to `main` runs `pages.yml` and deploys to `https://raulc87.github.io/DigitalStrike-main-page/`. It is never linked publicly and has `noindex`, so it cannot compete with production in search.
- **Rollback:** re-run the release workflow on the previous release tag.
- **GoDaddy's injected monitoring script (owner decision 2026-10-11): kept and disclosed.** The owner keeps it and discloses it, including its cookies, in the privacy notice (CONTENT §13, PROJECT_SPEC §7) instead of asking GoDaddy to remove it. Trade-off accepted: a 1-year visitor-ID cookie without a consent banner fits Ley 8968 with disclosure, but EU visitors (GDPR) would require consent; revisit if the site targets the EU. Visitor statistics for the owner come from cPanel **Metrics → Awstats / Visitors** (server logs), not from that script.

## Rationale
It meets the meet-up on the real domain, gives the owner release-driven deployment, keeps a safe preview of every merge, and leaves the Python runtime available for ADR-002 stage 1.

## Consequences
### Positive
- Cards and QR codes for the meet-up can point to `https://digitalstrike-solutions.com` permanently.
- Production changes only through deliberate releases; every merge is reviewable on Pages first.
### Negative / Trade-offs
- The FTP account is a credential to protect: repository secrets only, an account limited to `public_html`, and rotation if leaked.
- US-017 becomes Must for Sprint 001 (it was stretch).

## Architecture Impact
Static `dist/` only. `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` drive canonical URLs, sitemap and links. `public/.htaccess` (cPanel only) forces HTTPS, disables directory listing and sets cache headers; Pages ignores it.

## Implementation Impact
- Workflows `pages.yml` and `release-cpanel.yml` (Agent 3).
- Repository secrets `CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_PASSWORD`, `CPANEL_TARGET_DIR` (US-017 AC1; owner, by Mon 2026-10-12).
- Runbook `docs/runbooks/DEPLOYMENT.md` (US-017 AC4).
- Preview builds add `noindex`.

## Validation
Release smoke test (`RELEASE.md`) on `https://digitalstrike-solutions.com` after `v0.1.0` is published:
- both languages and HTTPS;
- form → sheet row + two emails;
- Calendly;
- the privacy notice in both languages mentions GoDaddy's access logs, monitoring script and cookies;
- in a fresh browser profile, the live cookies and third-party domains match the baseline in US-016 AC3 (`_tccl_visitor` up to 1 year, `_tccl_visit`, `_scc_session`; `img1.wsimg.com`, `csp.secureserver.net`);
- the production Lighthouse scores are recorded (NFR-003).

## Review Trigger
A server-side backend moves to the cPanel Python app (ADR-002 stage 1); the site starts targeting EU visitors; the injected script adds a cookie, a longer lifetime or a new third-party domain, or collects more than technical visit data; or it pulls production Lighthouse below NFR-003 (then revisit the disclosure or ask GoDaddy to remove it); hosting renewal (compare the renewal price with Option C).
