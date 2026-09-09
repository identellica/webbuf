import { it, expect } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { mlKem768KeyPairDeterministic } from "@webbuf/mlkem";
import {
  _aesgcmP256dhMlkemEncryptDeterministic,
  aesgcmP256dhMlkemDecrypt,
} from "../src/index.js";
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

it("preserves selected hybrid inputs, wire bytes and output ownership", () => {
  const d = fixed(FixedBuf.fromHex(32, "04".repeat(32)));
  const z = fixed(FixedBuf.fromHex(32, "05".repeat(32)));
  const seedsBefore = [storage(d.buf), storage(z.buf)];
  const kp = mlKem768KeyPairDeterministic(d, z);
  expect([storage(d.buf), storage(z.buf)]).toEqual(seedsBefore);
  const ek = fixed(kp.encapsulationKey);
  const dk = fixed(kp.decapsulationKey);
  const alice = fixed(FixedBuf.fromHex(32, "01".repeat(32)));
  const bob = fixed(FixedBuf.fromHex(32, "02".repeat(32)));
  const alicePub = fixed(p256PublicKeyCreate(alice));
  const bobPub = fixed(p256PublicKeyCreate(bob));
  const plaintext = selected(WebBuf.fromUtf8("selected hybrid"));
  const aad = selected(WebBuf.fromUtf8("selected aad"));
  const m = fixed(FixedBuf.fromHex(32, "06".repeat(32)));
  const iv = fixed(FixedBuf.fromHex(12, "07".repeat(12)));
  const inputs = [
    d.buf,
    z.buf,
    ek.buf,
    dk.buf,
    alice.buf,
    bob.buf,
    alicePub.buf,
    bobPub.buf,
    plaintext,
    aad,
    m.buf,
    iv.buf,
  ];
  const before = inputs.map(storage);
  const expected = _aesgcmP256dhMlkemEncryptDeterministic(
    alice.clone(),
    bobPub.clone(),
    ek.clone(),
    plaintext.clone(),
    m.clone(),
    iv.clone(),
    aad.clone(),
  );
  const ciphertext = _aesgcmP256dhMlkemEncryptDeterministic(
    alice,
    bobPub,
    ek,
    plaintext,
    m,
    iv,
    aad,
  );
  expect(ciphertext.toHex()).toBe(expected.toHex());
  const input = selected(ciphertext);
  const inputBefore = storage(input);
  const recovered = aesgcmP256dhMlkemDecrypt(bob, alicePub, dk, input, aad);
  expect(recovered.toUtf8()).toBe("selected hybrid");
  expect(() =>
    aesgcmP256dhMlkemDecrypt(
      bob,
      alicePub,
      dk,
      input,
      WebBuf.fromUtf8("wrong aad"),
    ),
  ).toThrow();
  expect(inputs.map(storage)).toEqual(before);
  expect(storage(input)).toBe(inputBefore);
  for (const value of inputs) value.fill(0);
  input.fill(0);
  expect(ciphertext.toHex()).toBe(expected.toHex());
  expect(recovered.toUtf8()).toBe("selected hybrid");
});
