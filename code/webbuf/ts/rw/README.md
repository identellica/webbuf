# @webbuf/rw

Buffer reader and writer for sequential binary I/O.

## WebBuf 4

Reader/writer APIs accept WebBuf wrappers; use `.bytes` at native-array edges.
`read`, `readFixed` and `readRemainder` return copies. Numeric reads retain
selected input views, so later input mutation changes those numeric values.
The writer constructor and `write` retain input bytes; each `toBuf` concatenates
into an independent copy. Wire encodings, including the existing big-endian
CompactSize variant, are unchanged.

## Installation

```bash
npm install @webbuf/rw
```

## Usage

### Writing Data

```typescript
import { BufWriter } from "@webbuf/rw";
import {
  U8,
  U16BE,
  U32BE,
  U64BE,
  U16LE,
  U32LE,
  U64LE,
  U128LE,
  U256LE,
} from "@webbuf/numbers";
import { FixedBuf } from "@webbuf/fixedbuf";

const writer = new BufWriter();

// Write numbers
writer.writeU8(U8.fromN(255));
writer.writeU16BE(U16BE.fromN(1000));
writer.writeU32BE(U32BE.fromN(123456));
writer.writeU64BE(U64BE.fromBn(0x123456789abcdef0n));

// Write fixed buffers
const hash = FixedBuf.fromRandom<32>(32);
writer.write(hash.buf);

// Write variable-length data
writer.writeVarIntU64BE(U64BE.fromBn(1000n));

// Fixed-width little-endian fields (not varints)
writer.writeU16LE(U16LE.fromN(1000));
writer.writeU32LE(U32LE.fromN(123456));
writer.writeU64LE(U64LE.fromBn(0x123456789abcdef0n));
writer.writeU128LE(U128LE.fromBn(1n << 100n));
writer.writeU256LE(U256LE.fromBn(1n << 200n));

// Get result
const buf = writer.toBuf();
```

### Reading Data

```typescript
import { BufReader } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";

const data = WebBuf.fromHex(
  "ff03e80001e240123456789abcdef0" + "00".repeat(32) + "fd03e8",
);
const reader = new BufReader(data);

// Read numbers
const u8 = reader.readU8();
const u16 = reader.readU16BE();
const u32 = reader.readU32BE();
const u64 = reader.readU64BE();

// Read fixed buffers
const hash = reader.readFixed<32>(32);

// Read variable-length data
const varInt = reader.readVarIntU64BE();

// Check remaining
reader.eof(); // true if at end
reader.readRemainder(); // remaining bytes as WebBuf
```

### Little-endian reading

```typescript
import { BufReader } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";

const reader = new BufReader(
  WebBuf.fromHex(
    "0100" +
      "02000000" +
      "0300000000000000" +
      "04" +
      "00".repeat(15) +
      "05" +
      "00".repeat(31),
  ),
);
reader.readU16LE().n; // 1
reader.readU32LE().n; // 2
reader.readU64LE().bn; // 3n
reader.readU128LE().bn; // 4n
reader.readU256LE().bn; // 5n
```

LE methods use the corresponding LE number class. Writers return `this` for
chaining and copy numeric bytes when called. Numeric readers share the selected
input bytes and advance by the fixed width only after a successful read; a short
read throws without advancing. U8 has no endian distinction. For large exact
values use `bigint`: `.n` can lose precision. Numeric `toHex()` displays the
value; `toLEBuf().toHex()` displays little-endian wire bytes.

Fixed-width LE, the existing **big-endian CompactSize variant**, Bitcoin's
little-endian CompactSize encoding, and protobuf LEB128 are distinct encodings.
The existing `*VarInt*BE` methods remain unchanged. Do not use them in place of
protobuf tags/lengths or TermSurf's fixed four-byte LE frame header.

## API

### BufWriter

| Method                  | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `writeU8(val)`          | Write 8-bit unsigned                              |
| `writeU16BE(val)`       | Write 16-bit big-endian                           |
| `writeU32BE(val)`       | Write 32-bit big-endian                           |
| `writeU64BE(val)`       | Write 64-bit big-endian                           |
| `writeU128BE(val)`      | Write 128-bit big-endian                          |
| `writeU256BE(val)`      | Write 256-bit big-endian                          |
| `writeU16LE(val)`       | Write 16-bit little-endian                        |
| `writeU32LE(val)`       | Write 32-bit little-endian                        |
| `writeU64LE(val)`       | Write 64-bit little-endian                        |
| `writeU128LE(val)`      | Write 128-bit little-endian                       |
| `writeU256LE(val)`      | Write 256-bit little-endian                       |
| `write(buf)`            | Write WebBuf bytes (use `fixed.buf` for FixedBuf) |
| `writeVarIntU64BE(val)` | Write variable-length integer                     |
| `toBuf()`               | Get result as WebBuf                              |

### BufReader

| Method               | Description                  |
| -------------------- | ---------------------------- |
| `readU8()`           | Read 8-bit unsigned          |
| `readU16BE()`        | Read 16-bit big-endian       |
| `readU32BE()`        | Read 32-bit big-endian       |
| `readU64BE()`        | Read 64-bit big-endian       |
| `readU128BE()`       | Read 128-bit big-endian      |
| `readU256BE()`       | Read 256-bit big-endian      |
| `readU16LE()`        | Read 16-bit little-endian    |
| `readU32LE()`        | Read 32-bit little-endian    |
| `readU64LE()`        | Read 64-bit little-endian    |
| `readU128LE()`       | Read 128-bit little-endian   |
| `readU256LE()`       | Read 256-bit little-endian   |
| `readFixed<N>(size)` | Read fixed-size buffer       |
| `readVarIntU64BE()`  | Read variable-length integer |
| `eof()`              | Check if at end              |
| `readRemainder()`    | Read remaining bytes         |

## License

MIT
