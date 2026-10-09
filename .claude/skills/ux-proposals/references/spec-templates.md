# Templates for recording the decision

Fill these after the owner chooses. Keep only what was approved. Deliver as a PR or proposed diff (docs are owned by the human owner).

## A. Visual Identity section (for `docs/ux/UX_UI_DIRECTION.md`)

```markdown
## 2.1 Visual Identity — <Proposal name> (approved <YYYY-MM-DD>)

Chosen by <who> from <N> explorations. Reference mockup (visual reference only, not code): <link or path>

Character: <one or two sentences: the feel, what carries weight, the one recurring motif>.

### Color tokens

Source: <sampled from ... / client brand guide>; derived tokens name their base token in the Source column. Implement as theme tokens (<e.g. Tailwind @theme in src/styles/global.css>), replacing the provisional palette; components use tokens, never hex literals.

| Token | Hex | Source | Use |
|---|---|---|---|
| `<name>` | `#RRGGBB` | <sampled / client guide / derived from `<token>`> | <where it is used; restrictions such as "fill only, never text on white"> |

Contrast checked with `.claude/skills/ux-proposals/scripts/contrast.py`: <pairs and ratios, or "all text pairs ≥4.5:1">.

### Typography

| Role | Face | Weights |
|---|---|---|
| Headings | <font> (Google Fonts) | <weights> |
| Body, labels, form, buttons | <font> | <weights> |
| Logo stand-in (until the real file arrives) | <font> | <weights> |

Scale: <hero / section titles / body / labels>. <Line length and wrapping rules.>

### Components and layout

- **Header:** ...
- **Hero:** ...
- **Buttons:** ...
- <one bullet per section in the spec's order>
- Corners / effects: <radius; what is deliberately not used>

### Motif rules
- <where the signature motif may appear, how often, never behind body text>

### Assets
- Logo: <status, required format>
- Photos: <status, resolution ≥800 px, consent>
```

Also update the spec's imagery section and list any open brand questions (under stakeholder validation) instead of deciding them in the design.

## B. Story (for `docs/specs/USER_STORIES.md`)

```markdown
## US-<NNN> — Apply the approved visual identity
- Priority: High
- Story Points: <estimate, typically 5>
- Status: Proposed — <sprint> candidate
- Related Requirements: <NFRs on responsiveness/readability, the "copy/imagery subject to validation" rule>
- Related Spec: `docs/ux/UX_UI_DIRECTION.md` section 2.1

**User Story**

As <the client>,
I want the page to look like my brand,
so that visitors see a <trustworthy/credible/...> professional before they leave their data.

**Acceptance Criteria**
1. The color tokens in UX_UI_DIRECTION.md section 2.1 replace the provisional palette; no component uses a hex color literal.
2. The specified fonts load with fallback stacks; the provisional font is removed.
3. Every section matches the component descriptions in section 2.1, in every supported language, at 360, 390, 768 and 1280 px, with no horizontal scroll.
4. Photos use optimized files (≥2× displayed size) with `alt` text in every language.
5. The logo file replaces the stand-in when provided; until then the stand-in is used.
6. Text meets WCAG AA contrast; restricted colors are used only as specified.
7. Existing unit and end-to-end tests stay green.

**Dependencies**
- <final logo, final photos, final copy — owner and date>
```
