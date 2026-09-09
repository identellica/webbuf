import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { allApi } from "../../src/data/api";
import { PACKAGES } from "../../src/data/packages";
import ts from "typescript";
import { renderSignatures } from "../../scripts/extract-api";

const libraries = resolve(import.meta.dir, "../../..");

describe("generated API catalog", () => {
  test("two fresh extractions reproduce the checked-in catalog without writes", () => {
    const root = resolve(import.meta.dir, "../..");
    const file = resolve(root, "src/data/api.generated.json");
    const before = readFileSync(file, "utf8");
    for (let i = 0; i < 2; i++) {
      const result = Bun.spawnSync(
        [
          process.execPath,
          "--no-env-file",
          "scripts/extract-api.ts",
          "--check",
        ],
        {
          cwd: root,
          env: { PATH: process.env.PATH ?? "/usr/bin:/bin" },
          timeout: 20_000,
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      if (result.exitCode !== 0) throw new Error(result.stderr.toString());
      expect(result.exitCode).toBe(0);
      expect(readFileSync(file, "utf8")).toBe(before);
    }
  }, 45_000);

  test("extractor excludes private/protected members and preserves readonly/getters", () => {
    const file = resolve(libraries, "webbuf/src/docs-fixture.ts");
    const source = ts.createSourceFile(
      file,
      `export class Example {
      private secret = 1; protected hidden = 2; #internal = 3;
      readonly bytes = new Uint8Array(2); label?: string;
      get size(): number { return 2; }
      get mutable(): number { return 1; } set mutable(value: number) { void value; }
      method(): string { return "ok"; }
    }`,
      ts.ScriptTarget.ESNext,
      true,
    );
    const host = ts.createCompilerHost({});
    const read = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...args) =>
      name === file ? source : read(name, ...args);
    const program = ts.createProgram(
      [file],
      { target: ts.ScriptTarget.ESNext },
      host,
    );
    const checker = program.getTypeChecker();
    const symbol = checker.getSymbolAtLocation(source);
    if (!symbol) throw new Error("Missing fixture module");
    const example = checker.getExportsOfModule(symbol)[0];
    if (!example) throw new Error("Missing fixture class");
    const signatures = renderSignatures(checker, example, source, "class");
    expect(signatures).toContain("readonly size: number");
    expect(signatures).toContain("mutable: number");
    expect(signatures).toContain("label?: string");
    expect(signatures.some((line) => line.startsWith("readonly bytes:"))).toBe(
      true,
    );
    expect(signatures).toContain("method(): string");
    expect(signatures.some((line) => /secret|hidden|internal/.test(line))).toBe(
      false,
    );
  });

  test("contains exactly all 29 public workspace libraries and package pages", () => {
    const names = readdirSync(libraries)
      .flatMap((dir) => {
        const path = resolve(libraries, dir, "package.json");
        if (!existsSync(path)) return [];
        const pkg = JSON.parse(readFileSync(path, "utf8"));
        return !pkg.private &&
          (pkg.name === "webbuf" || pkg.name.startsWith("@webbuf/"))
          ? [pkg.name as string]
          : [];
      })
      .sort();
    expect(names.length).toBe(29);
    expect(Object.keys(allApi).sort()).toEqual(names);
    expect(PACKAGES.map((pkg) => pkg.npm).sort()).toEqual(names);
  });

  test("rw documents all five typed LE reader and writer pairs", () => {
    const rw = allApi["@webbuf/rw"];
    if (!rw) throw new Error("Missing rw API");
    const reader = rw.exports.find(
      (entry) => entry.name === "BufReader",
    )?.signatures;
    const writer = rw.exports.find(
      (entry) => entry.name === "BufWriter",
    )?.signatures;
    for (const bits of [16, 32, 64, 128, 256]) {
      expect(reader).toContain(`readU${bits}LE(): U${bits}LE`);
      // The existing extractor resolves polymorphic `this` to the class name.
      expect(writer).toContain(`writeU${bits}LE(value: U${bits}LE): BufWriter`);
    }
  });

  test("core exposes composition, a single constructor and public iterator", () => {
    const core = allApi["@webbuf/webbuf"];
    if (!core) throw new Error("Missing core API");
    const signatures = core.exports.find(
      (entry) => entry.name === "WebBuf",
    )?.signatures;
    if (!signatures) throw new Error("Missing WebBuf signatures");
    expect(signatures.filter((line) => line.startsWith("constructor"))).toEqual(
      [
        "constructor(source?: number | ArrayBuffer | ArrayLike<number> | Iterable<number>, byteOffset?: number, length?: number): WebBuf",
      ],
    );
    expect(signatures).toContain("readonly bytes: Uint8Array<ArrayBuffer>");
    expect(signatures).toContain("readonly byteOffset: number");
    expect(signatures).toContain("readonly buffer: ArrayBuffer");
    expect(signatures).toContain(
      "[Symbol.iterator](): IterableIterator<number>",
    );
    expect(signatures).toContain(
      "static concat(list: (Uint8Array | WebBuf)[]): WebBuf",
    );
    expect(signatures).not.toContain("constructor(): WebBuf");
    expect(
      core.exports.find((entry) => entry.name === "Base32Alphabet")?.signatures,
    ).toEqual([
      'type Base32Alphabet = "Crockford" | "Rfc4648" | "Rfc4648Lower" | "Rfc4648Hex" | "Rfc4648HexLower" | "Z"',
    ]);
    expect(
      core.exports.find((entry) => entry.name === "Base32Options")?.signatures,
    ).toEqual(["alphabet?: Base32Alphabet", "padding?: boolean"]);
  });

  test("all displayed examples come from the current source README", () => {
    for (const api of Object.values(allApi)) {
      const readme = readFileSync(
        resolve(libraries, api.dir, "README.md"),
        "utf8",
      );
      const match = /```(typescript|ts|javascript|js)\n([\s\S]*?)```/.exec(
        readme,
      );
      expect(match).not.toBeNull();
      if (!match?.[1] || !match[2])
        throw new Error(`Missing usage for ${api.npm}`);
      expect(api.usage).toBe(match[2].trimEnd());
      expect(api.usageLang).toBe(match[1].startsWith("j") ? "js" : "ts");
      expect(new Set(api.exports.map((entry) => entry.name)).size).toBe(
        api.exports.length,
      );
      expect(
        api.exports
          .flatMap((entry) => entry.signatures)
          .some((line) => /^type .+ = any$/.test(line)),
      ).toBe(false);
    }
  });
});
