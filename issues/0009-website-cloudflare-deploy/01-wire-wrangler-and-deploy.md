# Experiment 1: Wire wrangler config and deploy script

## Description

Wire `ts/website` for Cloudflare Pages deployment, mirroring the
`shannon/website` recipe (the closest existing model — plain Astro + Tailwind).
After this experiment the site builds to `dist/` and a single `pnpm run deploy`
both builds and publishes to the `webbuf` Pages project at
`https://webbuf.pages.dev`.

The Cloudflare-account steps (`wrangler login` and the very first deploy that
creates the project) are interactive and browser-based, so they are run by the
issue owner. This experiment covers all the in-repo wiring and verifies the
build locally; the live deploy is the verification's final, owner-run step.

## Changes

- **`ts/website/wrangler.toml`** (new):
  ```toml
  name = "webbuf"
  pages_build_output_dir = "dist"
  ```
- **`ts/website/package.json`**:
  - Add `"wrangler": "^4.79.0"` to `devDependencies` (matches shannon's pin).
  - Add `"deploy": "pnpm run build && wrangler pages deploy dist"` to `scripts`.
- **`ts/website/astro.config.ts`**: add `output: "static"` for convention
  (consistent with rxc / nutorch / shannon). Cosmetic — Astro already builds
  static output.
- Run `pnpm install` (from `ts/`) so `wrangler` is available locally.

## Verification

1. **Install resolves**: `pnpm install` from `ts/` succeeds and
   `ts/node_modules/.bin/wrangler` exists.
2. **Build succeeds**: `pnpm --filter @webbuf/website run build` produces a
   populated `ts/website/dist/` (at minimum `index.html` and the docs pages).
3. **wrangler reads config**: `pnpm --filter @webbuf/website exec wrangler pages project list` (or a `--help` on the deploy command) runs without a config error — confirms `wrangler.toml` parses.
4. **Live deploy (owner-run, interactive)**:
   - `cd ts/website && pnpm exec wrangler login` (browser auth).
   - `pnpm run deploy` — wrangler creates the `webbuf` Pages project on first
     run and uploads `dist/`.
   - **Pass criteria**: deploy completes and `https://webbuf.pages.dev` serves
     the site.

Pass = steps 1–3 verified in-repo and the owner-run deploy (step 4) serves the
site. Partial = in-repo wiring verified but the live deploy not yet run.

## Result

**Pass.**

- `pnpm install` (from `ts/`) resolved; `wrangler@4.103.0` installed at
  `ts/website/node_modules/.bin/wrangler` (satisfies `^4.79.0`).
- `pnpm --filter @webbuf/website run build` produced `ts/website/dist/` with 31
  pages (`index.html`, `docs/`, `_astro/`, images, favicons).
- `wrangler` was already authenticated to the Cloudflare account and parsed
  `wrangler.toml` (`wrangler pages project list` succeeded).
- The Pages project did not exist, so it was created explicitly:
  `wrangler pages project create webbuf --production-branch main`.
- `wrangler pages deploy dist --commit-dirty=true` uploaded 50 files and
  completed.
- **Live verification**: `https://webbuf.pages.dev` returns `HTTP 200` and serves
  `<title>WebBuf</title>`.

Note vs. plan: the first deploy needed an explicit
`wrangler pages project create` — `wrangler pages deploy` does not auto-create a
missing project (it errors `Project not found [code: 8000007]`). The standing
`deploy` script (`pnpm run build && wrangler pages deploy dist`) is correct for
all subsequent deploys now that the project exists.

## Conclusion

`ts/website` is wired for Cloudflare Pages and live at
`https://webbuf.pages.dev`. The deploy workflow matches the sibling sites
(`rxc` / `nutorch` / `shannon`): build to `dist/`, `wrangler pages deploy`.
Re-deploy any time with `pnpm --filter @webbuf/website run deploy`.
