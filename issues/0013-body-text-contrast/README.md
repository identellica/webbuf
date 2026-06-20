+++
status = "closed"
opened = "2026-06-20"
closed = "2026-06-20"
+++

# Body text contrast too low (harder to read than astrohacker)

## Goal

Make the website's running/secondary text comfortably readable — at least WCAG
AA (4.5:1) — in both light and dark modes, matching the readability of the
sibling `~/dev/ah` (astrohacker) site, without flattening the visual hierarchy
between body text and headings.

## Background

Both sites use the **same** Tokyo Night (dark) / Tokyo Night Day (light)
palettes, the same background, and the same main foreground — so headings and
primary text are equally crisp (~10:1). The difference is the **token used for
body/secondary prose**.

webbuf has a single dim token, `--muted`, set to Tokyo Night's *comment* color
(`#565f89` dark / `#6172b0` light) — meant for de-emphasized code comments, not
reading text — and uses it for nearly all secondary prose (hero subtitle, every
feature-card body, all docs paragraphs and summaries, footer, sidebar: ~18
usages).

`~/dev/ah` instead renders body/secondary text in a separate, higher-contrast
token (`foreground-dark`, `#a9b1d6` in dark mode) and reserves the low-contrast
`muted` for truly minor chrome.

Measured contrast (WCAG; AA needs 4.5:1 normal text):

| Text role | webbuf `--muted` | ah secondary |
| --- | --- | --- |
| Body prose, **dark** (`#1a1b26`) | `#565f89` → **2.76:1** (fails) | `#a9b1d6` → 8.10:1 |
| Body prose, **light** (`#e1e2e7`) | `#6172b0` → **3.57:1** (fails) | `#6172b0` → 3.57:1 |
| Main text (both) | `#c0caf5` / `#2b3254` → ~10:1 | same |

Dark mode is the worst: 2.76:1 fails AA *and* the relaxed large-text threshold
(3:1). Light mode (3.57:1) fails AA for normal text.

## Proposed Solution

Raise the `--muted` token in both themes to pass WCAG AA for normal text, kept
visibly dimmer than `--fg` so the hierarchy survives. This is a single
CSS-token change in `src/styles/global.css` — every existing `text-muted` usage
inherits the fix, no per-element class churn.

Chosen values (verified):

- **dark**: `#565f89` → `#a9b1d6` (2.76:1 → **8.10:1**; Tokyo Night `fg_dark`,
  matching ah; main `--fg` `#c0caf5` stays brighter at 10.6:1).
- **light**: `#6172b0` → `#515b85` (3.57:1 → **5.10:1**; a darkened Tokyo Night
  Day secondary; main `--fg` `#2b3254` stays at 9.6:1).

A separate dimmer token for genuinely minor labels (uppercase category headers,
the `kind` badge) was considered but deemed unnecessary: those are small/bold and
read fine at the new contrast, and a single-token bump is lower-risk.

This becomes one experiment, designed and committed per the repo workflow.

## Experiments

- [Experiment 1: Raise the --muted token to WCAG AA](01-raise-muted-contrast.md) — **Pass**

## Conclusion

Body-text readability is fixed and live at https://webbuf.pages.dev.

The cause was a single token: webbuf rendered nearly all secondary prose in
`--muted`, which was set to Tokyo Night's *comment* color — fine for code
comments, far too dim for reading text (2.76:1 in dark mode, failing even the
large-text threshold; 3.57:1 in light). `~/dev/ah` avoids this by using a
brighter token for body text and reserving the dim one for minor chrome.

Fix: raise `--muted` in both themes in `src/styles/global.css`, keeping it below
`--fg` so the heading/body hierarchy survives:

- dark: `#565f89` → `#a9b1d6` (2.76:1 → **8.10:1**, Tokyo Night `fg_dark`,
  matching ah)
- light: `#6172b0` → `#515b85` (3.57:1 → **5.10:1**)

Key decision: a one-token bump rather than introducing a second token and
rewriting per-element classes. webbuf's `--muted` is almost entirely body prose,
so a single change fixed all ~18 usages with minimal risk; the few decorative
labels (uppercase category headers, the `kind` badge) read fine at the higher
contrast.
