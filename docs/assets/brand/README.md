# Brand assets — approved logo (2026-10-10)

Approved by Raul Casañas on 2026-10-10 together with proposal A v3 and Palette 1 (`docs/ux/UX_UI_DIRECTION.md` §2). Vector redraw of the owner-supplied ball logo. The original 2026-10-10 version had seams down the sides with teal herringbone stitches (`#0E8A9B`); the current files follow the 2026-10-12 revision below: white ball, thin navy outline (`#0B1F44`), light-teal seams and stitches (`#8CCBD4`) across the top and bottom, navy `>_` cursor. Tagline: "We strike out your software needs".

**Revised 2026-10-12 by the owner** (`source/DigitalStrike_Logo-2026-10-12.svg`): the seams now run across the top and the bottom of the ball instead of down the sides, in light teal (`#8CCBD4`) with matching stitches; the outline is thinner and the `>_` cursor is larger and centred. Every file below was regenerated from that ball geometry with `source/generate.py` (`python3 source/generate.py <out-dir>`), keeping the approved Palette 1 colours and the Archivo wordmark. Small sizes (`logo-header-dark.svg`, `favicon.svg`) use thicker strokes so the seams stay visible at 16–40 px. The copies in `public/brand/`, `public/favicon.svg` and the OG image `public/og-image.png` (1200×630, `logo-horizontal-dark.svg` on `#0B132B`) were updated in the same change.

| File | Use |
|---|---|
| `logo-mark-on-dark.svg` | The site (header, hero, footer) — off-white outline for dark surfaces |
| `logo-mark.svg` | Light backgrounds, documents |
| `logo-horizontal-dark.svg`, `logo-horizontal-light.svg` | Mark + stacked wordmark + tagline (OG image, social, documents) |
| `logo-header-dark.svg` | Compact one-line lockup |
| `logo-mark-mono.svg` | One colour |
| `favicon.svg` | Favicon / app icon |

Notes:
- The lockups contain live Archivo text. Convert it to outlines before printing or filing the trademark.
- The previous identity v1 marks (carbon/leather) are superseded and were removed.
- Do not edit these files in implementation PRs; new versions come from the owner via a `DS-DOCS-*` PR.
