import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { blake3Hash, doubleBlake3Hash, blake3Mac } from "../src/index.js";

describe("selected native hash boundaries", () => {
  it("hashes selected bytes without changing or retaining input storage", () => {
    const source = WebBuf.fromUtf8("_abc_");
    const input = source.subarray(1, 4);
    const before = source.toHex();
    const result = blake3Hash(input);
    const doubled = doubleBlake3Hash(input);
    const expected =
      "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85";
    expect(result.toHex()).toBe(expected);
    expect(result.toHex()).toBe(blake3Hash(input.clone()).toHex());
    expect(doubled.toHex()).toBe(blake3Hash(result.buf).toHex());
    expect(source.toHex()).toBe(before);
    const doubleBefore = doubled.toHex();
    input.wipe();
    expect(result.toHex()).toBe(expected);
    expect(doubled.toHex()).toBe(doubleBefore);
  });

  it("uses selected MAC key and message bytes", () => {
    const keySource = WebBuf.alloc(34, 7);
    const key = FixedBuf.fromBuf(32, keySource.subarray(1, 33));
    const message = WebBuf.fromUtf8("_message_").subarray(1, 8);
    const keyBefore = keySource.toHex();
    const messageBefore = message.toHex();
    const result = blake3Mac(key, message);
    const expected = blake3Mac(key.clone(), message.clone()).toHex();
    expect(result.toHex()).toBe(expected);
    expect(keySource.toHex()).toBe(keyBefore);
    expect(message.toHex()).toBe(messageBefore);
    keySource.wipe();
    message.wipe();
    expect(result.toHex()).toBe(expected);
  });
});
