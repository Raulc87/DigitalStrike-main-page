# Design patterns for proposals

Use this to pick directions (step 3) and to make each one look deliberate. It combines what landing-page and form research consistently reports with a catalog of treatments that suit service businesses, coaches, advisors, and small brands.

## Contents
1. What research consistently says (apply to every proposal)
2. Treatment catalog (pick 2)
3. Type pairings that work (Google Fonts)
4. Hero patterns
5. Section patterns, 5.1 Real-world references
6. Avoid list
7. Sources

---

## 1. What research consistently says

These come from usability research and measured tests (sources at the end). Apply them to every direction; they are not style choices.

**Trust (NN/g, stable across cultures and decades): four factors decide whether a site seems trustworthy**
1. *Design quality:* organized content, clear labels, and a color scheme that matches the kind of service. Colors alone brand a business as corporate, budget, or luxury. Typos and broken details visibly cost credibility.
2. *Up-front disclosure:* contact info easy to find, what happens next, what it costs or that the first call is free. Asking for personal data before giving any value breaks trust.
3. *Comprehensive, current content:* show the real person and the process, not just end results; cover every audience the service claims.
4. *Connection to the rest of the web:* people trust external reviews and profiles more than on-site testimonials. Link to real external presence (LinkedIn, Google reviews, media) when it exists.

**Hero and scanning**
- Content above the fold gets far more attention (NN/g: ~84% more). Put headline, one supporting line, the primary CTA, and a trust cue there.
- Plain, benefit-stating headlines outperform clever ones.
- People scan in an F-pattern (NN/g eyetracking, desktop and mobile): front-load headings and the first words of lines, keep text left-aligned, and use clear subheadings.

**CTA**
- One action, same wording, repeated: hero, mid-page after the value is explained, and at the end.
- Action wording ("Book my call") beats vague wording ("Learn more", "Submit"). On mobile, a CTA the visitor doesn't have to scroll back for helps.

**Forms (Baymard, CXL)**
- Remove every field the spec doesn't need; each one adds friction (CXL reports Expedia gained about $12M/year in profit after removing the "Company" field from its booking form). Prefer one "full name" field over first/last split.
- Single column: in CXL's test (~700 participants), a single-column form was completed 15.4 seconds faster than a multi-column one.
- Labels always visible **above** fields. Placeholder-only labels failed in every Baymard usability test: they vanish while typing, and users deleted input just to reread them after an error. Placeholders are fine for format examples (e.g. `+50684104791`).
- Radio buttons beat dropdowns and multi-selects for short option lists (faster to complete).
- Validate inline after the user leaves a field, never while they are still typing; clear the error as soon as it's fixed.
- About 29% of people hesitate over data security on forms (Landingi): put the privacy/consent note and a short reassurance next to the submit button.
- Say what happens after submitting (e.g. "you'll pick a time in the calendar").

**Speed and accessibility**
- Each extra second of load time measurably lowers conversions: keep proposals light (2 font families max, optimized images, no heavy animation libraries).
- Text contrast ≥4.5:1 (≥3:1 for large text ≥24px or bold ≥18.5px); UI boundaries ≥3:1. Bright accents (yellow, gold, lime, light cyan) are fills and highlights, not text on white; add a darker text-safe variant.

**Trends vs. fit**
- 2026 trend reports push saturated color, maximalism, kinetic type, and 3D. Those suit lifestyle and entertainment brands. For finance, health, legal, and coaching, restraint is the deliberate, research-backed choice: borrow at most one current element (e.g. oversized editorial type, a modular grid) per direction.

## 2. Treatment catalog

Each is a direction, not a template: adapt it to the client's colors and material.

### Institutional (light corporate)
- **Feel:** serious, established, consultancy-grade.
- **Palette logic:** cool off-white page; brand's darkest color as the structural color (headings, buttons, a few full-bleed bands); accent used sparingly (rules, one motif).
- **Type:** refined serif display + neutral humanist sans body.
- **Layout:** split hero (copy panel | brand-color panel with portrait), bordered grids, thin rules, 0–4px radius.
- **Fits:** advisors, lawyers, B2B, clients who want "more serious".

### Editorial (brand-color field)
- **Feel:** confident, magazine-like, closest to presentation decks.
- **Palette logic:** the brand color as the page background; white cards; accent for large shapes and italic emphasis.
- **Type:** high-contrast or classic serif with italics for emphasis + geometric sans.
- **Layout:** big type, large geometric motifs bleeding off edges, alternating full-bleed bands.
- **Fits:** clients whose existing material is already bold and colored; personal brands.

### Warm human
- **Feel:** approachable, personal, calm.
- **Palette logic:** warm light neutrals (sand, cream) with the brand color softened; photography does the work.
- **Type:** soft serif or rounded sans display + friendly sans body.
- **Layout:** large photo moments, rounded (8–16px) cards, generous spacing, quote-led sections.
- **Fits:** coaches, therapists, wellness, education.

### Modern minimal / modular
- **Feel:** crisp, current, product-like.
- **Palette logic:** near-white or near-black base, one saturated accent, grey scale doing most of the work.
- **Type:** grotesk/geometric sans for everything, maybe a mono for small labels.
- **Layout:** modular (bento-style) grids for benefits and steps, oversized headline, lots of alignment discipline.
- **Fits:** tech-adjacent services, young audiences, clients with little brand material.

### Bold brand
- **Feel:** energetic, memorable.
- **Palette logic:** two brand colors at full strength in large blocks, strong contrast.
- **Type:** heavy display face used large; simple sans body.
- **Layout:** color-blocked sections, big numbers or statements, strong CTA color.
- **Fits:** events, launches, consumer brands. Usually wrong for finance/health unless the brand already is bold.

Default pairing rule: A = the treatment closest to the client's material; B = the nearest *different* treatment that suits the audience (e.g. Editorial → Institutional; Warm human → Modern minimal).

## 3. Type pairings that work (Google Fonts)

| Character | Display | Body |
|---|---|---|
| Classic, trustworthy | Crimson Pro / Source Serif 4 | IBM Plex Sans / Source Sans 3 |
| Elegant, editorial | Cormorant Garamond / Playfair Display | Outfit / Karla |
| Premium advisory (seen on navy + gold advisor sites) | Cormorant Garamond / Source Serif 4 | Montserrat |
| Warm, contemporary | Fraunces | Work Sans / DM Sans |
| Modern, neutral | Manrope / Plus Jakarta Sans | same family |
| Crisp, technical | Space Grotesk (sparingly) | IBM Plex Sans + IBM Plex Mono for labels |

If the client's material uses an identifiable face (or a close cousin), prefer it or its closest Google Font in direction A. Load at most 2 families (+1 for a logo stand-in), only the weights used.

## 4. Hero patterns

- **Split:** copy left, image/brand panel right. Best default for a personal-service page with a portrait. Stacks copy-first on mobile.
- **Centered statement:** big headline, one line, CTA, image below. Good when there's no strong photo.
- **Full-bleed photo with overlay:** strong only with an excellent, high-res photo; check text contrast over the image.
- **Statement + proof strip:** headline and CTA, then a thin row of credentials or logos. Use only with real proof.

Headline: 6–12 words, one idea. Emphasis on part of it (italic/color) is enough decoration.

## 5. Section patterns

- **Problem/recognition:** two-column (short title | 2 paragraphs) or a single calm statement band. Hopeful, not fearful.
- **Process/steps:** real sequences only get numbers. 3 columns on desktop, stacked on mobile; one line of text each.
- **Guide/about:** portrait + short bio + credential chips.
- **Proof:** one featured testimonial larger than the rest, or a 3-card row. Placeholders until real.
- **Offer:** a contrasting band (brand color) that states what the call/offer includes, 3 check points, CTA.
- **Form:** context column (what happens next) + form card. Success state replaces the form in place.
- **Closing:** one sentence restating the invitation + CTA.
- **Footer:** contact, privacy link, language switch if multilingual.

Rhythm: alternate background tones between adjacent sections (page / white / brand) so sections read as distinct without heavy dividers.

## 5.1 Real-world references

Observed on live sites in curated 2026 collections of financial-advisor, coaching, and personal-brand sites. Use them to calibrate a treatment, never to copy.

**Financial advisory**
- *Navy + gold is the recurring "trust" palette* (Financial Synergies, Bush Wealth, Matthew James, Wealthspire). The premium versions pair a classic serif with a clean sans: Matthew James uses Cormorant Garamond + Montserrat; Wealthspire uses Publico + Montserrat with blue, dark blue, and gold.
- *Dark, atmospheric* navy sites (Avivar, Melton & Company, Illumint) read bold and exclusive; they work when paired with warm cream or brown accents and strong photography.
- *Warm and approachable* alternatives: Stash Wealth (rust/orange on white, lifestyle photos, for young professionals); Creative Planning (teal/navy with cream, team-first "Your Team Awaits"); Bragg (muted green/gray, nature photography, Lora + Roboto).
- *Structure devices that earn trust:* a three-step process (Bull Moose), numbered service cards and a "by the numbers" band (Coyle; real figures only), credentials displayed prominently (Peak Asset), transparent fees (Timothy Financial Counsel), booking embedded in the page (Bayntree, with Calendly).
- The standouts show the people: team photos and the founder up front.

**Coaching and personal brands**
- The effective one-page sequence (Nora DeKeyser): smiling real photo in the hero → media mentions → services → who she is → client feedback.
- Elegant premium coaching (Matthew Kimberley): dark imagery, elegant fonts, gold accents, testimonials from recognizable people.
- Simplicity wins (Kelly Keelan, Aaron Ward): hero = title, one line, CTA, portrait; no sections nobody would read.
- Alternate section background colors to pace a long one-pager (Alice Thorpe); put authority logos right after the hero *only if they are real* (Nesha Woolery).

## 6. Avoid list

These make proposals look generic or AI-made, or break SDD rules:

- The skill author's or any tool's default brand; purple-to-blue gradient heroes; neon accent on near-black unless the brand is that.
- Inter/Roboto/Arial as the only face; emoji as icons; every card with the same big radius and shadow; everything centered.
- Glow orbs, grain, parallax, and scroll-animation libraries by default. Add effects only when the treatment calls for it; they cost load time.
- Stock "handshake/laptop/cash pile" imagery; 3D money illustrations for finance (reads as hype).
- Invented testimonials, logos, stats, prices, badges, or "as seen in" strips.
- Lorem ipsum, or copy rewritten "to fit the design": change the design, not the approved copy.

## 7. Sources

Research reviewed September 2026. This file summarizes and paraphrases these sources in our own words for design guidance; each quoted figure names the organization it comes from (all listed below), and named sites are cited as publicly visible examples, not endorsements. No third-party text is reproduced beyond these short attributed facts. Follow the links for the originals.

- NN/g, "Trustworthiness in Web Design: 4 Credibility Factors": https://www.nngroup.com/articles/trustworthy-design/
- NN/g, "F-Shaped Pattern of Reading on the Web": https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Baymard, "Mobile Form Usability: Never Use Inline Labels": https://baymard.com/blog/mobile-forms-avoid-inline-labels
- Baymard, "Form Design": https://baymard.com/blog/form-design
- CXL, "Form Design Best Practices": https://cxl.com/blog/form-design-best-practices/
- Landingi, "Landing Page Best Practices": https://landingi.com/landing-page/41-best-practices/
- FMG, "Financial Advisor Landing Page Examples and Best Practices": https://fmgsuite.com/insights/financial-advisor-landing-page-examples-and-best-practices/
- Colorlib, "30 Best Financial Advisor Website Examples 2026": https://colorlib.com/wp/financial-advisor-website-examples/
- Colorlib, "Personal Brand Websites": https://colorlib.com/wp/personal-brands/
- Really Good Designs, "Coaching Website Design Examples": https://reallygooddesigns.com/coaching-website-design-examples/
- Figma, "Web Design Trends 2026": https://www.figma.com/resource-library/web-design-trends/

