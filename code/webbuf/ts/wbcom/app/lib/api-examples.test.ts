import { afterAll, beforeAll, expect, test } from "bun:test";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createHash, pbkdf2Sync } from "node:crypto";
import ts from "typescript";
import { allApi } from "../../src/data/api";

const libraries = resolve(import.meta.dir, "../../..");
const fixture = mkdtempSync(resolve(tmpdir(), "webbuf-doc-examples-"));
const snippets: string[] = [];
const checks: Record<string, string> = {
  "@webbuf/acb3":
    'check(acb3Decrypt(ciphertext, key).toUtf8() === "Secret message");',
  "@webbuf/acs2":
    'check(acs2Decrypt(ciphertext, key).toUtf8() === "Secret message");',
  "@webbuf/acb3dh": 'check(decrypted.toUtf8() === "Hello Bob!");',
  "@webbuf/acb3p256dh": 'check(decrypted.toUtf8() === "Hello Bob!");',
  "@webbuf/acs2dh": 'check(decrypted.toUtf8() === "Hello Bob!");',
  "@webbuf/acs2p256dh": 'check(decrypted.toUtf8() === "Hello Bob!");',
  "@webbuf/aescbc": 'check(decrypted.toUtf8() === "Hello, world!");',
  "@webbuf/aesgcm": 'check(decrypted.toUtf8() === "Hello, AES-GCM!");',
  "@webbuf/aesgcm-p256dh": 'check(decrypted.toUtf8() === "Hello Bob!");',
  "@webbuf/aesgcm-mlkem":
    'check(recovered.toUtf8() === "hello, post-quantum");',
  "@webbuf/aesgcm-p256dh-mlkem":
    'check(recovered.toUtf8() === "hybrid encryption");',
  "@webbuf/aesgcm-x25519dh-mlkem":
    'check(recovered.toUtf8() === "hybrid encryption");',
  "@webbuf/blake3":
    "check(hash.toHex().length === 64); check(doubleHash.toHex() === blake3Hash(hash.buf).toHex()); check(mac.toHex() === blake3Mac(key, data).toHex());",
  "@webbuf/ed25519":
    'check(ok); check(!ed25519Verify(pub, WebBuf.fromUtf8("other"), signature));',
  "@webbuf/fixedbuf":
    'check(fromHex.toHex() === "deadbeef"); check(fromB64.toBase64() === "SGVsbG8gV29ybGQhISE="); check(buf16.toHex() === "ff".repeat(16)); check(underlying === webBuf); check(cloned.buf !== fixed.buf);',
  "@webbuf/mldsa":
    'check(ok); check(!mlDsa65Verify(verifyingKey, WebBuf.fromUtf8("other"), signature, context));',
  "@webbuf/mlkem":
    "check(recovered.toHex() === sharedSecret.toHex()); check(sharedSecret.buf.length === 32);",
  "@webbuf/slhdsa":
    'check(ok); check(!slhDsaSha2_128fVerify(verifyingKey, WebBuf.fromUtf8("other"), signature, context));',
  "@webbuf/numbers":
    'check(sum.n === 1500); check(diff.n === 900); check(product.n === 2000); check(quotient.n === 100); check(restored.n === 1000); check(hex === "000003e8"); check(leBuf.toHex() === "e8030000");',
  "@webbuf/p256":
    "check(p256PrivateKeyVerify(privKey)); check(p256PublicKeyVerify(pubKey)); check(pubKey.buf.length === 33);",
  "@webbuf/pbkdf2-sha256": `check(derivedKey.toHex() === "${pbkdf2Sync("my password", "random salt", 100_000, 32, "sha256").toString("hex")}");`,
  "@webbuf/ripemd160": `check(hash.toHex() === "${createHash("ripemd160").update("Hello, world!").digest("hex")}"); check(doubleHash.toHex() === ripemd160Hash(hash.buf).toHex());`,
  "@webbuf/rw":
    'check(buf.length === 50); check(buf.subarray(0, 15).toHex() === "ff03e80001e240123456789abcdef0"); check(buf.subarray(15, 47).toHex() === hash.toHex()); check(buf.subarray(47).toHex() === "fd03e8");',
  "@webbuf/secp256k1":
    "check(privateKeyVerify(privKey)); check(publicKeyVerify(pubKey)); check(pubKey.buf.length === 33);",
  "@webbuf/sha256":
    'check(hash.toHex() === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"); check(doubleHash.toHex() === sha256Hash(hash.buf).toHex()); check(mac.buf.length === 32);',
  "@webbuf/sig-ed25519-mldsa":
    'check(ok); check(signature.buf.length === 3374); check(!sigEd25519MldsaVerify(ed25519Pub, mldsaVerifyingKey, WebBuf.fromUtf8("other"), signature));',
  "@webbuf/webbuf":
    'check(selected.toUtf8() === "Bi"); check(copied.toUtf8() === "H"); check(backing[0] === 0xee && backing[3] === 0xff); check(selected.byteOffset === 1); check(!(selected instanceof Uint8Array)); check(!ArrayBuffer.isView(selected)); check(new TextDecoder().decode(selected.bytes) === "Bi"); check(buf2.toHex() === "deadbeef"); let rejected = false; try { new TextDecoder().decode(selected); } catch (error) { rejected = error instanceof TypeError; } check(rejected);',
  "@webbuf/x25519":
    "check(aliceSS.toHex() === bobSS.toHex()); check(aliceSS.buf.length === 32);",
  webbuf:
    'check(WebBuf.fromUtf8("hello").toHex() === "68656c6c6f"); check(sha256Hash(WebBuf.fromUtf8("abc")).toHex() === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");',
};

beforeAll(() => {
  mkdirSync(resolve(fixture, "node_modules/@webbuf"), { recursive: true });
  expect(Object.keys(checks).sort()).toEqual(Object.keys(allApi).sort());
  for (const api of Object.values(allApi)) {
    const directory = resolve(libraries, api.dir);
    const manifest = JSON.parse(
      readFileSync(resolve(directory, "package.json"), "utf8"),
    );
    expect(manifest.main).toBe("dist/index.js");
    expect(manifest.types).toBe("dist/index.d.ts");
    symlinkSync(directory, resolve(fixture, "node_modules", api.npm), "dir");
    expect(realpathSync(Bun.resolveSync(api.npm, fixture))).toBe(
      realpathSync(resolve(directory, manifest.main)),
    );
  }
  for (const api of Object.values(allApi)) {
    if (!api.usage) throw new Error(`Missing example ${api.npm}`);
    const file = resolve(fixture, `${api.dir}.ts`);
    writeFileSync(
      file,
      `${api.usage}\nfunction check(value: unknown): void { if (!value) throw new Error("Example assertion failed: ${api.npm}"); }\n${checks[api.npm]}\nconsole.log("EXAMPLE_OK:${api.npm}");\n`,
    );
    snippets.push(file);
  }
});

afterAll(() => {
  rmSync(fixture, { recursive: true, force: true });
});

test("all displayed examples strictly typecheck against built workspace declarations", () => {
  const program = ts.createProgram(snippets, {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  expect(
    diagnostics.map((d) =>
      ts.flattenDiagnosticMessageText(d.messageText, "\n"),
    ),
  ).toEqual([]);
});

test("typed-array API wrapper substitution and numeric indexing fail strict typing", () => {
  const file = resolve(fixture, "invalid-native.ts");
  writeFileSync(
    file,
    'import { WebBuf } from "@webbuf/webbuf";\nconst buf = WebBuf.fromUtf8("Hi");\nnew Uint8Array(2).set(buf);\nbuf[0];\n',
  );
  const program = ts.createProgram([file], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  expect(diagnostics.map((d) => d.code).sort()).toEqual([2345, 7053]);
  expect(diagnostics.every((d) => d.file?.fileName === file)).toBe(true);
});

for (const api of Object.values(allApi)) {
  test(`${api.npm} displayed example executes with result assertions`, () => {
    const child = Bun.spawnSync(
      [process.execPath, "--no-env-file", resolve(fixture, `${api.dir}.ts`)],
      {
        cwd: fixture,
        env: { PATH: process.env.PATH ?? "/usr/bin:/bin" },
        timeout: 30_000,
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    if (child.exitCode !== 0)
      throw new Error(
        `${api.npm}: ${child.stderr.toString()}\n${child.stdout.toString()}`,
      );
    expect(child.exitCode).toBe(0);
    expect(child.stdout.toString()).toContain(`EXAMPLE_OK:${api.npm}`);
  }, 35_000);
}
