# Look-and-feel proposals (US-019)

- Status: **Awaiting the owner's decision** (by Mon 2026-10-12 12:00 to fit Sprint 001; otherwise Sprint 002)
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

Checks run: `contrast.py` on every text pair used (all pass; the large initials on C's project cards pass the 3:1 large-text threshold), `check_pages.mjs` at 360/390/1280 px (no overflow, targets ≥ 44 px).

Provisional in all three: Raul's photo (monogram), project screenshots, client logos (placeholders), Calendly (placeholder box), mobile menu (not drawn). Identity v1 pending Cami's approval.

After the decision: the Visual Identity section (UX §2.2) and story US-020 are filled in a follow-up docs PR.
