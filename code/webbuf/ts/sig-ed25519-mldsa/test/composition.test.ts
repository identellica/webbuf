import { it, expect } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { ed25519PublicKeyCreate } from "@webbuf/ed25519";
import { mlDsa65KeyPairDeterministic } from "@webbuf/mldsa";
import {
  _sigEd25519MldsaSignDeterministic,
  sigEd25519MldsaVerify,
} from "../src/index.js";
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

it("preserves selected composite signature bytes and ownership", () => {
  const edSeed = fixed(FixedBuf.fromHex(32, "aa".repeat(32)));
  const seed = fixed(FixedBuf.fromHex(32, "bb".repeat(32)));
  const beforeSeeds = [storage(edSeed.buf), storage(seed.buf)];
  const edPub = fixed(ed25519PublicKeyCreate(edSeed));
  const kp = mlDsa65KeyPairDeterministic(seed);
  expect([storage(edSeed.buf), storage(seed.buf)]).toEqual(beforeSeeds);
  const sk = fixed(kp.signingKey);
  const vk = fixed(kp.verifyingKey);
  const message = selected(WebBuf.fromUtf8("composite signature"));
  const inputs = [edSeed.buf, seed.buf, edPub.buf, sk.buf, vk.buf, message];
  const before = inputs.map(storage);
  const expected = _sigEd25519MldsaSignDeterministic(
    edSeed.clone(),
    sk.clone(),
    message.clone(),
  );
  const signature = _sigEd25519MldsaSignDeterministic(edSeed, sk, message);
  expect(signature.toHex()).toBe(expected.toHex());
  const input = fixed(signature);
  const inputBefore = storage(input.buf);
  expect(sigEd25519MldsaVerify(edPub, vk, message, input)).toBe(true);
  expect(
    sigEd25519MldsaVerify(edPub, vk, WebBuf.fromUtf8("wrong"), input),
  ).toBe(false);
  expect(inputs.map(storage)).toEqual(before);
  expect(storage(input.buf)).toBe(inputBefore);
  for (const value of inputs) value.fill(0);
  input.buf.fill(0);
  expect(signature.toHex()).toBe(expected.toHex());
});
