# VISUAL_IDENTITY_PROCESS

How a project with a user interface goes from "provisional look" to an approved visual identity that agents can implement. Run it once per project, and again only for a deliberate redesign.

The first pilot used this sequence: functional prototype first, then 2 visual proposals built from the client's existing brand material, the owner picked one, it was written into the UX spec, then it was implemented as its own story.

## When to run it

- **Default:** after the first functional prototype, before the go-live sprint. Visitors see the real flow, and stakeholders react to real content instead of lorem ipsum.
- **Earlier**, at discovery, when the client already has a firm brand guide and wants it from day one.
- Until it runs, the UI uses a **provisional palette defined as theme tokens** (e.g. Tailwind `@theme`), never hex literals in components. Applying the approved identity then becomes one focused story instead of a rewrite.

## Steps

1. **Collect brand inputs** (the human owner, from the client):
   - existing material: slides, social posts, business cards, current site
   - logo as SVG, or PNG with transparency (a screenshot crop is only good enough for mockups)
   - photos of the people the page presents: original files, at least 800×800 px, with consent for web use
   - 1–3 reference sites the client likes, and anything to avoid
2. **Extract the basics** from that material: sample the exact brand colors (hex), identify the typeface style, and note recurring motifs.
3. **Explore: 2 proposals, 3 at most.**
   - Build them as quick visual mockups with the kit's `ux-proposals` skill or another design tool (see Tools below). Mockups are references, not production code.
   - Each proposal uses the **approved copy and section order** from the UX spec, and differs in treatment (e.g. light/corporate vs. dark/editorial), not in content.
   - Proposals must obey the spec's business rules: no invented testimonials, prices, or outcomes; provisional items visibly marked.
   - Label each mockup as a proposal, and list which assets are provisional.
4. **Decide:** the human owner picks one, or a mix. Record who decided and the date. Stakeholder (client) review can follow, but the decision is recorded either way.
5. **Write it into the spec** (`docs/ux/UX_UI_DIRECTION.md`, "Visual Identity" section) as implementable facts:
   - color tokens (name, hex, use), including a text-safe variant of any accent that fails contrast
   - typefaces per role, weights, and the type scale
   - component descriptions per section, corner radius, motif rules
   - imagery rules and asset requirements
   - a link to the chosen mockup as a visual reference only
6. **Create the story** "Apply the approved visual identity", with acceptance criteria for: tokens replacing the provisional palette, fonts, every section in every language and at the defined widths, assets, contrast (WCAG AA), and existing tests staying green.
7. **Implement** through the normal sprint flow. The review agent checks against the spec section, not the mockup.

## Tools

### Recommended: the kit's `ux-proposals` skill

`.claude/skills/ux-proposals/` ships with this kit and loads automatically in Claude Code for any account. It covers steps 2, 3, 5 and 6 of this process (it asks for step 1's inputs; step 4, the decision, stays with the owner):

- reads the UX spec, business rules, and stack first, and uses the approved copy verbatim
- samples exact brand colors from the client's material (`scripts/sample_colors.py`)
- builds 2 (max 3) self-contained HTML proposals that differ in treatment, from a research-backed pattern catalog (`references/design-patterns.md`)
- enforces the SDD rules: no invented proof, prices, or promises; provisional assets labeled
- checks contrast (`scripts/contrast.py`, including a text-safe variant for bright accents) and layout (`scripts/check_pages.mjs`: screenshots, horizontal overflow, 44×44 px touch targets) before presenting
- after the owner decides, drafts the Visual Identity section and the "apply visual identity" story (`references/spec-templates.md`) as a PR for approval

Invoke with `/ux-proposals`, or ask for "look and feel proposals" and it triggers from its description. Any other design tool works too, as long as the output passes `references/quality-bar.md`.

### Pilot note

The first pilot used a third-party one-page-offer skill. Most of its defaults (its own palette and brand, pricing blocks, sample testimonials, effects, React output) had to be overridden to fit the spec, which is why the kit now has its own skill instead. Two practical lessons carried into `ux-proposals`:
- images must be real files: images pasted inline in chat and social-media links could not be used from the agent's environment
- a logo cropped from a screenshot is only good for a mockup; use a typographic stand-in and request the vector file

## Rules

- The spec is the source of truth. If the mockup and the spec disagree, the spec wins; fix the spec first if the mockup was right.
- Accessibility is part of the identity: check every text/background pair for contrast before approving.
- Record unresolved brand questions (imagery style, audiences implied by the material) as open decisions in the UX spec. Do not resolve them silently in the design.
