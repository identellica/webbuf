# WebBuf

Public source for the webbuf and @webbuf npm libraries and webbuf.com.

Libraries: code/webbuf/ts/<name>. Rust/WASM: code/webbuf/rs/<name>.
The unscoped webbuf package lives in ts/umbrella.

From this checkout, using Nushell:

```nu
bun install --frozen-lockfile
bun run build:webbuf
bun run typecheck:webbuf
bun run test:webbuf
bun run build:wbcom
```

To rebuild WASM, enter each Rust crate and run its existing
`zsh -f -e wasm-pack-bundler.zsh`, then run `bun run sync:from-rust`
and `bun run build` in its matching TS package. The toolchain must have
the wasm32-unknown-unknown target. Package imports stay synchronous.

Publishing and website deployment are operated from Astrohacker; this
checkout contains no publishing credentials or production infrastructure.