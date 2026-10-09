---
name: ux-proposals
description: Create 2-3 look-and-feel proposals (self-contained HTML mockups) for a project's website or landing page from its approved UX spec and the client's brand material, then turn the owner's choice into the spec's Visual Identity section and an "apply visual identity" story. Use this whenever someone wants visual/design proposals, a look and feel, mockups, design directions, branding options, "make it look good/professional/serious", a redesign, or wants to show a client options for how a page could look, even if they don't say "proposal" or "mockup". Also use it when brand material (slides, logo, photos, colors) is shared and the next step is design. Not for implementing production code: the chosen direction is recorded in the spec and built through the normal sprint flow.
---

# UX Proposals

Produce look-and-feel proposals the client can react to, grounded in the project's own spec and brand, then record the decision so agents can implement it. This skill covers steps 2, 3, 5 and 6 of `docs/process/VISUAL_IDENTITY_PROCESS.md` (it asks for step 1's brand inputs; step 4, the decision, is the owner's). Read that file once if it exists; it explains where this fits.

The point of the proposals is a **decision**, not a pretty file. A good proposal set shows two genuinely different, credible directions for the same content, so the owner can say "that one" (or "A with B's hero") in minutes. Everything below serves that.

## Workflow

### 1. Read the project before designing

Designs that ignore the spec get rejected or, worse, approved and then contradict it. Read, in this order, using the paths listed in `PROJECT_CONTEXT.md`:

- `docs/ux/UX_UI_DIRECTION.md`: section order, the **approved copy** (use it verbatim), languages, anchors, imagery rules, anything already decided about visuals.
- `docs/specs/PROJECT_SPEC.md`: audience, business rules. Note rules that constrain design, e.g. "no guaranteed outcomes", "neutral language", "no pricing shown".
- `TECH_STACK.md`: what will implement this (so tokens map cleanly, e.g. Tailwind theme tokens).
- `AGENTS.md`: who owns docs; you propose doc changes, you don't silently change specs.

Write down, for yourself: the page's single job, the audience in one line, the section list, and the design-relevant business rules.

### 2. Gather and inspect brand inputs

Ask the user for anything missing, but don't block on it: proceed with clearly labeled stand-ins.

- **Existing material** (slides, posts, current site, business cards): sample exact colors with `scripts/sample_colors.py <image...>`. Don't eyeball hex values; small differences make a brand look "off".
- **Logo:** a vector (SVG) or transparent PNG. A crop from a screenshot is fine for a mockup only; otherwise set a typographic stand-in that imitates it and label it provisional.
- **Photos of the people presented:** need to be actual files. Images pasted inline in chat and social-media links often can't be read from the agent's environment. Ask for the file. Note resolution (≥800 px for production) and consent.
- **References / dislikes:** 1–3 sites the client likes, anything to avoid.

Note brand questions the material raises but the spec doesn't answer (imagery that conflicts with the spec, an audience the spec doesn't cover). You'll list these as open decisions; don't resolve them silently in the design.

### 3. Choose the directions

Read `references/design-patterns.md` (treatment options, page patterns, what research says converts). Pick **2 directions** (3 only if the owner asked, or two are equally plausible). They should differ in *treatment*: palette balance, type pairing, density, motif. Never in content or section order. A strong default pair:

- **A, closest to the client's existing material**, refined: what they'd recognize as theirs, done more professionally.
- **B, a credible stretch**: a different treatment from the catalog that still fits the audience and brand colors.

If the owner describes the feel they want ("more serious", "warmer"), apply it to **both** directions and vary the treatment within it (e.g. an Editorial layout made corporate with a darker derived shade and restrained motifs). Shades or tints derived from a brand color are fine; label them as derived in the spec section.

For each, write a 4-line plan: palette (named hex tokens), type pairing (display / body, Google Fonts), layout idea, one signature motif. Check the plan against the "avoid" list in the patterns reference; if it reads like a generic template, change the part that does.

### 4. Build each proposal

One **self-contained HTML file** per direction, so it opens anywhere and can be shared as-is:

- Inline CSS; fonts from Google Fonts with fallback stacks; images embedded as data URIs (resize photos first; keep each file well under 2 MB); no other external requests.
- All sections in the spec's order, with the **approved copy verbatim** in the primary language. Show the language switcher if the site is multilingual (visual only is fine).
- The full conversion path: form with realistic example values, and its success state (a small script toggling `hidden` on submit, with `preventDefault`).
- **No invented proof or promises:** testimonials, logos, numbers, prices, and credentials are visible "pending" placeholders unless the client supplied real, approved ones. Don't add claims the spec forbids.
- **Mock-only text uses the page's primary language.** Everything the client reads that is not approved copy (the banner, "proposed copy" tags, pending markers, placeholder notes, notes on embedded widgets) is written in the primary language of the page, in one consistent visual style (e.g. a dashed tag). *Example from the pilot, a Spanish page:* "Texto propuesto", "Pendiente de validación", "Espacio para testimonio real".
- **Copy the patterns want but the spec lacks** (a "what happens next" line by the submit button, section headings, a trust line in the hero):
  - Never write it in silently. Either leave it out, or show it with the "proposed copy" tag and list it in the presentation for approval.
  - Repeating the spec's primary CTA wording elsewhere on the page is reuse, not new copy.
- **Trust cues** must be facts from the spec or supplied by the client (a credential, a data-protection statement the spec requires, an approved fact such as a free first consultation).
  - With none available, use the real person's name and role from the spec, plus their photo if supplied (consent permitting).
  - With nothing at all, leave the trust cue out and list it as missing in the presentation. Never state an offer term the spec doesn't contain.
- **Placeholders should look designed:** style pending testimonial/credential slots in the proposal's own treatment (quote mark, card, name line) with a short note in the page's language, rather than grey wireframe bars, so the client judges the design and not a wireframe.
- **Embedded widgets** the spec calls for (scheduler, map, video) appear as a styled placeholder of the right size with a mock-only note.
- **Banner** at the top: proposal name, that it is a visual reference and not production, and which assets are provisional (in the page's language).
- Responsive down to 360 px with no horizontal scroll; touch targets at least 44×44 px; visible focus states; `prefers-reduced-motion` respected.
- Colors as CSS custom properties named like the future tokens, so the spec section can copy them.

Keep motion minimal and content visible at rest. A reviewer skimming a screenshot must see the whole page.

### 5. Check before presenting

Run the quality gate in `references/quality-bar.md`. At minimum:

- `scripts/contrast.py` on every text/background pair you used; fix failures (usually by adding a darker text-safe variant of an accent, e.g. a "gold-ink" for gold text on white).
- One look at each page at ~390 px and ~1280 px wide, then one round of fixes. Don't loop. `scripts/check_pages.mjs` does this in one run: full-page screenshots at 360/390/1280, horizontal overflow, and touch targets smaller than 44×44 px (inline text links exempt). It needs Node 18+ and `playwright` or `playwright-core` resolvable from the folder you run it in; see the script header for setup.
- Re-read the copy against the spec: nothing added, nothing dropped.

### 6. Present for a decision

Share the files (publish them as private artifacts/pages if that tool is available, otherwise give file paths). Then give the owner, briefly:

- One line per proposal: what it is and who it suits.
- A short comparison table (feel, palette, type, strengths, risks).
- Provisional assets and what's needed to finalize them.
- Open brand questions found in step 2.
- The question: "A, B, or a mix (say which parts)?"

### 7. After the decision: record it

Draft, using `references/spec-templates.md`:

1. The **Visual Identity** section for `UX_UI_DIRECTION.md` (status approved, date, who decided, reference link, tokens table, typography, components per section, motif rules, asset requirements, open questions).
2. The **"Apply the approved visual identity"** user story with testable acceptance criteria.

Adapt the section number to the project's UX doc. Where to keep the chosen mockup is the owner's call: files with client photos are personal data, so a private link is often better than committing them.

Docs are owned by the human owner (`AGENTS.md`): deliver these as a PR or a proposed diff for approval, following the repo's branch/PR naming rules. Don't write production code here. Implementation happens in the sprint, and reviewers check it against the spec section, not the mockup.

## Mixing proposals

If the owner picks "A with B's hero", build the merged version once (same rules), confirm, then record. Record only what was approved.
