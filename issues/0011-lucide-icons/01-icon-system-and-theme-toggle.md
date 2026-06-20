# Experiment 1: Lucide icon system and fixed-width theme toggle

## Description

Establish the Lucide icon system and apply it to its first and most important
consumer: the theme toggle. Two parts:

1. **Icon system** — use `lucide-static` (raw SVGs) plus a small `Icon.astro`
   wrapper that inlines a Lucide SVG with `currentColor`, a configurable size,
   and merged classes. This needs no Astro integration and is tree-shakeable
   (only icons that are imported get bundled), matching this site's
   no-integration style.

2. **Theme toggle redesign** — replace the single cycling, text-labeled button
   (which changes width as the label cycles `System`/`Light`/`Dark`) with a
   **fixed-width segmented control**: three equal-size icon buttons — sun
   (light), monitor (system), moon (dark) — with the active mode highlighted.
   This is inherently fixed width and shows all three icons at once. Interaction
   becomes direct-select (`setMode`) instead of cycle, preserving the existing
   `window.__theme` contract and the `themechange` sync.

Decision (resolved here): the **segmented 3-icon control** is chosen over a
fixed-width cycle button — it most directly satisfies "fixed width" and
"dark/light/system icons there," and is better UX (one click to any mode).

## Changes

- **`package.json`**: add `lucide-static` dependency (done: `^1.21.0`).
- **`src/components/Icon.astro`** (new): props `icon` (raw SVG string), `size`
  (default 20), optional `class`, optional `strokeWidth`. Strips the license
  comment, rewrites `width`/`height` to `size`, replaces the built-in
  `class="lucide …"` with the caller's class (icons keep `stroke="currentColor"`
  so Tailwind text-color utilities style them), and renders via `set:html`.
- **`src/components/ThemeToggle.astro`**: rebuild as a segmented control of three
  `[data-theme-option]` buttons using `Icon` with `sun` / `monitor` / `moon`.
  The client script highlights the active mode (`aria-pressed`, background/text
  classes), calls `window.__theme.setMode(...)` on click, and re-syncs on
  `themechange`.

## Verification

1. **Typecheck**: `pnpm run check` passes (0 errors), including the `?raw`
   imports and the `setMode` typing.
2. **Build**: `pnpm run build` succeeds.
3. **Toggle markup**: built HTML contains three theme-option buttons each with an
   inlined `<svg>` (sun/monitor/moon), inside one bordered group.
4. **Fixed width**: the three buttons are equal fixed sizes (`h-7 w-7`), so the
   control's width does not depend on the active mode.
5. **Icon system reusable**: `Icon.astro` renders an inlined SVG sized by `size`
   and colored by `currentColor` (verified via the toggle icons in the build
   output).

Pass = typecheck + build succeed and the built header shows a fixed-width
three-icon theme control.

## Result

**Pass.**

- `lucide-static@^1.21.0` added.
- `pnpm run check` → 0 errors / 0 warnings / 0 hints (incl. `?raw` imports and
  `setMode(ThemeMode)`).
- `pnpm run build` → 31 pages built.
- Built `dist/index.html` theme control: one `role="group"` with three
  `data-theme-option` buttons (`light` / `system` / `dark`), each containing an
  inlined `<svg width="16" height="16" stroke="currentColor">` (sun / monitor /
  moon). Buttons are uniform `h-7 w-7`, so the control's width is independent of
  the active mode.
- `Icon.astro` confirmed reusable: it inlines the raw Lucide SVG, rewrites
  `width`/`height` to `size`, and keeps `currentColor` so Tailwind text colors
  apply.

## Conclusion

The Lucide icon system is in place (`lucide-static` + `Icon.astro`,
no Astro integration, tree-shakeable per-import), and the theme toggle is now a
fixed-width segmented control showing sun / monitor / moon with the active mode
highlighted via the existing `window.__theme` contract. Ready to roll icons out
across the rest of the site (Experiment 2).
