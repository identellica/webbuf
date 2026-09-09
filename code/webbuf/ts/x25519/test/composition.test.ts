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
  x25519PublicKeyCreate as pub,
  x25519SharedSecretRaw as secret,
} from "../src/index.js";
it("preserves selected agreement keys and independent secret bytes", () => {
  const a = selectedFixed(
    FixedBuf.fromHex(
      32,
      "77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a",
    ),
  );
  const b = selectedFixed(
    FixedBuf.fromHex(
      32,
      "5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb",
    ),
  );
  const keysBefore = [a.toHex(), b.toHex()];
  const ap = pub(a),
    bp = selectedFixed(pub(b));
  expect([a.toHex(), b.toHex()]).toEqual(keysBefore);
  const before = [a.toHex(), b.toHex(), bp.toHex()];
  const output = secret(a, bp);
  expect(output.toHex()).toBe(
    "4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742",
  );
  expect(output.toHex()).toBe(secret(a.clone(), bp.clone()).toHex());
  expect(output.toHex()).toBe(secret(b, selectedFixed(ap)).toHex());
  expect([a.toHex(), b.toHex(), bp.toHex()]).toEqual(before);
  const snapshots = [output.toHex(), ap.toHex()];
  a.wipe();
  b.wipe();
  bp.wipe();
  expect([output.toHex(), ap.toHex()]).toEqual(snapshots);
});
