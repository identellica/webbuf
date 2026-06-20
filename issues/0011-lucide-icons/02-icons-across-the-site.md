# Experiment 2: Lucide icons across the site

## Description

Roll Lucide icons (via the `Icon.astro` system from Experiment 1) out to the
rest of the site where they aid scanning and meaning, kept restrained and
consistent. Icons inherit `currentColor`, so they pick up existing text/hover
colors automatically.

Placements and icon choices:

- **Header** (`Layout.astro`): `Docs` link → `book-open`.
- **Hero buttons** (`index.astro`): `Read the docs` → `book-open`; `GitHub` →
  `external-link`.
- **Feature cards** (`index.astro`): Rust-powered → `cpu`; Synchronous loading →
  `zap`; Typed buffers → `binary`.
- **Footer** (`Footer.astro`): both external links (`GitHub`, `npm`) → trailing
  `external-link`.

**Brand-icon note:** Lucide has no GitHub/npm brand glyphs (`github.svg` is
absent from `lucide-static`), so external links use the generic `external-link`
icon rather than a brand logo. Link text is retained in all cases.

## Changes

- **`src/layouts/Layout.astro`**: add `book-open` before the `Docs` link text.
- **`src/pages/index.astro`**: add icons to the two hero buttons; add an `icon`
  to each entry of the `features` array and render it above the card title.
- **`src/components/Footer.astro`**: append an `external-link` icon to each
  external link.

All via `import Icon from ".../Icon.astro"` plus per-icon
`import x from "lucide-static/icons/<name>.svg?raw"`.

## Verification

1. **Typecheck**: `pnpm run check` passes (0 errors).
2. **Build**: `pnpm run build` succeeds.
3. **Icons present**: built `dist/index.html` contains inlined `<svg>`s for the
   hero buttons, the three feature cards, and the header `Docs` link; built
   pages contain footer `external-link` svgs.
4. **No layout regressions**: hero buttons and feature cards still render with
   their text; icons sit inline with `currentColor`.

Pass = typecheck + build succeed and the home page shows icons on the header
link, hero buttons, and all three feature cards, with external-link icons in the
footer.
