import { createHash, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";

import { sha256Hash, doubleSha256Hash, sha256Hmac } from "../src/index.js";

describe("selected native hash boundaries", () => {
  it("hashes selected bytes without changing or retaining input storage", () => {
    const source = WebBuf.fromUtf8("_abc_");
    const input = source.subarray(1, 4);
    const before = source.toHex();
    const result = sha256Hash(input);
    const doubled = doubleSha256Hash(input);
    const expected = createHash("sha256").update(input.bytes).digest("hex");
    expect(result.toHex()).toBe(expected);
    expect(result.toHex()).toBe(sha256Hash(input.clone()).toHex());
    expect(doubled.toHex()).toBe(
      createHash("sha256")
        .update(createHash("sha256").update(input.bytes).digest())
        .digest("hex"),
    );
    expect(source.toHex()).toBe(before);
    const doubleBefore = doubled.toHex();
    input.wipe();
    expect(result.toHex()).toBe(expected);
    expect(doubled.toHex()).toBe(doubleBefore);
  });

  it("uses selected MAC key and message bytes", () => {
    const keySource = WebBuf.alloc(34, 7);
    const key = keySource.subarray(1, 33);
    const message = WebBuf.fromUtf8("_message_").subarray(1, 8);
    const keyBefore = keySource.toHex();
    const messageBefore = message.toHex();
    const result = sha256Hmac(key, message);
    const expected = createHmac("sha256", key.bytes)
      .update(message.bytes)
      .digest("hex");
    expect(result.toHex()).toBe(expected);
    expect(keySource.toHex()).toBe(keyBefore);
    expect(message.toHex()).toBe(messageBefore);
    keySource.wipe();
    message.wipe();
    expect(result.toHex()).toBe(expected);
  });
});
