import { createCipheriv } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { aescbcEncrypt, aescbcDecrypt } from "../src/index.js";

function selected(value: WebBuf): WebBuf {
  return WebBuf.concat([
    WebBuf.fromHex("99"),
    value,
    WebBuf.fromHex("88"),
  ]).subarray(1, value.length + 1);
}

describe("selected native cipher boundaries", () => {
  for (const size of [16, 24, 32] as const) {
    it(`preserves ${String(size)}-byte key ciphertext and ownership`, () => {
      const message = selected(WebBuf.fromUtf8("selected plaintext"));
      const material = selected(WebBuf.alloc(size, 7));
      const key =
        size === 16
          ? FixedBuf.fromBuf(16, material)
          : size === 24
            ? FixedBuf.fromBuf(24, material)
            : FixedBuf.fromBuf(32, material);
      const iv = FixedBuf.fromBuf(16, selected(WebBuf.alloc(16, 3)));

      const inputs = [message, key.buf, iv.buf];
      const before = inputs.map((v) => v.toHex());
      const native = createCipheriv(
        `aes-${String(size * 8)}-cbc`,
        key.buf.bytes,
        iv.buf.bytes,
      );

      const expected = WebBuf.concat([
        iv.buf,
        native.update(message.bytes),
        native.final(),
      ]).toHex();
      const encrypted = aescbcEncrypt(message, key, iv);
      expect(encrypted.toHex()).toBe(expected);
      const copyResult = aescbcEncrypt(
        message.clone(),
        key.clone(),
        iv.clone(),
      );
      expect(copyResult.toHex()).toBe(expected);
      const cipherView = selected(encrypted);
      const cipherBefore = cipherView.toHex();
      const decrypted = aescbcDecrypt(cipherView, key);
      expect(decrypted.toHex()).toBe(message.toHex());
      expect(inputs.map((v) => v.toHex())).toEqual(before);
      expect(cipherView.toHex()).toBe(cipherBefore);

      const plaintextBefore = decrypted.toHex();
      cipherView.wipe();
      for (const input of inputs) input.wipe();
      expect(decrypted.toHex()).toBe(plaintextBefore);
      expect(encrypted.toHex()).toBe(expected);
    });
  }
});
