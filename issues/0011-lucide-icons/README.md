+++
status = "open"
opened = "2026-06-20"
+++

# Lucide icons across the site and a fixed-width theme toggle

## Goal

Adopt [Lucide](https://lucide.dev) icons in the website and use them where
appropriate throughout. Specifically:

1. Introduce a reusable way to render Lucide icons in this Astro site.
2. Rework the theme toggle: make it **fixed width** (it currently jiggles as the
   text label cycles between `System` / `Light` / `Dark`) and give it
   **light / dark / system icons**.
3. Add Lucide icons elsewhere on the site where they aid scanning and meaning
   (header links, hero call-to-action buttons, feature cards, footer links,
   etc.).

## Background

The website (`ts/website`) is a plain Astro 6 + Tailwind v4 site with **no JSX
framework integration** (no React/Vue/Svelte) — components are `.astro` files.
So the React-style `lucide-react` package is not directly usable; an
Astro-native or static-SVG approach is needed.

Relevant current state:

- **`src/components/ThemeToggle.astro`** — a single button that cycles
  `system -> light -> dark` and shows the current mode as a **text label**
  inside `<span data-theme-label>`. Because the words differ in length, the
  button's width changes as you cycle. The theme state lives in the inline
  head script (`window.__theme` from `src/lib/theme.ts`), exposing
  `getMode()`, `setMode(mode)`, and `cycle()`, and firing a `themechange`
  event. `data-mode` on `<html>` already reflects the chosen mode.
- **`src/layouts/Layout.astro`** — header with a `/` home link (Logo + WebBuf),
  a `Docs` link, and `<ThemeToggle />`.
- **`src/pages/index.astro`** — hero with two buttons (`Read the docs`,
  `GitHub`); a `npm install` code block; three feature cards
  (Rust-powered, Synchronous loading, Typed buffers).
- **`src/components/Footer.astro`** — `GitHub` and `npm` links.
- **`src/layouts/DocsLayout.astro`** — sidebar nav with category headings and
  per-package links.

There is currently no icon system at all (the only imagery is the WebBuf logo
via `Logo.astro`).

## Analysis

### How to render Lucide in Astro

Candidate approaches (to be decided when the first experiment is designed):

- **`lucide-static`** — ships raw SVG strings/files. A tiny `Icon.astro` wrapper
  can inline the chosen SVG with `currentColor` so Tailwind text-color utilities
  style it. No new Astro integration, fully static, tree-shakeable to only the
  icons imported. **Leading candidate** given this site's no-integration style.
- **`astro-icon` + `@iconify-json/lucide`** — adds an Astro integration and
  pulls Lucide via Iconify. Ergonomic (`<Icon name="lucide:sun" />`) but adds an
  integration and an Iconify dependency.

Whatever is chosen, icons should inherit `currentColor` and accept a size/class
so they match surrounding text.

### Theme toggle redesign

Two viable shapes (resolve during experiment design):

- **Segmented 3-icon control** — three buttons (sun = light, monitor = system,
  moon = dark) in one fixed-width group, active one highlighted. Naturally fixed
  width and shows all three icons at once; changes interaction from cycle to
  direct-select (calls `setMode`). **Recommended.**
- **Fixed-width cycle button** — keep the single cycling button but give it a
  fixed width and swap the text for the current mode's icon (optionally icon +
  label), so it no longer resizes.

Both must keep the existing `window.__theme` contract and the `themechange`
sync, and remain accessible (labels / `aria-pressed`).

### Icon placement candidates (where appropriate)

- Theme toggle: `sun`, `moon`, `monitor` (light / dark / system).
- Header: `Docs` link, external GitHub.
- Hero buttons: `Read the docs` (e.g. `book-open` / `arrow-right`), GitHub.
- Feature cards: an icon per feature.
- Footer: GitHub / npm links, external-link affordance.

**Brand-icon caveat:** Lucide removed brand/social glyphs (e.g. a `github`
logo), so GitHub/npm links will need either a generic icon (e.g.
`external-link`), retained text, or a separate brand-icon source. To be decided
per placement.

## Proposed Solution

1. Pick the Lucide rendering approach and add a reusable `Icon` mechanism
   (leading candidate: `lucide-static` + a small `Icon.astro`).
2. Redesign `ThemeToggle.astro` to be fixed-width with light/dark/system icons
   (recommended: segmented 3-icon control), preserving the `window.__theme`
   contract and accessibility.
3. Roll icons out across the placements above where they genuinely help, keeping
   the design restrained and consistent.

Each of these becomes its own experiment, designed and committed in order per
the repo workflow.

## Experiments

- [Experiment 1: Lucide icon system and fixed-width theme toggle](01-icon-system-and-theme-toggle.md) — **Pass**
- [Experiment 2: Lucide icons across the site](02-icons-across-the-site.md) — **Designed**
