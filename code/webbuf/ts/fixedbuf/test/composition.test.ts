import { describe, expect, it, vi } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "../src/index.js";

describe("composed fixed buffers", () => {
  it("fills native bytes but returns the fixed wrapper", () => {
    const random = vi
      .spyOn(crypto, "getRandomValues")
      .mockImplementation((array) => {
        expect(array).toBeInstanceOf(Uint8Array);
        if (!(array instanceof Uint8Array)) throw new Error("not native bytes");
        array.fill(0x42);
        return array;
      });
    try {
      const result = FixedBuf.fromRandom(4);
      expect(result).toBeInstanceOf(FixedBuf);
      expect(result.buf).toBeInstanceOf(WebBuf);
      expect(random).toHaveBeenCalledWith(result.buf.bytes);
      expect(result.toHex()).toBe("42424242");
    } finally {
      random.mockRestore();
    }
  });

  it("preserves offset views, independent clones and selected wiping", () => {
    const source = new Uint8Array([9, 1, 2, 3, 9]);
    const fixed = FixedBuf.fromBuf(3, WebBuf.view(source.subarray(1, 4)));
    const clone = fixed.clone();
    source[2] = 8;
    expect(fixed.toHex()).toBe("010803");
    expect(clone.toHex()).toBe("010203");
    fixed.wipe();
    expect([...source]).toEqual([9, 0, 0, 0, 9]);
    expect(clone.toHex()).toBe("010203");
  });
});
