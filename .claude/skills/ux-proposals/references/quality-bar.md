# Quality bar before presenting

Run through this once per proposal. Fix what fails, then present. Don't iterate endlessly: one check, one fix round.

## Spec fidelity
- [ ] Every section from `UX_UI_DIRECTION.md` is present, in order, with the approved copy verbatim (primary language).
- [ ] Form fields, options, consent text, and success message match the spec/contract.
- [ ] Nothing the spec forbids: guaranteed outcomes, invented proof, prices, non-inclusive wording.
- [ ] Unsupplied proof/credentials/photos are visible "pending" placeholders, styled in the proposal's treatment.
- [ ] No new copy or claims slipped in; any suggested copy carries the "proposed copy" tag (in the page's language) and is listed for approval.
- [ ] Banner states the proposal name, that it is a visual reference and not production, and the provisional assets, in the page's primary language.

## Brand
- [ ] Colors come from `scripts/sample_colors.py` output or the client's guide, or are shades/tints derived from those colors and labelled as derived (hex noted in the plan), never guesses.
- [ ] No default palette or branding from any tool or skill.
- [ ] Logo: real file, or a labeled typographic stand-in.

## Accessibility
- [ ] `scripts/contrast.py` passes for every text/background pair used (4.5:1 normal text, 3:1 large text and UI boundaries).
- [ ] Bright accents are never body/label text on light backgrounds; a text-safe variant exists if needed.
- [ ] Labels above fields; visible focus states; touch targets at least 44×44 px (inline text links exempt, WCAG 2.5.8); images have `alt`.
- [ ] `prefers-reduced-motion` respected; content visible without animation.

## Layout
- [ ] No horizontal scroll at 360–390 px; hero stacks sensibly; steps stack.
- [ ] One primary CTA wording, repeated (hero, mid-page, end).
- [ ] Headline, supporting line, CTA, and a trust cue are above the fold at 1280 px and 390 px.
- [ ] Form: single column, labels above fields, radio buttons for short option lists, format examples as placeholders only.
- [ ] Next to submit: what happens next, plus the privacy/consent note.
- [ ] Contact info and any real external presence (profiles, reviews, media) are easy to find.
- [ ] Adjacent sections distinguishable (background alternation), consistent side gutter.

## Craft
- [ ] Two directions differ in treatment, not content.
- [ ] Neither reads as a generic template (check the avoid list in `design-patterns.md`).
- [ ] Each file is self-contained (opens offline except Google Fonts) and under ~2 MB.
