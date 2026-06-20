# Experiment 1: Raise the --muted token to WCAG AA

## Description

Raise webbuf's `--muted` color token in both themes so body/secondary prose
meets WCAG AA (≥ 4.5:1), matching the readability of `~/dev/ah`. A single token
change fixes every `text-muted` usage at once, with no per-element churn, and the
new values stay visibly dimmer than `--fg` to preserve hierarchy.

## Changes

- **`src/styles/global.css`**:
  - Light mode `--muted`: `#6172b0` → `#515b85` (3.57:1 → 5.10:1 on `#e1e2e7`).
  - Dark mode `--muted`: `#565f89` → `#a9b1d6` (2.76:1 → 8.10:1 on `#1a1b26`).

No other files change; all ~18 `text-muted` usages inherit the new contrast.

## Verification

1. **Contrast**: both new values compute to ≥ 4.5:1 against their theme
   background, and remain below `--fg` (10.6:1 dark / 9.6:1 light) so headings
   still read as primary.
2. **Build**: `pnpm run build` succeeds; built CSS contains the new
   `--muted` values and not the old ones.
3. **Typecheck**: `pnpm run check` passes (no TS impact, but confirms the site
   still compiles).

Pass = new `--muted` values present in the build and both compute ≥ 4.5:1.
