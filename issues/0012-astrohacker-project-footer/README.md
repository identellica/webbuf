+++
status = "open"
opened = "2026-06-20"
+++

# "An Astrohacker Project" footer branding

## Goal

Add an "An Astrohacker Project" element to the website footer — an
Astrohacker-logo link to https://astrohacker.com — matching the style used in the
sibling `~/dev/termsurf` site, while keeping webbuf's existing footer content
(GitHub / npm links and copyright).

## Background

`~/dev/termsurf/website/src/components/Footer.astro` renders a centered
Astrohacker-logo link reading "An Astrohacker Project" (pointing at
astrohacker.com) above its copyright line, using a `<picture>` with 1x/2x WebP
variants of the `astrohacker-6` logo:

```astro
<a href="https://astrohacker.com" class="flex items-center gap-2 hover:text-accent">
  <picture> ...astrohacker-6-{light,dark}-{32,64}.webp... </picture>
  An Astrohacker Project
</a>
```

webbuf's current footer (`ts/website/src/components/Footer.astro`) has a
copyright line (`© {year} Astrohacker. MIT licensed.`) and a GitHub / npm nav,
but no Astrohacker-project branding and no Astrohacker logo asset.

### Assets and conventions

- webbuf has **no** Astrohacker logo assets. The `astrohacker-6` source PNGs
  exist elsewhere in `~/dev` (e.g. `ah/website/assets/astrohacker-6-light.png`
  and `-dark.png`, 700×700, transparent) — the same family termsurf ships.
- webbuf's image convention (from issue 0008): source PNGs live in repo-root
  `assets/`, `scripts/process-images.ts` emits WebP at sizes
  `[32, 64, 96, 128, 180, 200, 300, 400]` plus favicons, and generates the typed
  `src/lib/images.ts` `SiteImage` union consumed via `siteImage(...)`.
- webbuf's `Logo.astro` renders light/dark variants with two `<img>` elements
  (`block dark:hidden` / `hidden dark:block`) and follows the retina rule from
  issue 0010 (source ≥ 3× the rendered size).

## Proposed Solution

1. Add `astrohacker-6-light.png` / `astrohacker-6-dark.png` to `assets/`.
2. Extend `scripts/process-images.ts` to also process the Astrohacker logos
   (making the per-variant `favicon` optional so only the WebBuf logos produce
   favicons), and regenerate the WebP files and `images.ts`.
3. Add the "An Astrohacker Project" link to `Footer.astro` using the generated,
   typed image paths and webbuf's light/dark dual-`<img>` approach at a
   retina-safe source size (20px display ← 64px source, ≈ 3.2×).

This becomes one experiment, designed and committed per the repo workflow.

## Experiments

- [Experiment 1: Astrohacker logo pipeline and footer link](01-footer-and-logo-pipeline.md) — **Designed**
