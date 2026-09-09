import { Buffer } from "node:buffer";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { WebBuf } from "../src/webbuf.js";

describe("WebBuf composition", () => {
  it("recognizes backing buffers across realms without losing bytes", () => {
    const foreign = runInNewContext(
      "new Uint8Array([9, 1, 2, 3, 9])",
    ) as Uint8Array<ArrayBuffer>;
    const view = new WebBuf(foreign.buffer, 1, 3);
    const wrapped = WebBuf.view(foreign.subarray(1, 4));
    expect(view.toArray()).toEqual([1, 2, 3]);
    foreign[2] = 8;
    expect(view.toArray()).toEqual([1, 8, 3]);
    expect(wrapped.toArray()).toEqual([1, 8, 3]);
    expect(view.byteOffset).toBe(1);
    const shared = runInNewContext(
      "new Uint8Array(new SharedArrayBuffer(3))",
    ) as Uint8Array<SharedArrayBuffer>;
    shared.set([1, 2, 3]);
    expect(() => WebBuf.view(shared)).toThrow(TypeError);
    // @ts-expect-error Shared backing is also rejected at runtime across realms.
    expect(() => new WebBuf(shared.buffer)).toThrow(TypeError);
    const copy = WebBuf.fromUint8Array(shared);
    shared[0] = 9;
    expect(copy.toArray()).toEqual([1, 2, 3]);
    expect(() => new WebBuf(foreign.buffer, 6)).toThrow(RangeError);
  });

  it("exposes native bytes without being a typed array", () => {
    const buf = WebBuf.fromArray([1, 2, 3]);
    expect(buf instanceof Uint8Array).toBe(false);
    expect(ArrayBuffer.isView(buf)).toBe(false);
    expect(buf.bytes.constructor).toBe(Uint8Array);
    expect([...buf]).toEqual([1, 2, 3]);
    const native: Uint8Array<ArrayBuffer> = buf.bytes;
    expect(native).toBe(buf.bytes);
    // @ts-expect-error WebBuf is deliberately not a native typed array.
    const forbidden: Uint8Array = buf;
    expect(forbidden).toBe(buf);
    // @ts-expect-error Numeric indexing belongs on bytes, not the wrapper.
    const absent: unknown = buf[0];
    expect(absent).toBeUndefined();
  });

  it("distinguishes allocating, copying and viewing selected bytes", () => {
    const input = new Uint8Array([9, 1, 2, 3, 9]);
    const selected = input.subarray(1, 4);
    const view = WebBuf.view(selected);
    const ctorView = new WebBuf(input.buffer, 1, 3);
    const copies = [
      new WebBuf(selected),
      WebBuf.fromUint8Array(selected),
      new WebBuf(view),
      view.clone(),
      view.slice(),
    ];
    input[2] = 8;
    expect(view.toArray()).toEqual([1, 8, 3]);
    expect(ctorView.toArray()).toEqual([1, 8, 3]);
    for (const copy of copies) expect(copy.toArray()).toEqual([1, 2, 3]);
    expect(view.byteOffset).toBe(1);
    expect(view.byteLength).toBe(3);
    expect(view.buffer).toBe(input.buffer);
    expect(WebBuf.alloc(0).length).toBe(0);
    expect(new WebBuf(3).toArray()).toEqual([0, 0, 0]);
    expect(() => new WebBuf(input.buffer, 6)).toThrow(RangeError);
    expect(view.slice(-2).toArray()).toEqual([8, 3]);
    view.subarray(1, 2).wipe();
    expect(input[2]).toBe(0);
    view.read(0, 1).fill(4);
    expect(input[1]).toBe(4);
  });

  it("normalizes Buffer views without losing shared offsets", () => {
    const input = Buffer.from([7, 8, 9, 10]).subarray(1, 3);
    const view = WebBuf.view(input);
    expect(view.bytes.constructor).toBe(Uint8Array);
    expect(view.buffer).toBe(input.buffer);
    expect(view.byteOffset).toBe(input.byteOffset);
    view.bytes[0] = 2;
    expect(input[0]).toBe(2);
    expect(Buffer.from(view.bytes).toString("hex")).toBe("0209");
  });

  it("requires a copy for shared backing storage", () => {
    const input = new Uint8Array(new SharedArrayBuffer(5), 1, 3);
    input.set([1, 2, 3]);
    expect(() => WebBuf.view(input)).toThrow("explicit copy");
    expect(() => WebBuf.from(input)).toThrow("explicit copy");
    // @ts-expect-error Shared backing storage is not a supported constructor view.
    expect(() => new WebBuf(input.buffer)).toThrow("explicit copy");
    const copy = WebBuf.fromUint8Array(input);
    expect(copy.buffer instanceof ArrayBuffer).toBe(true);
    input[0] = 9;
    expect(copy.toArray()).toEqual([1, 2, 3]);
  });

  it("preserves aliasing without a mapper and copies when mapping", () => {
    const input = WebBuf.fromArray([1, 2, 3]);
    const view = WebBuf.from(input);
    const mapped = WebBuf.from(input, (v, i) => v + i);
    const mappedNative = WebBuf.from(input.bytes, (v) => v * 2);
    input.bytes[0] = 8;
    expect(view.bytes[0]).toBe(8);
    expect(mapped.toArray()).toEqual([1, 3, 5]);
    expect(mappedNative.toArray()).toEqual([2, 4, 6]);
    expect(WebBuf.from({ 0: 4, 1: 5, length: 2 }).toArray()).toEqual([4, 5]);
  });

  it("handles overlapping mutation and native fill coercion", () => {
    const buf = WebBuf.fromArray([1, 2, 3, 4]);
    buf.copy(buf, 1, 0, 3);
    expect(buf.toArray()).toEqual([1, 1, 2, 3]);
    buf.fill(257, -2);
    expect(buf.toArray()).toEqual([1, 1, 1, 1]);
    buf.set(WebBuf.fromArray([3, 4]), 1);
    expect(buf.reverse()).toBe(buf);
    expect(buf.toArray()).toEqual([1, 4, 3, 1]);
    expect(buf.write(WebBuf.fromArray([7]), 0)).toBe(1);
    expect(() => buf.write(WebBuf.alloc(5))).toThrow();
    expect(() => buf.read(3, 2)).toThrow();
  });

  it("uses only the selected bytes at native and WASM boundaries", async () => {
    const buf = WebBuf.view(new Uint8Array([0, 97, 98, 99, 0]).subarray(1, 4));
    expect(buf.toHexWasm()).toBe("616263");
    expect(buf.toHexPureJs()).toBe("616263");
    expect(buf.toBase64Wasm()).toBe("YWJj");
    expect(buf.toBase64PureJs()).toBe("YWJj");
    expect(buf.toBase32({ alphabet: "Rfc4648" })).toBe("MFRGG===");
    expect(new TextDecoder().decode(buf.bytes)).toBe("abc");
    const digest = await crypto.subtle.digest("SHA-256", buf.bytes);
    expect(new WebBuf(digest).toHex()).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    for (const alphabet of [
      "Crockford",
      "Rfc4648",
      "Rfc4648Lower",
      "Rfc4648Hex",
      "Rfc4648HexLower",
      "Z",
    ] as const) {
      expect(
        WebBuf.fromBase32(buf.toBase32({ alphabet }), { alphabet }).equals(buf),
      ).toBe(true);
    }
  });
});
