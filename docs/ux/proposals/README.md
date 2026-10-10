# Look-and-feel proposals (US-019)

- Status: **Decided — Proposal A "Dugout", chosen by Raul Casañas on 2026-10-10.** Recorded in `docs/ux/UX_UI_DIRECTION.md` §2.2. The palette may still change (token-only, US-020). B and C are kept as references only.
- Built with the kit's `ux-proposals` skill on 2026-10-09 from `docs/ux/UX_UI_DIRECTION.md` §2.1 (identity v1: palette, logo, Archivo + IBM Plex Mono) and the Spanish copy in `docs/ux/CONTENT.md` (verbatim).
- These are **visual references, not production code.** Open the HTML files in a browser (fonts load from Google Fonts in the mockups only; production self-hosts them).

All three share palette, logo, fonts, copy and section order. They differ only in treatment.

| | A — Dugout | B — Scorebook | C — Night game |
|---|---|---|---|
| File | `propuesta-a-dugout.html` | `propuesta-b-scorebook.html` | `propuesta-c-night-game.html` |
| Feel | Dark, technical, product-like | Light, editorial, consultancy-grade | Bold, confident, sporty-elegant |
| Base | Carbon, night bands | Bone/white, carbon and night bands | Night blue, leather band, bone sections |
| Type use | Mono labels everywhere, medium headline | Oversized headline, underline accent, ruled grids | Very large headline, italic leather emphasis, big tier letters |
| Motif | Grid panel with the mark, `>_` cursors | Thin rules, scorebook grid for services | Large ball outline with stitch seams bleeding off the hero |
| Best for | Tech-savvy founders, matches identity v1 most closely | Companies (B2B), managers who buy systems | Memorability for B2C and meet-ups, still sober |
| Risk | Can feel "developer-only" to non-technical entrepreneurs | Least distinctive of the three | Seams motif must stay subtle (tone rule) |

Checks run (2026-10-10): `contrast.py` on every text pair used (all pass; the large initials on C's project cards pass the 3:1 large-text threshold); `check_pages.mjs` extended to 360, 390, 768, 1024, 1280 and 1440 px — no horizontal overflow and no targets under 44 px in any file. The focus ring is two-colour (leather outline + carbon ring) so it reaches 3:1 on light and dark surfaces. The inline nav starts at 1200 px (at 1024 px it wrapped).

Note on C: its large ball-and-seams outline goes beyond the tone rule (baseball only in name, logo, slogan and the confirmation email; UX §2.1 "no baseball illustrations"). It was shown as a stretch option; since A was chosen, the specs stay unchanged.

Provisional in all three: Raul's photo (monogram), project screenshots, client logos (placeholders), Calendly (placeholder box), mobile menu (not drawn). Identity v1 pending Cami's approval.

After the decision: the Visual Identity section (UX §2.2) and story US-020 are filled in a follow-up docs PR.

## Proposal A v2 — Dugout with Palette 1 (2026-10-10, awaiting approval)

File: `propuesta-a-v2-dugout-paleta1.html`. Same layout and copy as A, plus the owner's answers (session 0 free, receipt-only success copy, click-to-load Calendly, Poliart named, provisional photo). New palette "Masculine Tech Balance":

| Token | Hex | Use | Contrast checked |
|---|---|---|---|
| `--color-navy` | `#0B132B` | Page background | off-white 17.1:1, cyan 9.0:1, sand 11.1:1 |
| `--color-steel` | `#1C2541` | Alternate bands | off-white 14.1:1, cyan 7.4:1, sand 9.1:1 |
| `--color-cyan` | `#21C7D9` | Single accent: CTAs (navy text 9.0:1), kickers, links, focus | — |
| `--color-cyan-ink` | `#157D89` | Cyan as text/lines on light surfaces (4.52:1 on off-white) | — |
| `--color-sand` | `#D9C7A3` | Warm accent: slogan, pending tags, glove/cracks in the marks | — |
| `--color-off` | `#F5F7F8` | Text on dark; light surfaces | — |
| `--color-charcoal` | `#111315` | Footer | off-white 17.3:1 |
| derived | `#131C36` card · `#26314F` border · `#3A4870` strong border · `#AEB8C9` secondary text (≥ 7.5:1 on navy/steel/card) | | |

Three original ball marks (`marks/`), switchable in the mockup's hero via the mock-only band at the top. In every one the stitches are `>` chevrons, a nod to the cursor:

| Mark | Idea | Files |
|---|---|---|
| 1 · Impacto | The ball breaks through the surface: the problem is struck out | `m1-impacto-{dark,light}.svg` |
| 2 · Atrapada | The glove catches the ball: we take the problem off your hands (the figure the identity doc already favoured) | `m2-atrapada-{dark,light}.svg` |
| 3 · Costura | Clean ball with `>` stitches and the `>_` cursor; used in the header because it stays legible at 40 px | `m3-costura-{dark,light}.svg` |
| Favicon | Cyan disc with a navy `>_`, no stitches (16–32 px) | `favicon.svg` |

The marks are drawn from scratch for DigitalStrike. The reference images the owner shared are watermarked stock (Shutterstock, Dreamstime) and were used only as ideas, never traced, so the final mark can be registered with the Registro de la Propiedad Industrial. They are concept-level vectors; a designer can refine the chosen one before registration.

Checks: `contrast.py` on every pair above; layout check at 360/390/768/1024/1280/1440 px with no overflow and all targets ≥ 44 px.
