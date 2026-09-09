import { it, expect } from "vitest";
import * as api from "../src/index.js";
import * as part0 from "@webbuf/webbuf";
import * as part1 from "@webbuf/fixedbuf";
import * as part2 from "@webbuf/numbers";
import * as part3 from "@webbuf/rw";
import * as part4 from "@webbuf/blake3";
import * as part5 from "@webbuf/sha256";
import * as part6 from "@webbuf/ripemd160";
import * as part7 from "@webbuf/secp256k1";
import * as part8 from "@webbuf/p256";
import * as part9 from "@webbuf/x25519";
import * as part10 from "@webbuf/ed25519";
import * as part11 from "@webbuf/aescbc";
import * as part12 from "@webbuf/aesgcm";
import * as part13 from "@webbuf/aesgcm-mlkem";
import * as part14 from "@webbuf/aesgcm-p256dh";
import * as part15 from "@webbuf/aesgcm-p256dh-mlkem";
import * as part16 from "@webbuf/aesgcm-x25519dh-mlkem";
import * as part17 from "@webbuf/sig-ed25519-mldsa";
import * as part18 from "@webbuf/acb3";
import * as part19 from "@webbuf/acb3dh";
import * as part20 from "@webbuf/acb3p256dh";
import * as part21 from "@webbuf/acs2";
import * as part22 from "@webbuf/acs2dh";
import * as part23 from "@webbuf/acs2p256dh";
import * as part24 from "@webbuf/pbkdf2-sha256";
import * as part25 from "@webbuf/mlkem";
import * as part26 from "@webbuf/mldsa";
import * as part27 from "@webbuf/slhdsa";

it("reexports every existing library value without replacing identities", () => {
  const exports: Record<string, unknown> = api;
  for (const part of [
    part0,
    part1,
    part2,
    part3,
    part4,
    part5,
    part6,
    part7,
    part8,
    part9,
    part10,
    part11,
    part12,
    part13,
    part14,
    part15,
    part16,
    part17,
    part18,
    part19,
    part20,
    part21,
    part22,
    part23,
    part24,
    part25,
    part26,
    part27,
  ]) {
    for (const [name, value] of Object.entries(part)) {
      expect(exports[name], name).toBe(value);
    }
  }
});

it("uses the composed core through encryption and signature exports", () => {
  const { WebBuf, FixedBuf } = api;
  const message = WebBuf.fromUtf8("_umbrella_").subarray(1, 9);
  expect(message).not.toBeInstanceOf(Uint8Array);
  expect(message.bytes).toBeInstanceOf(Uint8Array);
  const key = FixedBuf.fromHex(32, "01".repeat(32));
  const ciphertext = api.acb3Encrypt(message, key, FixedBuf.alloc(16));
  expect(api.acb3Decrypt(ciphertext, key).toUtf8()).toBe("umbrella");
  const kp = api.mlDsa65KeyPairDeterministic(FixedBuf.alloc(32));
  const sig = api._sigEd25519MldsaSignDeterministic(
    key,
    kp.signingKey,
    message,
  );
  expect(
    api.sigEd25519MldsaVerify(
      api.ed25519PublicKeyCreate(key),
      kp.verifyingKey,
      message,
      sig,
    ),
  ).toBe(true);
});
