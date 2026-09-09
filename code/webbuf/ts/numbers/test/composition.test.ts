import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { U16BE, U16LE, U256BE, U256LE } from "../src/index.js";

describe("composed numeric bytes", () => {
  it("decodes selected endian views and keeps same-endian aliasing", () => {
    const source = new Uint8Array([9, 1, 2, 9]);
    const selected = WebBuf.view(source.subarray(1, 3));
    const be = U16BE.fromBEBuf(selected);
    const le = U16LE.fromLEBuf(selected);
    expect(be.bn).toBe(258n);
    expect(le.bn).toBe(513n);
    const copied = be.toBEBuf();
    source[1] = 3;
    expect(be.bn).toBe(770n);
    expect(le.bn).toBe(515n);
    expect(copied.toHex()).toBe("0102");
  });

  it("retains all 256 bits through endian conversion at nonzero offsets", () => {
    const hex = "fedcba9876543210".repeat(4);
    const source = WebBuf.fromHex(`99${hex}99`).subarray(1, 33);
    const be = U256BE.fromBEBuf(source);
    const le = U256LE.fromLEBuf(source.toReverse());
    expect(be.bn).toBe(BigInt(`0x${hex}`));
    expect(le.bn).toBe(be.bn);
    expect(be.toLEBuf().toHex()).toBe(source.toReverse().toHex());
    expect(le.toBEBuf().toHex()).toBe(hex);
    const max = (1n << 256n) - 1n;
    expect(U256BE.fromBn(max).toBEBuf().toHex()).toBe("ff".repeat(32));
    expect(U256LE.fromBn(max).bn).toBe(max);
  });
});
