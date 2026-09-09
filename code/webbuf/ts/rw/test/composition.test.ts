import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { BufReader, BufWriter } from "../src/index.js";

describe("composed sequential ownership", () => {
  it("copies raw reads but retains numeric read views", () => {
    const source = WebBuf.fromHex("9901020399");
    const selected = source.subarray(1, 4);
    const raw = new BufReader(selected).read(2);
    const fixed = new BufReader(selected).readFixed(2);
    const remainder = new BufReader(selected).readRemainder();
    const reader = new BufReader(selected);
    const numeric = reader.readU16BE();
    expect(reader.pos).toBe(2);
    source.bytes[1] = 4;
    expect(raw.toHex()).toBe("0102");
    expect(fixed.toHex()).toBe("0102");
    expect(remainder.toHex()).toBe("010203");
    expect(numeric.n).toBe(0x0402);
    expect(reader.readU8().n).toBe(3);
    expect(reader.eof()).toBe(true);
    expect(() => reader.read(1)).toThrow("not enough bytes");
    expect(reader.pos).toBe(3);
  });

  it("retains both writer input paths but copies each output", () => {
    const source = WebBuf.fromHex("99010299");
    const selected = source.subarray(1, 3);
    const constructed = new BufWriter([selected]);
    const written = new BufWriter().write(selected);
    const first = constructed.toBuf();
    const second = written.toBuf();
    source.bytes[1] = 4;
    expect(constructed.toBuf().toHex()).toBe("0402");
    expect(written.toBuf().toHex()).toBe("0402");
    expect(first.toHex()).toBe("0102");
    expect(second.toHex()).toBe("0102");
    first.bytes[0] = 7;
    expect(source.toHex()).toBe("99040299");
    expect(second.toHex()).toBe("0102");
  });
});
