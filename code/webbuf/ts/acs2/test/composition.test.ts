import { it, expect } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { acs2Encrypt, acs2Decrypt } from "../src/index.js";

function selected(value: WebBuf): WebBuf {
  return WebBuf.concat([
    WebBuf.fromHex("99"),
    value,
    WebBuf.fromHex("88"),
  ]).subarray(1, value.length + 1);
}
function fixed<N extends number>(value: FixedBuf<N>): FixedBuf<N> {
  return FixedBuf.fromBuf(value._size, selected(value.buf));
}
function storage(value: WebBuf): string {
  return new WebBuf(value.buffer).toHex();
}

it("preserves selected bytes, sentinels and independent outputs", () => {
  const key = fixed(FixedBuf.fromHex(32, "01".repeat(32)));
  const plaintext = selected(WebBuf.fromUtf8("selected message"));
  const iv = fixed(FixedBuf.fromHex(16, "03".repeat(16)));
  const inputs = [key.buf, plaintext, iv.buf];
  const before = inputs.map(storage);
  const expected = acs2Encrypt(plaintext.clone(), key.clone(), iv.clone());
  const ciphertext = acs2Encrypt(plaintext, key, iv);
  expect(ciphertext.toHex()).toBe(expected.toHex());
  const input = selected(ciphertext);
  const inputBefore = storage(input);
  const recovered = acs2Decrypt(input, key);
  expect(recovered.toUtf8()).toBe("selected message");
  expect(inputs.map(storage)).toEqual(before);
  expect(storage(input)).toBe(inputBefore);
  for (const value of inputs) value.fill(0);
  input.fill(0);
  expect(ciphertext.toHex()).toBe(expected.toHex());
  expect(recovered.toUtf8()).toBe("selected message");
});
