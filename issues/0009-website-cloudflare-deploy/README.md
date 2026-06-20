+++
status = "open"
opened = "2026-06-20"
+++

# Deploy the website to Cloudflare Pages

## Goal

Deploy the Astro website at `ts/website` to Cloudflare Pages using the same
manual-CLI (`wrangler pages deploy`) workflow as the other sites in `~/dev`. The
site should go live at `https://webbuf.pages.dev`. The custom domain
`webbuf.com` is owned but **out of scope** for this issue — default `*.pages.dev`
URL only.

## Background

Issue `0008-astro-website` stood up the website at `ts/website` (Astro 6 +
Tailwind v4, TypeScript, dark/light/system theming, landing page + full API
docs, `sharp` image pipeline). Deployment was explicitly out of scope there;
this issue picks that up.

The website is a package (`@webbuf/website`) in the existing `ts/` pnpm
workspace (`packages: ['*']`). It builds a static site to `dist/` (already
gitignored). Its `astro.config.ts` does not set `output` explicitly (Astro
defaults to static, so the build is already static).

### Existing Cloudflare Pages sites in `~/dev` (the model to follow)

All three are Astro sites deployed to Cloudflare Pages via the same recipe:

| Repo               | Pages project | Config                                   |
| ------------------ | ------------- | ---------------------------------------- |
| `rxc/homepage`     | `rxc`         | `wrangler.toml` → `pages_build_output_dir = "dist"` |
| `nutorch/website`  | `nutorch`     | same                                     |
| `shannon/website`  | `shannon`     | same                                     |

The shared recipe:

1. A two-line `wrangler.toml`:
   ```toml
   name = "<project>"
   pages_build_output_dir = "dist"
   ```
2. `wrangler` as a local devDependency (shannon pins `^4.79.0`).
3. A `deploy` script: `build && wrangler pages deploy dist`.
4. Astro `output: "static"` (the others set it explicitly).

`shannon/website` is the closest match to `ts/website` — plain Astro + Tailwind
with a near-identical `astro.config`.

### What `ts/website` is missing vs. that pattern

- No `wrangler.toml`.
- No `wrangler` dependency (not installed locally or globally anywhere).
- No `deploy` script in `package.json`.
- `astro.config.ts` does not set `output: "static"` (cosmetic; Astro already
  builds static output).

## Decisions

Confirmed with the issue owner:

1. **Cloudflare Pages project name**: `webbuf` → live at `https://webbuf.pages.dev`.
2. **Deploy method**: manual CLI (`wrangler pages deploy`), matching the existing
   `rxc` / `nutorch` / `shannon` sites — **not** git-connected dashboard
   auto-deploy.
3. **Custom domain**: `webbuf.com` is out of scope for this issue.

## Proposed Solution

Mirror the shannon recipe in `ts/website`:

1. Add `ts/website/wrangler.toml` with `name = "webbuf"` and
   `pages_build_output_dir = "dist"`.
2. Add `wrangler` as a devDependency and run `pnpm install`.
3. Add a `deploy` script: `pnpm run build && wrangler pages deploy dist`.
4. (Optional, for convention) set `output: "static"` in `astro.config.ts`.
5. One-time Cloudflare auth + project creation by the issue owner:
   `wrangler login` (interactive, browser-based), then `pnpm run deploy` to
   create the `webbuf` Pages project and publish the first deploy.

## Experiments

- [Experiment 1: Wire wrangler config and deploy script](01-wire-wrangler-and-deploy.md) — **Pass** (live at https://webbuf.pages.dev)
