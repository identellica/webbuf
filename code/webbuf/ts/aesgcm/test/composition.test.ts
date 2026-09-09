import { createCipheriv } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { aesgcmEncrypt, aesgcmDecrypt } from "../src/index.js";

function selected(value: WebBuf): WebBuf {
  return WebBuf.concat([
    WebBuf.fromHex("99"),
    value,
    WebBuf.fromHex("88"),
  ]).subarray(1, value.length + 1);
}

describe("selected native cipher boundaries", () => {
  for (const size of [16, 32] as const) {
    it(`preserves ${String(size)}-byte key ciphertext and ownership`, () => {
      const message = selected(WebBuf.fromUtf8("selected plaintext"));
      const material = selected(WebBuf.alloc(size, 7));
      const key =
        size === 16
          ? FixedBuf.fromBuf(16, material)
          : FixedBuf.fromBuf(32, material);
      const iv = FixedBuf.fromBuf(12, selected(WebBuf.alloc(12, 3)));
      const aad = selected(WebBuf.fromUtf8("selected aad"));
      const inputs = [message, key.buf, iv.buf, aad];
      const before = inputs.map((v) => v.toHex());
      const native = createCipheriv(
        size === 16 ? "aes-128-gcm" : "aes-256-gcm",
        key.buf.bytes,
        iv.buf.bytes,
      );
      native.setAAD(aad.bytes);
      const expected = WebBuf.concat([
        iv.buf,
        native.update(message.bytes),
        native.final(),
        native.getAuthTag(),
      ]).toHex();
      const encrypted = aesgcmEncrypt(message, key, iv, aad);
      expect(encrypted.toHex()).toBe(expected);
      const copyResult = aesgcmEncrypt(
        message.clone(),
        key.clone(),
        iv.clone(),
        aad.clone(),
      );
      expect(copyResult.toHex()).toBe(expected);
      const cipherView = selected(encrypted);
      const cipherBefore = cipherView.toHex();
      const decrypted = aesgcmDecrypt(cipherView, key, aad);
      expect(decrypted.toHex()).toBe(message.toHex());
      expect(inputs.map((v) => v.toHex())).toEqual(before);
      expect(cipherView.toHex()).toBe(cipherBefore);
      expect(() =>
        aesgcmDecrypt(cipherView, key, selected(WebBuf.fromUtf8("wrong aad"))),
      ).toThrow();
      const plaintextBefore = decrypted.toHex();
      cipherView.wipe();
      for (const input of inputs) input.wipe();
      expect(decrypted.toHex()).toBe(plaintextBefore);
      expect(encrypted.toHex()).toBe(expected);
    });
  }
});
