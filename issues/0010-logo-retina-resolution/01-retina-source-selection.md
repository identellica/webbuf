# Experiment 1: Select logo source at >= 3x rendered size

## Description

Change `Logo.astro` to pick its WebP source resolution dynamically instead of
hardcoding 64px: the smallest emitted size that is at least `3 × size`, falling
back to the largest available (400). The rendered `width`/`height` stay at
`size`, so layout is unchanged — only the source bitmap gets denser, fixing
retina blur.

## Changes

- **`src/components/Logo.astro`**:
  - Import the `SiteImage` type alongside `siteImage`.
  - Add the source-size list (mirrors `WEBP_SIZES` in `scripts/process-images.ts`).
  - Compute `res = smallest size >= size * 3, else 400`.
  - Build the light/dark `src` paths from `res`.

No changes to the image pipeline or generated `images.ts` — the needed sizes
(96, 300) already exist.

## Verification

1. **Typecheck**: `pnpm --filter @webbuf/website run check` passes.
2. **Build**: `pnpm --filter @webbuf/website run build` succeeds.
3. **Home page uses the 300px source**: the built `dist/index.html` references
   `webbuf-2-light-300.webp` / `webbuf-2-dark-300.webp` for the `size={72}` logo
   (≥ 3 × 72 = 216).
4. **Header uses the 96px source**: built pages reference
   `webbuf-2-*-96.webp` for the `size={28}` header logo (≥ 3 × 28 = 84).
5. **Displayed size unchanged**: the `<img>` still has `width="72"`/`height="72"`
   (home) and `28` (header).

Pass = typecheck + build succeed and the home logo references the 300px source at
72px display size.

## Result

**Pass.**

- `pnpm run check` → 0 errors, 0 warnings, 0 hints.
- `pnpm run build` → 31 pages built successfully.
- Built `dist/index.html` home logo:
  `webbuf-2-light-300.webp` / `webbuf-2-dark-300.webp` at `width="72" height="72"`
  (300 / 72 ≈ 4.2×).
- Built header logo (home and docs pages):
  `webbuf-2-*-96.webp` at `width="28" height="28"` (96 / 28 ≈ 3.4×).
- Displayed dimensions unchanged; only the source bitmap density increased.
- Redeployed to Cloudflare Pages (`wrangler pages deploy dist`); the fix is live
  at https://webbuf.pages.dev.

## Conclusion

`Logo.astro` now selects a WebP source at least 3× the rendered size (smallest
emitted size `>= size * 3`, capped at 400). The home-page logo jumped from a 64px
source (upscaled at 72px) to a 300px source, and the header from 64px to 96px —
both now crisp on retina. No image-pipeline changes were needed; the required
sizes already existed.
