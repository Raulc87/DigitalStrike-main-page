# PROJECT_SPEC — DigitalStrike Solutions main page

## Metadata
- Version: 0.2 (2026-10-10: owner answers, review fixes)
- Status: **Approved** by Raul Casañas — effective when PR #1 is merged
- Owner / final reviewer: Raul Casañas (CEO, DigitalStrike Solutions)
- Last updated: 2026-10-09
- Sources: discovery conversation (2026-10-09); Drive folder `Documentacion/07-DigitalStrike`:
  `identidad-digitalstrike.md` (approved 2026-09-18), `identidad-visual-digitalstrike.md` (v1, superseded on 2026-10-10 by proposal A v3, Palette 1 and the ball logo),
  `costos-y-tarifas.md` (v3), `legal-fase0-digitalstrike.md`, `Fundamentos-Marca-DigitalStrike.docx`;
  Raul's CV `Full_Stack___US_LATAM.pdf` (2026)

## 1. Purpose

A bilingual (Spanish / English) one-page website for **DigitalStrike Solutions**, a software company that
builds solutions adapted to each client, from a one-page site for an entrepreneur to a complex system for a company.

The page must:
1. Sell **solutions adapted to the customer's needs** (main priority).
2. Show the **service tiers** (no prices) and the **showroom** of real work.
3. Present **Raul Casañas, CEO**, as the face behind DigitalStrike, to build trust.
4. Turn visitors into **qualified leads**: a short screening form stored in Google Sheets, with an email to the owner and a confirmation to the visitor, and an embedded **Calendly** to book a "session 0".

## 2. Business context

| Topic | Decision | Source |
|---|---|---|
| Company | DigitalStrike Solutions. Starts as a brand; Raul Casañas invoices as a natural person in Costa Rica until the incorporation trigger | legal-fase0 §1.4 |
| Mission | "Apoyamos a personas emprendedoras y a empresas de cualquier tamaño a resolver sus necesidades de software —desde una página web hasta un sistema hecho a la medida—, trabajando cerca del cliente y adaptándonos a lo que cambie durante el desarrollo." | identidad (approved) |
| Slogan | «Sacamos de circulación tus necesidades de software» / «We strike out your software needs» | identidad; owner 2026-10-09 |
| Tone | Sober and approachable. The baseball nod lives only in the name, the logo, the slogan and punctual touches (e.g. the confirmation email). Never childish | identidad (approved rule) |
| Markets | Costa Rica first; the rest of the Americas and worldwide later | owner |
| Audience | Entrepreneurs and individuals (B2C, primary for the first 90 days) and companies of any size and sector (B2B) | identidad; owner |
| Differentiator | The client works close to the team and can steer the software as needs change; the team adapts | Fundamentos 4.2 |
| Quarter goal (business) | USD 3,000 invoiced and collected before 2026-12-14 | costos-y-tarifas §2.2 |

## 3. Scope

### In scope (first release, Sprint 001)
- One page per language: `/es/` and `/en/`; `/` redirects by preference or browser language.
- Sections (order and copy in `docs/ux/UX_UI_DIRECTION.md` and `docs/ux/CONTENT.md`):
  header, hero, services (tier cards), how we work (incl. warranty), showroom, about the CEO, clients (logo placeholders),
  lead form, scheduling (Calendly inline), footer, privacy notice.
- Lead capture to Google Sheets through a Google Apps Script web app (ADR-002), contract `docs/specs/LEAD_ENDPOINT_CONTRACT.md`.
- Owner notification email ("cover letter") and visitor confirmation email (ADR-005).
- Spam protection (ADR-004).
- CI/CD on GitHub Actions: every merge to `main` deploys a preview to GitHub Pages; publishing a GitHub Release deploys production to GoDaddy cPanel at `https://digitalstrike-solutions.com` (ADR-001, US-016, US-017).

### Out of scope (now)
- Prices on the page; refunds/devolution policy (pending legal review).
- Client-side analytics added by our code (e.g. Google Analytics), tracking pixels, cookie banner. Visit statistics from the server logs (cPanel Awstats, §8) are in scope. (The site's own code sets no cookies; GoDaddy's injected script sets its own, disclosed in the privacy notice, ADR-001). A consent banner is reconsidered if the site targets EU visitors (GDPR) or GoDaddy's script changes.
- WhatsApp button, Instagram link (accounts do not exist yet), company LinkedIn page.
- Real client logos (none available yet), testimonials.
- Blog, accounts/login, payments, CMS.
- Python/Java backend (future path recorded in ADR-002).
- A reply bot/assistant for leads (owner idea for the future; would follow ADR-002's roadmap).

## 4. Functional requirements

| ID | Requirement |
|---|---|
| FR-001 | The site is served in Spanish at `/es/` and English at `/en/`, with identical structure. |
| FR-002 | Visiting `/` sends the visitor to the saved language preference if any; otherwise to `/es/` when the browser's preferred language is Spanish (`es`, any region), otherwise to `/en/` (ADR-003). |
| FR-003 | A visible `ES | EN` toggle switches language on every viewport and saves the preference in the browser (`localStorage`, key `ds_lang`). |
| FR-004 | The hero states what DigitalStrike does and offers two actions: "tell us your idea" (to the lead form) and "book session 0" (to the scheduling section). |
| FR-005 | The services section shows the tiers A–D plus "customisations" as cards, without prices, each with who it is for and what it typically includes. |
| FR-006 | The "how we work" section shows the process and states the 6-month bug-fix warranty as a feature of every project. Refunds are not mentioned. |
| FR-007 | The showroom shows the projects listed in CONTENT.md with title, short description, stack tags and, when public, a link to the repository. |
| FR-008 | The about section presents Raul Casañas as CEO, with photo (provisional until the real one arrives), career brief based on his CV, and a link to his LinkedIn profile. |
| FR-009 | The clients section shows placeholder slots for logos; no real client name or logo is shown until the owner provides files and permission. It can be hidden with one configuration flag. |
| FR-010 | The lead form collects the fields in the contract (name, email, optional phone, optional company, project type, budget range, timeline, message, consent) with client-side validation and localized errors. |
| FR-011 | A lead is stored as one row in the Google Sheet with `submitted_at` (America/Costa_Rica), `status = new` and every submitted field. Allowed statuses: `new`, `contacting`, `accepted`, `rejected`. |
| FR-012 | After a lead is stored, the owner receives a "cover letter" email with all the lead's data, with `Reply-To` set to the visitor. |
| FR-013 | After a lead is stored, the visitor receives a confirmation email in the language they used, with the baseball-flavoured tone defined in CONTENT.md and the Calendly link. |
| FR-014 | Email failures never lose a lead: the row is stored first; email outcome is recorded in the row. |
| FR-015 | After a successful submission the form is replaced by a thank-you message and an invitation to book session 0 (the scheduling section, pre-filled with name and email). |
| FR-016 | The scheduling section embeds the Calendly inline widget (`https://calendly.com/rcasanas/1hr`) **on demand**: nothing is requested from Calendly until the visitor clicks "Ver horarios disponibles" or submits the form successfully. If it fails to load within 10 s, a link to open Calendly in a new tab is shown. |
| FR-017 | The privacy notice is reachable from the form and the footer in both languages; consent is required to submit. |
| FR-018 | Spam protection: honeypot field, minimum fill time and submission throttles (ADR-004). |
| FR-019 | The footer shows the slogan, LinkedIn link, contact email, privacy notice link and copyright "© 2026 DigitalStrike Solutions". |

## 5. Business rules

| ID | Rule |
|---|---|
| BR-001 | No prices are shown anywhere on the site. Budget ranges in the form are a screening question, not a price list. |
| BR-002 | No invented testimonials, client logos, numbers or outcomes. Figures about Raul come only from his CV. Provisional content is visibly marked in non-production builds and listed in CONTENT.md. |
| BR-003 | Refunds/devolution are not mentioned until the legal review (Cinthia) is done. The warranty mentioned is only the 6-month bug-fix warranty. |
| BR-004 | Lifetools is not presented as a DigitalStrike client (that work was done by Origo). Showroom items are presented as "work by our team", not as client endorsements. |
| BR-005 | Spanish is the source language for all copy; English is a translation of the approved Spanish. |
| BR-006 | Inclusive, gender-neutral language in both languages (e.g. "personas emprendedoras", "te", avoid "los clientes" when a neutral form exists). |
| BR-007 | Identifiers, codes and data fields are English `snake_case`. |
| BR-008 | Lead status values: `new` (on creation), then manually `contacting`, `accepted`, `rejected`. |
| BR-009 | Contact, notification and sender email is `manager@digitalstrike-solutions.com` (Google Workspace, configured 2026-10-10, ADR-005); it is configuration, never hard-coded in components. |
| BR-010 | Session 0 is a free, no-commitment first conversation of one hour (Calendly). Confirmed by the owner 2026-10-10. |
| BR-011 | Reply promise: every lead gets an answer within 2 business days. Confirmed by the owner 2026-10-10. |

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-001 | Mobile-first. No horizontal scroll at 360, 390, 768, 1024 and 1440 px; touch targets ≥ 44×44 px. |
| NFR-002 | Accessibility: WCAG 2.1 AA contrast for all text, keyboard-operable navigation, form and dialog, visible focus, labelled fields, `lang` attribute per page. |
| NFR-003 | Performance: static HTML; Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on mobile for `/es/` (Calendly is not loaded until the visitor clicks "Ver horarios disponibles" or submits the form, FR-016, so it does not affect the score). The **gate** is the CI run on the site's own build (US-015 AC4). Production also carries GoDaddy's injected script (ADR-001), outside our code: the release smoke test runs Lighthouse (PageSpeed Insights, mobile) on `https://digitalstrike-solutions.com/es/` and records the score; if it falls below 90 because of that script, the owner decides between accepting it and asking GoDaddy to remove the script. |
| NFR-004 | SEO: unique title and description per language, `hreflang` alternates (`es`, `en`, `x-default`), canonical URLs, Open Graph image, `sitemap.xml`, `robots.txt`. |
| NFR-005 | Privacy: the site's own code adds no analytics and no third-party cookies; fonts self-hosted; the hosting provider's server-injected performance monitoring script (GoDaddy) is accepted and disclosed in the privacy notice (ADR-001); Calendly is loaded only after an explicit visitor action (FR-016) and disclosed in the privacy notice. |
| NFR-006 | Security: no secrets in the repository or the client bundle; the Apps Script endpoint validates everything server-side; personal data is never logged. |
| NFR-007 | Theming: all colours and fonts are theme tokens (UX §2.1, approved identity) — no literals in components. |

## 7. Data and legal

- Jurisdiction: **Costa Rica, Ley 8968** (Protección de la Persona frente al Tratamiento de sus Datos Personales).
- Data controller: Raul Casañas, operating as DigitalStrike Solutions (natural person until incorporation).
- Data collected: the lead form fields; the form stores no IP address. The hosting provider (GoDaddy) keeps standard server access logs (IP, user agent) for security and operation; the privacy notice says so.
- Storage and processors: GoDaddy (hosting: server access logs of every visit, and a performance monitoring script its servers add to every page, which sends technical visit data to GoDaddy and sets GoDaddy cookies on the domain: `_tccl_visitor` (visitor ID, 1 year), `_tccl_visit` and `_scc_session` (checked 2026-10-11)); Google (Sheets, Apps Script, Gmail) for every lead; Calendly from the moment its calendar loads (after the visitor clicks "Ver horarios disponibles" or submits the form, FR-016): it receives technical browser data and may set its own cookies; when it loads after a successful submission it also receives the visitor's name and email to prefill the booking (FR-015); if the visitor books, it processes the booking data. Both may process data outside Costa Rica; the privacy notice says so.
- Consent: an explicit, unchecked checkbox linked to the privacy notice; version `privacy_notice_version` stored with each lead.
- Rights: access, rectification, deletion by email to the contact address.
- Retention: 24 months from the last contact, or until deletion is requested (confirmed by the owner 2026-10-10). Operated through sheet column S `last_contact_at` (contract §6) and the owner procedure in `docs/runbooks/APPS_SCRIPT_SETUP.md` (US-010 AC6): a monthly review deletes rows whose `last_contact_at` (or `submitted_at` when empty) is older than 24 months, and deletion requests are handled within 5 business days. Deletion covers every copy the controller holds: the sheet row, the owner notification in the owner's mailbox (found by `lead_id` in the subject), the visitor confirmation in Sent (found by the visitor's address), and both emptied from Trash. Apps Script logs hold only `lead_id` (NFR-006). Accepted limitation (owner decision 2026-10-11): Google Sheets' version history can still show a deleted row and single versions cannot be deleted; the owner does not use that history for any purpose, and the runbook (`APPS_SCRIPT_SETUP.md`) records the limitation. To be confirmed in the legal review.
- The privacy notice v1 (`2026-10-14-v1`) in CONTENT.md is approved by the owner for publication (merging this spec) and is still to be reviewed by Cinthia Hernández; it is shown publicly with its version and date. Each lead stores the version the visitor saw.

## 8. Success criteria

| Metric | Target | How it is measured |
|---|---|---|
| Qualified leads | **20 to 40 leads in 90 days** from the first public release (2026-10-14 → 2027-01-12); ≥ 20 is success, 40 is the stretch goal | Rows in the leads sheet, excluding test rows and `rejected` spam |
| Session 0 bookings | Tracked, no target yet | Calendly dashboard |
| Visits | Tracked, no target yet | cPanel Metrics → Awstats / Visitors (server logs) |
| First release | Public page with working form and Calendly before **Wednesday 2026-10-14** (entrepreneur meet-up) | `https://digitalstrike-solutions.com` live from release `v0.1.0`, smoke test passed |

## 9. Constraints

- Hosting: GoDaddy cPanel, Deluxe plan, `digitalstrike-solutions.com` (bought 2026-10-10; SSL active; Python apps supported) for production; GitHub Pages for previews (ADR-001).
- Backend: Google Apps Script now; Python later (ADR-002).
- Languages: Spanish and English.
- Timeline: first release by 2026-10-14.
- Budget: the GoDaddy Deluxe plan and domain (bought 2026-10-10); otherwise free tiers (GitHub, Google, Calendly free plan).

## 10. Open questions

Resolved 2026-10-10: GoDaddy Deluxe cPanel hosting and `digitalstrike-solutions.com` bought, SSL active, Python apps supported (ADR-001); session 0 is free (BR-010); 2-business-day reply (BR-011); 24-month retention (§7); 17+ years (CV and LinkedIn are in sync); Poliart agrees to be named in the showroom (private repo, no link); a provisional 200×200 photo was supplied; visual identity = proposal A v3 with Palette 1, the ball logo and the tagline "We strike out your software needs" (approved 2026-10-10).

Still open (non-blocking for Sprint 001):
1. Convert the logo lockups' wordmark text to outlines before printing or the trademark filing (owner).
2. A ≥ 800×800 px photo to replace the provisional 200 px one.
3. A sanitized screenshot of the Poliart platform for the showroom card (no real data).
4. Cami's sign-off on the approved identity (Origo governance; does not block the build).
