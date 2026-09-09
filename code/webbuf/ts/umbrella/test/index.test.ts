import { describe, it, expect } from "vitest";
import {
  WebBuf,
  BufReader,
  BufWriter,
  U16LE,
  U32LE,
  U64LE,
  U128LE,
  U256LE,
} from "../src/index.js";

describe("Index", () => {
  it("exposes every LE pair through built workspace rw exports", () => {
    const writer = new BufWriter();
    writer.writeU16LE(U16LE.fromBn(0x1234n));
    writer.writeU32LE(U32LE.fromBn(0x1234n));
    writer.writeU64LE(U64LE.fromBn(0x1234n));
    writer.writeU128LE(U128LE.fromBn(0x1234n));
    writer.writeU256LE(U256LE.fromBn(0x1234n));
    const reader = new BufReader(writer.toBuf());
    expect(reader.readU16LE().bn).toBe(0x1234n);
    expect(reader.readU32LE().bn).toBe(0x1234n);
    expect(reader.readU64LE().bn).toBe(0x1234n);
    expect(reader.readU128LE().bn).toBe(0x1234n);
    expect(reader.readU256LE().bn).toBe(0x1234n);
    expect(reader.eof()).toBe(true);
  });

  it("should encode and decode base64", () => {
    const myStr = "Hello, World!";
    const buf = WebBuf.from(myStr);
    const base64 = buf.toString("base64");
    const decoded = WebBuf.from(base64, "base64");
    expect(decoded.toUtf8()).toBe(myStr);
  });

  it("should encode and decode hex", () => {
    const myStr = "Hello, World!";
    const buf = WebBuf.from(myStr);
    const hex = buf.toString("hex");
    const decoded = WebBuf.from(hex, "hex");
    expect(decoded.toUtf8()).toBe(myStr);
  });
});
