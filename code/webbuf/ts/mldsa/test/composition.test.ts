import { expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

function selected(value: WebBuf): WebBuf {
  return WebBuf.concat([
    WebBuf.fromHex("99"),
    value,
    WebBuf.fromHex("88"),
  ]).subarray(1, value.length + 1);
}
function selectedFixed<N extends number>(value: FixedBuf<N>): FixedBuf<N> {
  return FixedBuf.fromBuf(value._size, selected(value.buf));
}
import {
  mlDsa65KeyPairDeterministic as keygen,
  mlDsa65SignDeterministic as sign,
  mlDsa65Verify as verify,
  mlDsa65SignInternal as internalSign,
  mlDsa65VerifyInternal as internalVerify,
} from "../src/index.js";
it("preserves selected DSA keys, message, context, randomness and signature", () => {
  const seed = selectedFixed(FixedBuf.alloc(32, 1));
  const seedBefore = seed.toHex();
  const kp = keygen(seed),
    copy = keygen(seed.clone());
  expect(seed.toHex()).toBe(seedBefore);
  expect(kp.signingKey.toHex()).toBe(copy.signingKey.toHex());
  expect(kp.verifyingKey.toHex()).toBe(copy.verifyingKey.toHex());
  const sk = selectedFixed(kp.signingKey),
    vk = selectedFixed(kp.verifyingKey),
    rnd = selectedFixed(FixedBuf.alloc(32, 2));
  const message = selected(WebBuf.fromUtf8("message")),
    context = selected(WebBuf.fromUtf8("context"));
  const inputs = [seed.buf, sk.buf, vk.buf, rnd.buf, message, context],
    before = inputs.map((v) => v.toHex());
  const sig = sign(sk, message, context);
  expect(sig.toHex()).toBe(
    sign(sk.clone(), message.clone(), context.clone()).toHex(),
  );
  const view = selectedFixed(sig);
  expect(verify(vk, message, view, context)).toBe(true);
  expect(verify(vk, message, view, selected(WebBuf.fromUtf8("wrong")))).toBe(
    false,
  );
  expect(verify(vk, selected(WebBuf.fromUtf8("wrong")), view, context)).toBe(
    false,
  );
  const internal = internalSign(sk, message, rnd);
  expect(internal.toHex()).toBe(
    internalSign(sk.clone(), message.clone(), rnd.clone()).toHex(),
  );
  expect(internalVerify(vk, message, selectedFixed(internal))).toBe(true);
  expect(inputs.map((v) => v.toHex())).toEqual(before);
  expect(view.toHex()).toBe(sig.toHex());
  const outputs = [
      kp.signingKey.buf,
      kp.verifyingKey.buf,
      sig.buf,
      internal.buf,
    ],
    snapshots = outputs.map((v) => v.toHex());
  for (const input of inputs) input.wipe();
  view.wipe();
  expect(outputs.map((v) => v.toHex())).toEqual(snapshots);
});
