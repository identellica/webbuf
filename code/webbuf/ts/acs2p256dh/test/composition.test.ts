import { it, expect } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { acs2p256dhEncrypt, acs2p256dhDecrypt } from "../src/index.js";
import { p256PublicKeyCreate } from "@webbuf/p256";
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
  const alice = fixed(FixedBuf.fromHex(32, "01".repeat(32)));
  const bob = fixed(FixedBuf.fromHex(32, "02".repeat(32)));
  const alicePub = fixed(p256PublicKeyCreate(alice));
  const bobPub = fixed(p256PublicKeyCreate(bob));
  const plaintext = selected(WebBuf.fromUtf8("selected message"));
  const iv = fixed(FixedBuf.fromHex(16, "03".repeat(16)));
  const inputs = [
    alice.buf,
    bob.buf,
    alicePub.buf,
    bobPub.buf,
    plaintext,
    iv.buf,
  ];
  const before = inputs.map(storage);
  const expected = acs2p256dhEncrypt(
    alice.clone(),
    bobPub.clone(),
    plaintext.clone(),
    iv.clone(),
  );
  const ciphertext = acs2p256dhEncrypt(alice, bobPub, plaintext, iv);
  expect(ciphertext.toHex()).toBe(expected.toHex());
  const input = selected(ciphertext);
  const inputBefore = storage(input);
  const recovered = acs2p256dhDecrypt(bob, alicePub, input);
  expect(recovered.toUtf8()).toBe("selected message");
  expect(inputs.map(storage)).toEqual(before);
  expect(storage(input)).toBe(inputBefore);
  for (const value of inputs) value.fill(0);
  input.fill(0);
  expect(ciphertext.toHex()).toBe(expected.toHex());
  expect(recovered.toUtf8()).toBe("selected message");
});
