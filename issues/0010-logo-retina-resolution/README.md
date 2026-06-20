+++
status = "open"
opened = "2026-06-20"
+++

# Home-page logo is blurry on retina

## Goal

Make the WebBuf logo render crisply on retina (high-DPR) displays. The logo must
be sourced from an image at least **3× the rendered pixel size along each
dimension** so it stays sharp at 2×–3× device pixel ratios.

## Background

`src/components/Logo.astro` always loads the **64px** WebP source regardless of
the `size` prop:

```astro
src={siteImage("/images/webbuf-2-light-64.webp")}
width={size}
height={size}
```

The home page (`src/pages/index.astro`) renders the logo at `size={72}`, so the
64px source is actually **upscaled** even at 1× DPR, and badly under-resolved at
2× retina (which needs 144 physical px, or 216 for a 3× margin). Result: a
blurry logo. The header (`Layout.astro`) renders at `size={28}`, also from the
same 64px source (~2.3× — acceptable but not generous).

`scripts/process-images.ts` already emits WebP sources at sizes
`[32, 64, 96, 128, 180, 200, 300, 400]` for both light and dark variants, and
the source PNGs are 1000×1000, so higher-resolution sources are already
available — no new image generation is required.

## Proposed Solution

Make `Logo.astro` choose its source resolution dynamically: the smallest emitted
size `>= 3 × size`, falling back to the largest available (400). This keeps the
displayed dimensions at `size` while supplying retina-grade pixels:

- home page `size={72}` → `72 × 3 = 216` → **300px** source (~4.2×)
- header `size={28}` → `28 × 3 = 84` → **96px** source (~3.4×)

The fix lives entirely in the component; the existing image pipeline already
produces the needed sizes.

## Experiments

- [Experiment 1: Select logo source at >= 3x rendered size](01-retina-source-selection.md) — **Designed**
