import { describe, it, expect } from "vitest";
import { ripemd160Hash, doubleRipemd160Hash } from "../src/index.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import ripemd160 from "ripemd160-js/ripemd160.js";

describe("Ripemd160", () => {
  it("should correctly compute ripemd160 hash", () => {
    const input = WebBuf.fromUtf8("test input");
    const result = ripemd160Hash(input);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(20);
    const expectedHashHex = "c9d5140e91c4275745e6bd59efb875112e5b223a";
    expect(result.toHex()).toBe(expectedHashHex);
  });

  it("should correctly compute ripemd160 hash", () => {
    const input = WebBuf.fromHex(
      "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722",
    );
    const result = ripemd160Hash(input);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(20);
    const expectedHashHex = "5a95f9ebad92d7d0c145d835af4cecd73afd987e";
    expect(result.toHex()).toBe(expectedHashHex);
  });

  it("should correctly compute double ripemd160 hash", () => {
    const input = WebBuf.fromUtf8("test input");
    const result = doubleRipemd160Hash(input);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(20);
    const expectedDoubleHashHex = "fcf1c04f126eaf0803ff762cb618458734bc84f5";
    expect(result.toHex()).toBe(expectedDoubleHashHex);
  });

  it("should correctly compute double ripemd160 hash", () => {
    const input = WebBuf.fromHex(
      "0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628",
    );
    const result = doubleRipemd160Hash(input);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(20);
    const expectedDoubleHashHex = "604c8206367d357d6a58d98d402bc49785da34c3";
    expect(result.toHex()).toBe(expectedDoubleHashHex);
  });

  describe("test against ripemd160-js", () => {
    it("should match ripemd160-js hash", async () => {
      const input = WebBuf.fromUtf8("test input");
      const result = ripemd160Hash(input);
      const expectedHashHex = WebBuf.fromUint8Array(
        (await ripemd160(input)) as Uint8Array,
      ).toHex();

      expect(result.toHex()).toBe(expectedHashHex);
    });
  });
});
