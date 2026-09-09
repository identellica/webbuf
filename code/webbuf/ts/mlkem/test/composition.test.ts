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
  mlKem768KeyPairDeterministic as keygen,
  mlKem768EncapsulateDeterministic as encap,
  mlKem768Decapsulate as decap,
} from "../src/index.js";
it("preserves selected KEM seeds, keys, ciphertext and outputs", () => {
  const d = selectedFixed(FixedBuf.alloc(32, 1)),
    z = selectedFixed(FixedBuf.alloc(32, 2)),
    m = selectedFixed(FixedBuf.alloc(32, 3));
  const seedsBefore = [d.toHex(), z.toHex()];
  const kp = keygen(d, z),
    copy = keygen(d.clone(), z.clone());
  expect([d.toHex(), z.toHex()]).toEqual(seedsBefore);
  expect(kp.encapsulationKey.toHex()).toBe(copy.encapsulationKey.toHex());
  expect(kp.decapsulationKey.toHex()).toBe(copy.decapsulationKey.toHex());
  const ek = selectedFixed(kp.encapsulationKey),
    dk = selectedFixed(kp.decapsulationKey);
  const inputs = [d.buf, z.buf, m.buf, ek.buf, dk.buf],
    before = inputs.map((v) => v.toHex());
  const out = encap(ek, m),
    expected = encap(ek.clone(), m.clone());
  expect(out.ciphertext.toHex()).toBe(expected.ciphertext.toHex());
  expect(out.sharedSecret.toHex()).toBe(expected.sharedSecret.toHex());
  const ct = selectedFixed(out.ciphertext),
    ctBefore = ct.toHex();
  const recovered = decap(dk, ct);
  expect(recovered.toHex()).toBe(out.sharedSecret.toHex());
  expect(ct.toHex()).toBe(ctBefore);
  expect(inputs.map((v) => v.toHex())).toEqual(before);
  const outputs = [
      kp.encapsulationKey.buf,
      kp.decapsulationKey.buf,
      out.ciphertext.buf,
      out.sharedSecret.buf,
      recovered.buf,
    ],
    snapshots = outputs.map((v) => v.toHex());
  for (const input of inputs) input.wipe();
  ct.wipe();
  expect(outputs.map((v) => v.toHex())).toEqual(snapshots);
});
