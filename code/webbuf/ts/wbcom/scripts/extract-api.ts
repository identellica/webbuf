import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const websiteDir = join(here, "..");
const tsDir = join(websiteDir, "..");
const outFile = join(websiteDir, "src", "data", "api.generated.json");

interface PackageDir {
  dir: string;
  npm: string;
  description: string;
  entry: string;
}

/** Discover published @webbuf packages (skip private) and the umbrella `webbuf`. */
function discoverPackages(): PackageDir[] {
  const result: PackageDir[] = [];
  for (const dir of readdirSync(tsDir).sort()) {
    const pkgJsonPath = join(tsDir, dir, "package.json");
    const entry = join(tsDir, dir, "src", "index.ts");
    if (!existsSync(pkgJsonPath) || !existsSync(entry)) continue;
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8")) as {
      name?: string;
      description?: string;
      private?: boolean;
    };
    if (
      !pkg.name ||
      pkg.private ||
      !(pkg.name === "webbuf" || pkg.name.startsWith("@webbuf/"))
    )
      continue;
    result.push({
      dir,
      npm: pkg.name,
      description: pkg.description ?? "",
      entry,
    });
  }
  return result;
}

const PACKAGES = discoverPackages();

// Resolve every @webbuf/* import (and `webbuf`) to source, so signatures render
// against real types without needing each package's dist build.
const paths: Record<string, string[]> = {};
for (const pkg of PACKAGES) {
  paths[pkg.npm] = [pkg.entry];
}

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  baseUrl: tsDir,
  paths,
  allowJs: true,
  checkJs: false,
  skipLibCheck: true,
  strict: false,
  noEmit: true,
  esModuleInterop: true,
};

type ExportKind =
  | "function"
  | "const"
  | "class"
  | "interface"
  | "type"
  | "enum"
  | "namespace"
  | "other";

interface ApiExport {
  name: string;
  kind: ExportKind;
  signatures: string[];
  doc: string;
}

interface PackageApi {
  npm: string;
  dir: string;
  description: string;
  /** Maintainer's first TS/JS README example, or null if the README has none. */
  usage: string | null;
  usageLang: "ts" | "js";
  exports: ApiExport[];
}

/** Extract the first TypeScript/JavaScript fenced code block from a README. */
function readmeUsage(dir: string): {
  usage: string | null;
  usageLang: "ts" | "js";
} {
  const readmePath = join(tsDir, dir, "README.md");
  if (!existsSync(readmePath)) return { usage: null, usageLang: "ts" };
  const md = readFileSync(readmePath, "utf8");
  const match = /```(typescript|ts|javascript|js)\n([\s\S]*?)```/.exec(md);
  if (!match) return { usage: null, usageLang: "ts" };
  const lang = match[1].startsWith("j") ? "js" : "ts";
  return { usage: match[2].trimEnd(), usageLang: lang };
}

function kindOf(flags: ts.SymbolFlags): ExportKind {
  if (flags & ts.SymbolFlags.Function) return "function";
  if (flags & ts.SymbolFlags.Class) return "class";
  if (flags & ts.SymbolFlags.Interface) return "interface";
  if (flags & ts.SymbolFlags.TypeAlias) return "type";
  if (flags & ts.SymbolFlags.Enum) return "enum";
  if (flags & ts.SymbolFlags.Module) return "namespace";
  if (flags & ts.SymbolFlags.Variable) return "const";
  return "other";
}

const SIG_FLAGS =
  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature;

const NO_TRUNCATION = ts.TypeFormatFlags.NoTruncation;

/** Strip `import("/abs/path").` qualifiers the printer emits for cross-module types. */
function sanitize(signature: string): string {
  return signature.replace(/import\("[^"]*"\)\./g, "");
}

function isStatic(member: ts.Symbol): boolean {
  const decl = member.valueDeclaration ?? member.declarations?.[0];
  return decl
    ? Boolean(ts.getCombinedModifierFlags(decl) & ts.ModifierFlags.Static)
    : false;
}

/** Render one class/interface member as a signature line, or null to skip. */
function memberSignature(
  checker: ts.TypeChecker,
  member: ts.Symbol,
  location: ts.Node,
): string | null {
  const name = member.getName();
  if (name.startsWith("_") || name === "prototype") return null;
  // Only members declared in the webbuf workspace source (skip inherited
  // built-ins like Object/Function members, which live under node_modules).
  const declaredInWorkspace = member.declarations?.some((d) => {
    const file = d.getSourceFile().fileName;
    return (
      !file.includes("/node_modules/") &&
      PACKAGES.some((pkg) => {
        const within = relative(join(tsDir, pkg.dir, "src"), file);
        return (
          within !== ".." && !within.startsWith("../") && !isAbsolute(within)
        );
      })
    );
  });
  if (!declaredInWorkspace) return null;

  const prefix = isStatic(member) ? "static " : "";
  const type = checker.getTypeOfSymbolAtLocation(member, location);
  const calls = type.getCallSignatures();
  if (calls.length > 0) {
    return calls
      .map(
        (sig) =>
          `${prefix}${name}${checker.signatureToString(sig, location, NO_TRUNCATION)}`,
      )
      .join("\n");
  }
  return `${prefix}${name}: ${checker.typeToString(type, location, SIG_FLAGS)}`;
}

function renderSignatures(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
  location: ts.Node,
  kind: ExportKind,
): string[] {
  const type = checker.getTypeOfSymbolAtLocation(symbol, location);

  if (kind === "function") {
    const calls = type.getCallSignatures();
    if (calls.length > 0) {
      return calls.map(
        (sig) =>
          `${symbol.getName()}${checker.signatureToString(sig, location, NO_TRUNCATION)}`,
      );
    }
  }

  if (kind === "class") {
    const members: string[] = [];
    for (const ctor of type.getConstructSignatures()) {
      members.push(
        `constructor${checker.signatureToString(ctor, location, NO_TRUNCATION)}`,
      );
    }
    for (const prop of type.getProperties()) {
      const line = memberSignature(checker, prop, location);
      if (line) members.push(line);
    }
    const instance = checker.getDeclaredTypeOfSymbol(symbol);
    for (const prop of instance.getProperties()) {
      const line = memberSignature(checker, prop, location);
      if (line) members.push(line);
    }
    return members.length > 0 ? members : ["class"];
  }

  if (kind === "interface") {
    const instance = checker.getDeclaredTypeOfSymbol(symbol);
    const members = instance
      .getProperties()
      .map((prop) => memberSignature(checker, prop, location))
      .filter((line): line is string => line !== null);
    return members.length > 0 ? members : ["interface"];
  }

  if (kind === "type") {
    return [
      `type ${symbol.getName()} = ${checker.typeToString(type, location, SIG_FLAGS)}`,
    ];
  }

  // const / enum / other: show the resolved type.
  return [
    `${symbol.getName()}: ${checker.typeToString(type, location, SIG_FLAGS)}`,
  ];
}

function extractPackage(pkg: PackageDir): PackageApi {
  const program = ts.createProgram([pkg.entry], compilerOptions);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(pkg.entry);
  if (!source) throw new Error(`no source file for ${pkg.npm}`);

  const moduleSymbol =
    checker.getSymbolAtLocation(source) ??
    (source as ts.SourceFile & { symbol?: ts.Symbol }).symbol;
  if (!moduleSymbol) throw new Error(`no module symbol for ${pkg.npm}`);

  const exports: ApiExport[] = checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      const resolved =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      const kind = kindOf(resolved.flags);
      const doc = ts.displayPartsToString(
        resolved.getDocumentationComment(checker),
      );
      return {
        name: symbol.getName(),
        kind,
        signatures: renderSignatures(checker, resolved, source, kind).map(
          sanitize,
        ),
        doc,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const { usage, usageLang } = readmeUsage(pkg.dir);
  return {
    npm: pkg.npm,
    dir: pkg.dir,
    description: pkg.description,
    usage,
    usageLang,
    exports,
  };
}

const catalog: Record<string, PackageApi> = {};
for (const pkg of PACKAGES) {
  catalog[pkg.npm] = extractPackage(pkg);
  console.log(
    `${pkg.npm}: ${catalog[pkg.npm].exports.length.toString()} exports`,
  );
}

// Stable key ordering for deterministic output.
const ordered: Record<string, PackageApi> = {};
for (const key of Object.keys(catalog).sort()) {
  ordered[key] = catalog[key];
}

writeFileSync(outFile, `${JSON.stringify(ordered, null, 2)}\n`);
const withUsage = Object.values(ordered).filter((p) => p.usage !== null).length;
console.log(
  `\nWrote ${outFile} (${PACKAGES.length.toString()} packages, ${withUsage.toString()} with a usage example)`,
);
