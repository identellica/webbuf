import { pbkdf2Sync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { pbkdf2Sha256 } from "../src/index.js";

describe("selected native derivation boundaries", () => {
  it("preserves password/salt selection, exact output and ownership", () => {
    const password = WebBuf.fromUtf8("_password_").subarray(1, 9);
    const salt = WebBuf.fromUtf8("_salt_").subarray(1, 5);
    const before = [password.toHex(), salt.toHex()];
    const output = pbkdf2Sha256(password, salt, 2, 32);
    const expected = pbkdf2Sync(
      password.bytes,
      salt.bytes,
      2,
      32,
      "sha256",
    ).toString("hex");
    expect(output.toHex()).toBe(expected);
    expect(output.toHex()).toBe(
      pbkdf2Sha256(password.clone(), salt.clone(), 2, 32).toHex(),
    );
    expect([password.toHex(), salt.toHex()]).toEqual(before);
    password.wipe();
    salt.wipe();
    expect(output.toHex()).toBe(expected);
  });
});
