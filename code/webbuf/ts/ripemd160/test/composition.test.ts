import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";

import { ripemd160Hash, doubleRipemd160Hash } from "../src/index.js";

describe("selected native hash boundaries", () => {
  it("hashes selected bytes without changing or retaining input storage", () => {
    const source = WebBuf.fromUtf8("_abc_");
    const input = source.subarray(1, 4);
    const before = source.toHex();
    const result = ripemd160Hash(input);
    const doubled = doubleRipemd160Hash(input);
    const expected = createHash("ripemd160").update(input.bytes).digest("hex");
    expect(result.toHex()).toBe(expected);
    expect(result.toHex()).toBe(ripemd160Hash(input.clone()).toHex());
    expect(doubled.toHex()).toBe(
      createHash("ripemd160")
        .update(createHash("ripemd160").update(input.bytes).digest())
        .digest("hex"),
    );
    expect(source.toHex()).toBe(before);
    const doubleBefore = doubled.toHex();
    input.wipe();
    expect(result.toHex()).toBe(expected);
    expect(doubled.toHex()).toBe(doubleBefore);
  });
});
