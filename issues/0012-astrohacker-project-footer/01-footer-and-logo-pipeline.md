# Experiment 1: Astrohacker logo pipeline and footer link

## Description

Add the Astrohacker logo to webbuf's image pipeline and render an "An Astrohacker
Project" link in the footer, matching termsurf's branding while keeping webbuf's
existing footer content and conventions.

## Changes

- **`assets/astrohacker-6-light.png`, `assets/astrohacker-6-dark.png`** (new):
  copied from `~/dev/ah/website/assets/astrohacker-6-{light,dark}.png`
  (700×700, transparent) — the same logo family termsurf ships.
- **`scripts/process-images.ts`**:
  - Make `Variant.favicon` optional; only emit a favicon when it is set.
  - Add two variants: `astrohacker-6-light` and `astrohacker-6-dark` (no
    favicon).
  - Re-run to emit `astrohacker-6-{light,dark}-{32..400}.webp` into
    `public/images/` and regenerate `src/lib/images.ts`.
- **`src/components/Footer.astro`**: add an "An Astrohacker Project" link to
  https://astrohacker.com, using webbuf's light/dark dual-`<img>` approach
  (`block dark:hidden` / `hidden dark:block`) at 20px display from the 64px
  source (≈ 3.2×, satisfying issue 0010's retina rule). Keep the existing
  copyright and GitHub / npm nav.

## Verification

1. **Pipeline**: `pnpm run build:images` emits the astrohacker WebP files and
   regenerates `images.ts`; the WebBuf favicons are still produced and no
   astrohacker favicon is created.
2. **Typecheck**: `pnpm run check` passes (the footer's `siteImage(...)` paths
   resolve against the regenerated `SiteImage` union).
3. **Build**: `pnpm run build` succeeds.
4. **Footer markup**: built pages contain the "An Astrohacker Project" link to
   astrohacker.com with light + dark `astrohacker-6-*-64.webp` `<img>`s at
   `width="20"`.
5. **No favicon regression**: `dist/favicon-light.png` / `favicon-dark.png` still
   exist; no `astrohacker` favicon.

Pass = pipeline + typecheck + build succeed and every page's footer shows the
"An Astrohacker Project" logo link.

## Result

**Pass.**

- Source PNGs added to `assets/` (`astrohacker-6-{light,dark}.png`, 700×700).
- `process-images.ts`: `Variant.favicon` made optional; two astrohacker variants
  added with no favicon. `pnpm run build:images` emitted 16 astrohacker WebP
  files (`astrohacker-6-{light,dark}-{32..400}.webp`) and regenerated
  `src/lib/images.ts`; the two WebBuf favicons were still produced and **no**
  astrohacker favicon was created.
- `pnpm run check` → 0 errors / 0 warnings / 0 hints (footer `siteImage(...)`
  paths resolve against the regenerated union).
- `pnpm run build` → 31 pages built.
- Built `dist/index.html` footer contains the "An Astrohacker Project" link to
  https://astrohacker.com with light + dark `astrohacker-6-*-64.webp` `<img>`s at
  `width="20"`; `dist/favicon-{light,dark}.png` still present, no astrohacker
  favicon, 16 astrohacker webp in `dist/images/`.

## Conclusion

webbuf's footer now carries the "An Astrohacker Project" branding (logo link to
astrohacker.com) like termsurf, while keeping its own copyright and GitHub / npm
links. The Astrohacker logo is integrated into webbuf's standard image pipeline
(source PNG → WebP → typed `siteImage`), with `favicon` made optional so only the
WebBuf logos produce favicons. Goal of issue 0012 met.
