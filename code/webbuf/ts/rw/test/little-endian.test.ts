import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import {
  U16LE,
  U32LE,
  U64LE,
  U128LE,
  U256LE,
  U16BE,
  U32BE,
  U64BE,
  U128BE,
  U256BE,
} from "@webbuf/numbers";
import { BufReader, BufWriter } from "../src/index.js";

const widths = [
  {
    bits: 16,
    size: 2,
    copyProbe: (w: BufWriter, n: bigint) => {
      const value = U16LE.fromBn(n);
      w.writeU16LE(value);
      return value;
    },
    read: (r: BufReader) => r.readU16LE(),
    write: (w: BufWriter, n: bigint) => w.writeU16LE(U16LE.fromBn(n)),
    readBE: (r: BufReader) => r.readU16BE(),
    writeBE: (w: BufWriter, n: bigint) => w.writeU16BE(U16BE.fromBn(n)),
  },
  {
    bits: 32,
    size: 4,
    copyProbe: (w: BufWriter, n: bigint) => {
      const value = U32LE.fromBn(n);
      w.writeU32LE(value);
      return value;
    },
    read: (r: BufReader) => r.readU32LE(),
    write: (w: BufWriter, n: bigint) => w.writeU32LE(U32LE.fromBn(n)),
    readBE: (r: BufReader) => r.readU32BE(),
    writeBE: (w: BufWriter, n: bigint) => w.writeU32BE(U32BE.fromBn(n)),
  },
  {
    bits: 64,
    size: 8,
    copyProbe: (w: BufWriter, n: bigint) => {
      const value = U64LE.fromBn(n);
      w.writeU64LE(value);
      return value;
    },
    read: (r: BufReader) => r.readU64LE(),
    write: (w: BufWriter, n: bigint) => w.writeU64LE(U64LE.fromBn(n)),
    readBE: (r: BufReader) => r.readU64BE(),
    writeBE: (w: BufWriter, n: bigint) => w.writeU64BE(U64BE.fromBn(n)),
  },
  {
    bits: 128,
    size: 16,
    copyProbe: (w: BufWriter, n: bigint) => {
      const value = U128LE.fromBn(n);
      w.writeU128LE(value);
      return value;
    },
    read: (r: BufReader) => r.readU128LE(),
    write: (w: BufWriter, n: bigint) => w.writeU128LE(U128LE.fromBn(n)),
    readBE: (r: BufReader) => r.readU128BE(),
    writeBE: (w: BufWriter, n: bigint) => w.writeU128BE(U128BE.fromBn(n)),
  },
  {
    bits: 256,
    size: 32,
    copyProbe: (w: BufWriter, n: bigint) => {
      const value = U256LE.fromBn(n);
      w.writeU256LE(value);
      return value;
    },
    read: (r: BufReader) => r.readU256LE(),
    write: (w: BufWriter, n: bigint) => w.writeU256LE(U256LE.fromBn(n)),
    readBE: (r: BufReader) => r.readU256BE(),
    writeBE: (w: BufWriter, n: bigint) => w.writeU256BE(U256BE.fromBn(n)),
  },
];

for (const spec of widths) {
  describe(`U${spec.bits.toString()}LE sequential I/O`, () => {
    const bytes = Array.from({ length: spec.size }, (_, i) => i + 1);
    const pattern = BigInt(
      "0x" +
        [...bytes]
          .reverse()
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
    );
    const max = (1n << BigInt(spec.bits)) - 1n;
    for (const [name, value, expected] of [
      ["zero", 0n, Array<number>(spec.size).fill(0)],
      ["maximum", max, Array<number>(spec.size).fill(255)],
      ["asymmetric", pattern, bytes],
    ] as const) {
      it(`writes and reads independent ${name} vector`, () => {
        const writer = new BufWriter();
        expect(spec.write(writer, value)).toBe(writer);
        expect(writer.getLength()).toBe(spec.size);
        expect([...writer.toBuf().bytes]).toEqual(expected);
        const reader = new BufReader(WebBuf.fromArray([...expected]));
        expect(spec.read(reader).bn).toBe(value);
        expect(reader.pos).toBe(spec.size);
        expect(reader.eof()).toBe(true);
        expect(spec.read(new BufReader(writer.toBuf())).bn).toBe(value);
      });
    }
    it("shares only the selected input and retains the cursor on truncated reads", () => {
      const backing = WebBuf.fromArray([99, 98, 97, ...bytes, 96]);
      const selected = backing.subarray(2, 3 + spec.size);
      const reader = new BufReader(selected);
      reader.readU8();
      const value = spec.read(reader);
      expect(value.bn).toBe(pattern);
      expect(reader.pos).toBe(1 + spec.size);
      backing.bytes[3] = 42;
      expect(value.buf.buf.bytes[0]).toBe(42);
      value.buf.buf.bytes[spec.size - 1] = 43;
      expect(backing.bytes[2 + spec.size]).toBe(43);
      expect(backing.bytes[0]).toBe(99);
      for (let available = 0; available < spec.size; available++) {
        const truncated = new BufReader(
          WebBuf.fromArray([88, ...bytes.slice(0, available)]),
        );
        truncated.readU8();
        expect(() => spec.read(truncated)).toThrow(
          "not enough bytes in the buffer to read",
        );
        expect(truncated.pos).toBe(1);
      }
    });
    it("copies number output into the writer like its BE counterpart", () => {
      const writer = new BufWriter();
      const value = spec.copyProbe(writer, pattern);
      value.buf.buf.fill(0);
      expect([...writer.toBuf().bytes]).toEqual(bytes);
    });
  });
}

it("preserves offsets across a mixed-endian stream of every width", () => {
  const writer = new BufWriter();
  for (const spec of widths) {
    spec.writeBE(writer, 0x1234n);
    spec.write(writer, 0x1234n);
  }
  const reader = new BufReader(writer.toBuf());
  let pos = 0;
  for (const spec of widths) {
    expect(spec.readBE(reader).bn).toBe(0x1234n);
    expect(spec.read(reader).bn).toBe(0x1234n);
    pos += 2 * spec.size;
    expect(reader.pos).toBe(pos);
  }
  expect(reader.eof()).toBe(true);
  expect(writer.getLength()).toBe(pos);
});
