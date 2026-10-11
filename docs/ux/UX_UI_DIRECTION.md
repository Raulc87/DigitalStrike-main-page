# UX_UI_DIRECTION — DigitalStrike Solutions main page

## Metadata
- Version: 0.3 (2026-10-10: visual identity approved — proposal A v3, Palette 1, ball logo)
- Status: **Approved** by Raul Casañas — effective when PR #1 is merged
- Copy: `docs/ux/CONTENT.md` (all visitor-facing text; this file defines structure, behaviour and look)
- Visual identity status: **APPROVED** by Raul Casañas on 2026-10-10 — proposal A v3 "Dugout" with Palette 1 (Masculine Tech Balance) and the ball logo (§2). Identity v1 (carbon/leather) is superseded. Cami's sign-off on the brand is still recorded as pending in the Origo governance docs; it does not block the build.

## 1. Page structure

One long page per language. Anchors use the Spanish IDs on both pages so links and tests are stable.

| # | Section | Anchor | Purpose |
|---|---|---|---|
| 1 | Header (sticky) | — | Logo, nav, `ES \| EN` toggle, "Agenda tu sesión 0" button |
| 2 | Hero + value strip | `#inicio` | What we do, slogan, two CTAs, three reasons to trust |
| 3 | Services | `#servicios` | Tier cards A–D + customisations, no prices |
| 4 | How we work | `#como-trabajamos` | 4 steps + warranty highlight |
| 5 | Showroom | `#proyectos` | 3 project cards |
| 6 | About the CEO | `#nosotros` | Photo, bio, facts, LinkedIn |
| 7 | Clients | `#clientes` | 4 placeholder slots (hidden when `PUBLIC_SHOW_CLIENT_LOGOS=false`) |
| 8 | Lead form | `#contacto` | Screening form → thank-you state |
| 9 | Scheduling | `#agenda` | Calendly inline |
| 10 | Footer | — | Slogan, contact, LinkedIn, privacy, © |

Privacy notice: a dialog opened from the form (keeps form data) and a standalone page `/es/privacidad/` and `/en/privacy/` linked from the footer.

## 2. Visual identity

### 2.1 Tokens — always theme tokens, never literals in components

| Token | Hex | Use |
|---|---|---|
| `--color-navy` | `#0B132B` | Page background (dark is the default look) |
| `--color-steel` | `#1C2541` | Alternate section bands |
| `--color-cyan` | `#21C7D9` | Single accent: primary buttons, kickers/eyebrows, step numbers, tier labels, links, "Solutions" in the dark wordmark, focus ring on dark |
| `--color-cyan-ink` | `#157D89` | Cyan as text or focus ring on light surfaces (4.52:1 on off-white) |
| `--color-sand` | `#D9C7A3` | Warm accent: the slogan, pending tags |
| `--color-off` | `#F5F7F8` | Text on dark; light surfaces |
| `--color-charcoal` | `#111315` | Footer background |
| `--color-card` | `#131C36` | Cards (derived) |
| `--color-border` | `#26314F` | Card and header borders (derived) |
| `--color-border-strong` | `#3A4870` | Inputs, dashed slots, secondary outlines (derived) |
| `--color-text-2` | `#AEB8C9` | Secondary text (derived) |
| `--color-grid` | `#18213D` | Hero grid lines, chip background (derived) |
| `--color-error` | `#FF8A80` | Form errors on dark |
| `--color-focus` | cyan on dark / cyan-ink on light | 2 px outline + 2 px offset, plus a 2 px navy ring so it reaches 3:1 on any surface |
| `--color-logo-navy` | `#0B1F44` | Logo only (outline, cursor, light wordmark) |
| `--color-logo-teal` | `#0E8A9B` | Logo only (stitches, "Solutions" in the light wordmark); never small text |

Verified pairs (`contrast.py`): off-white on navy 17.1:1, on steel 14.1:1, on charcoal 17.3:1 · cyan on navy 9.0:1, on steel 7.4:1, on card 8.2:1, on charcoal 9.1:1 · navy on cyan 9.0:1 (button text) · sand on navy 11.1:1, on steel 9.1:1 · text-2 on navy 9.2:1, on steel 7.6:1, on card 8.4:1, on charcoal 9.3:1 · error on navy 8.1:1, on steel 6.6:1, on card 7.4:1 · cyan-ink on off-white 4.52:1. Cyan on off-white fails (1.91:1): never use it as text on light surfaces.

Typography (self-hosted via `@fontsource`, no Google Fonts requests):
- **Archivo** — wordmark, headings (600–800), body (400–500).
- **IBM Plex Mono** — eyebrows/kickers (uppercase, letter-spaced), tier labels, chips, step numbers.
- Scale (mobile → desktop): h1 2.25 → 3.6 rem; h2 1.75 → 2.5 rem; body 1 → 1.125 rem; line-height 1.6.

**Logo** (approved 2026-10-10; vector files in `docs/assets/brand/`): a white baseball with a navy outline, teal herringbone stitches and a navy `>_` cursor in the centre.

| File | Use |
|---|---|
| `logo-mark-on-dark.svg` | The site: header (44 px), hero (≈300 px desktop, 150 px mobile), footer |
| `logo-mark.svg` | Light backgrounds, documents |
| `logo-horizontal-dark.svg` / `logo-horizontal-light.svg` | Mark + stacked wordmark + tagline "WE STRIKE OUT YOUR SOFTWARE NEEDS" (OG image, social, documents) |
| `logo-header-dark.svg` | Compact one-line lockup |
| `logo-mark-mono.svg` | One colour |
| `favicon.svg` | Navy rounded square with the ball (favicon, app icon) |

- Wordmark on the site is live text, not an image: "DigitalStrike" (Archivo 800, off-white) + "Solutions" (Archivo 800, cyan); below 420 px only "DigitalStrike" is shown next to the mark.
- The SVG lockups contain Archivo text; convert it to outlines before printing or registering the mark (owner, before the trademark filing).
- Tone rule still applies: baseball lives in the name, the logo, the slogan and the confirmation email; no other baseball illustrations on the page.

Corner radius: 12 px cards, 999 px buttons. No shadows on dark surfaces except the hero logo (soft drop shadow).

### 2.2 Approved look and feel — Proposal A v3 "Dugout"
- Status: **approved by Raul Casañas on 2026-10-10.**
- Reference (visual only; the spec wins): `docs/ux/proposals/propuesta-a-v3-dugout-logo.html` (PR #2).
- Character: dark, technical, product-like; sober, with the `>_` cursor as the recurring motif.
- Surfaces: navy page; steel bands alternate to separate sections; cards `--color-card` with a 1 px `--color-border` border, 12 px radius; card hover: border in cyan.
- Text: off-white headings/body; secondary text `--color-text-2`; cyan for eyebrows, kickers, step numbers, tier labels and links; sand for the slogan.
- Buttons: primary = cyan fill + navy text; secondary = transparent + off-white 2 px border; card CTA = transparent + `--color-border-strong` border. Pill radius, min height 48 px (44 px in the header).
- Header: sticky, navy at 90 % with blur, 1 px `--color-border` bottom border; logo mark + live wordmark left; nav inline from 1200 px; `ES | EN` toggle and the cyan "Agenda tu sesión 0" button right.
- Hero: split layout ≥ 900 px — copy left, a square panel right (1 px `--color-border`, 32 px grid in `--color-grid`) with the large logo mark centred; on mobile the panel is ~160 px tall with a 150 px mark.
- Value strip: steel band, 3 columns ≥ 768 px, each with a 2 px cyan left rule and a mono number.
- Services: navy; 2 columns ≥ 768 px, 3 ≥ 1280 px.
- Process: steel band; steps with a 2 px `--color-border-strong` top rule; warranty card on navy with a 1 px cyan border and the cyan shield icon.
- Showroom: navy; 3 cards; image area on steel with cyan initials until screenshots exist; chips `--color-grid` bg / `--color-text-2` text.
- About: steel band; photo square, 12 px radius, `--color-border-strong` border.
- Clients: navy; dashed `--color-border-strong` slots with `--color-text-2` text.
- Form: navy section; form card on steel with a `--color-border-strong` border; inputs navy with off-white text and `--color-border-strong` border.
- Scheduling: steel band; Calendly preview card (dashed `--color-border-strong`) with the cyan "Ver horarios disponibles" button until opened.
- Footer: charcoal with a 1 px `--color-border` top border; logo mark + wordmark, sand slogan.

## 3. Section details

**Header.** Sticky, navy with 90% opacity and blur (§2.2). Mobile: logo + toggle + hamburger (menu as a full-width sheet, focus-trapped, closes on Esc and link click). Inline nav from 1200 px (below that, the menu button; at 1024 px the five links, toggle and CTA do not fit on one line). The "Agenda tu sesión 0" button is cyan with navy text. Toggle shows `ES | EN`, current language bold and `aria-current="true"`; each is a link to the same anchor on the other language's page.

**Hero.** As §2.2. Eyebrow in Plex Mono with `>_`. H1 ("tu negocio" in italic), subtitle, slogan (italic Archivo, sand). Primary button (cyan) → `#contacto`; secondary (outline off-white) → `#agenda`. Value strip on steel.

**Services.** Navy background (§2.2). 2-column grid ≥ 768 px, 3 columns ≥ 1280 px (5 cards: A, B, C, D, customisations). Each card: tier letter in Plex Mono, title, "for whom", 3–5 bullet "includes", button "Quiero algo así" that scrolls to `#contacto` and preselects `project_type` (via `?tipo=<code>#contacto` or a client-side event; must work without JS by just jumping to the form). Note under the grid.

**How we work.** Steel band. 4 numbered steps (`01`–`04` in Plex Mono) in a horizontal timeline ≥ 1024 px, vertical below. Warranty highlight as a full-width navy card with a cyan border and a shield-like icon outline (simple SVG, no stock icon packs required).

**Showroom.** Navy background. 3 cards: image area (screenshot or initials placeholder, 16:10), title, description, tags as Plex Mono chips, link "Ver código en GitHub" (opens in new tab, `rel="noopener"`) or the "private" label.

**About the CEO.** Steel band. Photo (square, rounded 12 px; provisional 200 px photo, monogram fallback) left, text right (stacked on mobile). Facts as chips. LinkedIn button (outline, new tab).

**Clients.** Navy. Title + 4 dashed slots (`--color-border-strong`) with the slot text, 2×2 mobile / 4 in a row desktop.

**Lead form.** Navy background, form on a steel card, max width 720 px. Field order: name, email, phone, company, project type (select), budget range (select), timeline (select), message (textarea), consent checkbox with privacy link, submit; the honeypot sits outside the lead form (see "Autofill and honeypot" below). Validation on blur and on submit; on submit errors, focus the error summary and link each error to its field (`aria-describedby`). Submit disabled + "Enviando…" while pending. On success: replace the form with the thank-you block (focus its heading), set the Calendly prefill (name, email) and offer the "Agendar mi sesión 0" button → `#agenda`. On error: keep data, show the localized message (`role="alert"`), re-enable submit.

**Autofill and honeypot (owner decision 2026-10-11).** Autofill stays a supported way to fill the form. The visible fields keep their autofill hints and stay inside the lead form, so a browser or password manager can fill them in one step:

| Field | `autocomplete` |
|---|---|
| `name` | `name` |
| `email` (`type="email"`) | `email` |
| `phone` (`type="tel"`) | `tel` |
| `company` | `organization` |
| `project_type`, `budget_range`, `timeline` (selects) | `off` |
| `message` (textarea) | `off` |
| `consent` (checkbox) | none; unchecked by default |

Browser autofill and password managers ignore `autocomplete="off"` and fill hidden fields they recognize. On the Gaby pilot (2026-09-30) this filled a `name="website"` field inside the lead form, and a real lead was silently dropped. The honeypot (ADR-004, contract §5.1) therefore:
- is a `type="text"` input inside **its own separate `<form>`, outside the lead form** (autofill fills one form at a time). That form has no submit button, and its `submit` event is always prevented, so pressing Enter in it never reloads the page;
- has a DOM `id`/`name` that autofill heuristics do not recognize. It contains none of the words website, url, homepage, company, name, email, phone, tel, address or city (e.g. `id="lead-hp" name="hp_field"`), and has no label, placeholder or `title`;
- carries `autocomplete="off"` plus `data-1p-ignore`, `data-lpignore="true"`, `data-bwignore="true"` and `data-form-type="other"`;
- stays off-screen (not `display: none`, not `type="hidden"`), with `tabindex="-1"` and `aria-hidden="true"` on its wrapper.

On submit, the lead form's script reads that input and sends its value as the JSON field `website`; the contract is unchanged. The fix isolates the honeypot from autofill. It never disables autofill for the visible fields.

**Scheduling.** Steel band. Title, body, then a preview card the size of the widget with the button "Ver horarios disponibles" and the one-line Calendly notice (CONTENT §11). **Nothing is requested from Calendly until** the visitor clicks the button or submits the form successfully; then the official inline widget (min-height 700 px desktop, 1000 px mobile) replaces the card, prefilled with name and email after a submission. If the script fails or nothing renders in 10 s: show the fallback link (always present in `<noscript>`).

**Footer.** Charcoal. Logo + wordmark + slogan (sand); email (`mailto:`), LinkedIn, privacy link; location line; copyright.

## 4. Language behaviour (ADR-003)
- `/` decides: saved `ds_lang` → that language; else `navigator.languages[0]` starting with `es` → `/es/`; else `/en/`. `<noscript>` shows two links. `<link rel="alternate" hreflang>` on every page.
- The toggle saves `ds_lang` before navigating. Storage failures are ignored (private mode).
- Each page sets `<html lang="es">` / `<html lang="en">`.

## 5. Responsive and accessibility (acceptance thresholds)
- Widths checked: 360, 390, 768, 1024, 1440 px — no horizontal scroll, no overlapping text.
- Touch targets ≥ 44×44 px; visible focus: 2 px `--color-focus` outline + 2 px offset plus a 2 px navy ring (cyan on dark, cyan-ink on light surfaces).
- All text pairs from §2.1 only; any new pair must pass 4.5:1 (3:1 for ≥ 24 px text).
- `prefers-reduced-motion`: no scroll animations.
- Images have meaningful `alt` (CONTENT.md) or `alt=""` when decorative.
