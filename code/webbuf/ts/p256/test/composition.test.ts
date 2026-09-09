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
  p256Sign as sign,
  p256Verify as verify,
  p256PublicKeyCreate as pub,
  p256SharedSecret as secret,
} from "../src/index.js";
it("preserves selected curve inputs, signatures and shared secrets", () => {
  const key = selectedFixed(FixedBuf.alloc(32, 1)),
    other = selectedFixed(FixedBuf.alloc(32, 2)),
    digest = selectedFixed(FixedBuf.alloc(32, 3)),
    nonce = selectedFixed(FixedBuf.alloc(32, 4));
  const keysBefore = [key.toHex(), other.toHex()];
  const pk = pub(key),
    peer = selectedFixed(pub(other));
  expect([key.toHex(), other.toHex()]).toEqual(keysBefore);
  expect(pk.toHex()).toBe(pub(key.clone()).toHex());
  const inputs = [key.buf, other.buf, digest.buf, nonce.buf, peer.buf],
    before = inputs.map((v) => v.toHex());
  const sig = sign(digest, key, nonce);
  expect(sig.toHex()).toBe(
    sign(digest.clone(), key.clone(), nonce.clone()).toHex(),
  );
  const sigView = selectedFixed(sig),
    pkView = selectedFixed(pk);
  expect(verify(sigView, digest, pkView)).toBe(true);
  expect(verify(sigView, FixedBuf.alloc(32, 9), pkView)).toBe(false);
  const ss = secret(key, peer);
  expect(ss.toHex()).toBe(secret(key.clone(), peer.clone()).toHex());
  expect(ss.toHex()).toBe(secret(other, pkView).toHex());
  expect(inputs.map((v) => v.toHex())).toEqual(before);
  expect(sigView.toHex()).toBe(sig.toHex());
  expect(pkView.toHex()).toBe(pk.toHex());
  const outputs = [pk.buf, sig.buf, ss.buf],
    snapshots = outputs.map((v) => v.toHex());
  for (const input of inputs) input.wipe();
  sigView.wipe();
  pkView.wipe();
  expect(outputs.map((v) => v.toHex())).toEqual(snapshots);
});
