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
  ed25519PublicKeyCreate as pub,
  ed25519Sign as sign,
  ed25519Verify as verify,
} from "../src/index.js";
it("preserves selected key/message/signature and output ownership", () => {
  const key = selectedFixed(
    FixedBuf.fromHex(
      32,
      "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60",
    ),
  );
  const message = selected(WebBuf.fromUtf8("message"));
  const before = [key.toHex(), message.toHex()];
  const publicKey = pub(key);
  expect(publicKey.toHex()).toBe(
    "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
  );
  const sig = sign(key, message);
  expect(sig.toHex()).toBe(sign(key.clone(), message.clone()).toHex());
  const vk = selectedFixed(publicKey),
    signature = selectedFixed(sig);
  expect(verify(vk, message, signature)).toBe(true);
  expect(verify(vk, selected(WebBuf.fromUtf8("wrong")), signature)).toBe(false);
  expect([key.toHex(), message.toHex()]).toEqual(before);
  const output = [publicKey.toHex(), sig.toHex()];
  key.wipe();
  message.wipe();
  vk.wipe();
  signature.wipe();
  expect([publicKey.toHex(), sig.toHex()]).toEqual(output);
});
