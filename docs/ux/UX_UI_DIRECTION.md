# UX_UI_DIRECTION — DigitalStrike Solutions main page

## Metadata
- Version: 0.2 (2026-10-10: proposal A approved; section treatments, focus rule and click-to-load Calendly updated)
- Status: Draft — pending human owner approval
- Copy: `docs/ux/CONTENT.md` (all visitor-facing text; this file defines structure, behaviour and look)
- Visual identity status: **Treatment approved, palette provisional.** Look and feel = proposal A "Dugout" (§2.2), chosen by Raul on 2026-10-10. The palette (identity v1) may still change and is pending Cami's approval; it lives only in tokens (§2.1), so a change is a token-only story (US-020).

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

### 2.1 Provisional tokens (identity v1) — must be theme tokens, never literals in components

| Token | Hex | Use |
|---|---|---|
| `--color-carbon` | `#14181F` | Main background (dark theme is the default look) |
| `--color-night` | `#1B2B46` | Alternate section background, cards |
| `--color-leather` | `#C8872A` | Single accent: CTAs, cursor motif, the word STRIKE, focus ring. Text on dark only |
| `--color-leather-text-on-light` | `#92631F` | Leather used as text on bone (2.63:1 → 4.54:1 fix) |
| `--color-stitch` | `#B3372B` | Decorative only (stitch marks, small details). **Never for text on dark** (2.96:1) |
| `--color-bone` | `#F2EFE9` | Text on dark; light section background |
| `--color-muted` | `#9AA3B2` | Secondary text on carbon (7.0:1) |
| `--color-error` | `#F28B82` on dark / `#B3372B` on bone | Form errors (check contrast in the scaffold) |
| `--color-focus` | `#C8872A` on dark surfaces / `#92631F` on light surfaces | Focus ring; must reach 3:1 against the surface it sits on (leather on bone is only 2.63:1) |

Verified pairs (`.claude/skills/ux-proposals/scripts/contrast.py`): bone/carbon 15.5:1 · bone/night 12.4:1 · leather/carbon 5.9:1 · leather/night 4.7:1 · carbon/leather 5.9:1 (button text) · carbon/bone 15.5:1 · stitch/bone 5.2:1.

Typography (self-hosted via `@fontsource`, no Google Fonts requests):
- **Archivo** — brand, headings (600–800), body (400–500).
- **IBM Plex Mono** — technical details: eyebrows, labels, tags, the "SOLUTIONS" wordmark, step numbers.
- Scale (mobile → desktop): h1 2.25 → 3.5 rem; h2 1.75 → 2.5 rem; body 1 → 1.125 rem; line-height 1.6 body.

Logo: `docs/assets/brand/logo-mark-dark-bg.svg` (default, on carbon/night), `logo-mark-light-bg.svg` (on bone), `logo-mark-mono.svg`. Wordmark next to the mark: "Digital**Strike**" in Archivo 800 (STRIKE in leather) + "SOLUTIONS" in Plex Mono, letter-spaced. Favicon: the small-size inverted version described in the identity doc (leather-filled circle, carbon cursor, no stitches) — Agent 1 creates `favicon.svg` from the mark.

Motifs (subtle, per the tone rule): the `>_` cursor as a bullet/eyebrow marker; a thin stitch-red double tick as a section divider. No baseball illustrations, no MLB-like silhouettes.

Corner radius: 12 px cards, 999 px buttons. Shadows: none on dark; soft on bone sections.

### 2.2 Approved look and feel — Proposal A "Dugout"
- Status: **approved by Raul Casañas on 2026-10-10** (treatment). Palette: provisional, may change (§2.1).
- Reference (visual only; the spec wins): `docs/ux/proposals/propuesta-a-dugout.html` (PR #2).
- Character: dark, technical, product-like; sober, with the `>_` cursor as the only recurring motif. No baseball illustrations.
- Surfaces: carbon page; night bands alternate to separate sections; cards `#1A1F28` (derived from carbon) with a 1 px `#2A3140` border, 12 px radius, no shadows; card hover: border in leather.
- Text: bone for headings/body on dark, secondary text `#C9CED8` (derived, 10.5:1 on cards, 11.3:1 on carbon, 9.0:1 on night); leather for eyebrows, kickers, step numbers, tier labels, links and the slogan.
- Type: Archivo 800 headings (h1 2.25→3.6 rem), body 400/500; IBM Plex Mono for eyebrows/kickers (uppercase, letter-spaced), tier labels, chips and step numbers.
- Buttons: primary = leather fill + carbon text; secondary = transparent + bone 2 px border; card CTA = transparent + `#3A4458` border. Pill radius, min height 48 px (44 px in the header).
- Hero: split layout ≥ 900 px — copy left, a square panel right with a 32 px grid (`#232A36` lines) and the large mark centred; on mobile the panel shrinks to ~160 px tall with a 120 px mark.
- Value strip: night band, 3 columns ≥ 768 px, each with a 2 px leather left rule and a mono number.
- Process: night band, steps with a 2 px `#3A4A68` top rule; warranty card on carbon with a 1 px leather border and the leather shield icon.
- Showroom: 3 cards; image area on night with leather initials (until screenshots exist); chips `#232A36` bg / `#C9CED8` text.
- About: night band; photo in a carbon square with a `#3A4A68` border.
- Clients: carbon; dashed `#3A4458` slots with muted text.
- Form: carbon section; form card on night with a `#2F3F5E` border; inputs carbon with bone text and `#4A5874` border; placeholder muted.
- Scheduling: night band; Calendly preview card (dashed `#4A5874` border) until opened.
- Footer: carbon with a 1 px `#2A3140` top border.
- Derived colours above are shades of the identity palette and become tokens (`--color-surface-card`, `--color-border`, `--color-border-strong`, `--color-text-secondary`, `--color-grid`).

## 3. Section details

**Header.** Sticky, carbon with 90% opacity and blur. Mobile: logo + toggle + hamburger (menu as a full-width sheet, focus-trapped, closes on Esc and link click). Inline nav from 1200 px (below that, the menu button; at 1024 px the five links, toggle and CTA do not fit on one line). The "Agenda tu sesión 0" button is leather with carbon text. Toggle shows `ES | EN`, current language bold and `aria-current="true"`; each is a link to the same anchor on the other language's page.

**Hero.** As §2.2. Eyebrow in Plex Mono with `>_`. H1 ("tu negocio" in italic), subtitle, slogan (italic Archivo, leather). Primary button (leather) → `#contacto`; secondary (outline bone) → `#agenda`. Value strip on night.

**Services.** Carbon background (§2.2). 2-column grid ≥ 768 px, 3 columns ≥ 1280 px (5 cards: A, B, C, D, customisations). Each card: tier letter in Plex Mono, title, "for whom", 3–5 bullet "includes", button "Quiero algo así" that scrolls to `#contacto` and preselects `project_type` (via `?tipo=<code>#contacto` or a client-side event; must work without JS by just jumping to the form). Note under the grid.

**How we work.** Night band. 4 numbered steps (`01`–`04` in Plex Mono) in a horizontal timeline ≥ 1024 px, vertical below. Warranty highlight as a full-width carbon card with a leather border and a shield-like icon outline (simple SVG, no stock icon packs required).

**Showroom.** Carbon background. 3 cards: image area (screenshot or initials placeholder, 16:10), title, description, tags as Plex Mono chips, link "Ver código en GitHub" (opens in new tab, `rel="noopener"`) or the "private" label.

**About the CEO.** Night band. Photo (square, rounded 12 px; provisional 200 px photo, monogram fallback) left, text right (stacked on mobile). Facts as chips. LinkedIn button (outline, new tab).

**Clients.** Carbon. Title + 4 dashed bone-outline slots with the slot text, 2×2 mobile / 4 in a row desktop.

**Lead form.** Carbon background, form on a night card, max width 720 px. Field order: name, email, phone, company, project type (select), budget range (select), timeline (select), message (textarea), consent checkbox with privacy link, honeypot (visually hidden, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`), submit. Validation on blur and on submit; on submit errors, focus the error summary and link each error to its field (`aria-describedby`). Submit disabled + "Enviando…" while pending. On success: replace the form with the thank-you block (focus its heading), set the Calendly prefill (name, email) and offer the "Agendar mi sesión 0" button → `#agenda`. On error: keep data, show the localized message (`role="alert"`), re-enable submit.

**Scheduling.** Night band. Title, body, then a preview card the size of the widget with the button "Ver horarios disponibles" and the one-line Calendly notice (CONTENT §11). **Nothing is requested from Calendly until** the visitor clicks the button or submits the form successfully; then the official inline widget (min-height 700 px desktop, 1000 px mobile) replaces the card, prefilled with name and email after a submission. If the script fails or nothing renders in 10 s: show the fallback link (always present in `<noscript>`).

**Footer.** Carbon. Logo + slogan; email (`mailto:`), LinkedIn, privacy link; location line; copyright.

## 4. Language behaviour (ADR-003)
- `/` decides: saved `ds_lang` → that language; else `navigator.languages[0]` starting with `es` → `/es/`; else `/en/`. `<noscript>` shows two links. `<link rel="alternate" hreflang>` on every page.
- The toggle saves `ds_lang` before navigating. Storage failures are ignored (private mode).
- Each page sets `<html lang="es">` / `<html lang="en">`.

## 5. Responsive and accessibility (acceptance thresholds)
- Widths checked: 360, 390, 768, 1024, 1440 px — no horizontal scroll, no overlapping text.
- Touch targets ≥ 44×44 px; visible focus: 2 px `--color-focus` outline + 2 px offset (leather on dark, leather-text-on-light on light surfaces).
- All text pairs from §2.1 only; any new pair must pass 4.5:1 (3:1 for ≥ 24 px text).
- `prefers-reduced-motion`: no scroll animations.
- Images have meaningful `alt` (CONTENT.md) or `alt=""` when decorative.
