# ADR-003 — Language routing: `/es/` and `/en/` with browser detection

- Status: Proposed
- Date: 2026-10-09
- Decision owner: Raul Casañas
- Related specs: PROJECT_SPEC FR-001–FR-003, NFR-004; US-002

## Decision Request
How are the two languages served and chosen?

## Context
The owner wants a toggle, auto-detection (Spanish browsers → Spanish, anything else → English), and asked whether `/es` and `/en` help Google. They do: separate URLs with `hreflang` are the recommended way to get both languages indexed.

## Options Considered
- **A — Static pages per language with Astro i18n routing, client-side redirect on `/` (chosen).** Indexable, works on any static host, no server logic.
- B — One URL, client-side translation. Only one language indexed; flash of wrong language.
- C — Server-side `Accept-Language` redirect. Needs server config on each host; not possible on GitHub Pages.

## Decision
Option A. `/` is a tiny page: saved `localStorage.ds_lang` wins; else the first `navigator.languages` entry starting with `es` → `/es/`; else `/en/`. `<noscript>` offers both links. `x-default` hreflang points to `/`. The toggle stores `ds_lang` and links to the same anchor on the other page. Anchors use Spanish IDs on both pages.

## Consequences
- Positive: SEO for both languages; shareable language-specific links.
- Negative: a redirect hop on `/` (fast, static).

## Validation
Vitest for the detection function; Playwright with `es-CR` and `en-US` locales.

## Review Trigger
A third language; a server-side host where an HTTP redirect is preferable.
