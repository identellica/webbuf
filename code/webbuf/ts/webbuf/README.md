# @webbuf/webbuf

Byte-buffer wrapper with base64/hex encoding, optimized with Rust/WASM.

## WebBuf 4 migration

WebBuf **has** a native `Uint8Array`; it no longer extends one. Access mutable
bytes with `buf.bytes[i]` and pass `buf.bytes` to Web Crypto, TextDecoder,
Node Buffer, WASM and other native-array APIs. WebBuf is not an ArrayBuffer
view and cannot be passed as a `BufferSource` itself. The `bytes` property is
readonly in TypeScript; the bytes themselves remain mutable.

`length`, `byteLength`, `byteOffset`, `buffer`, iteration and named WebBuf
encoding/compare/mutation helpers remain available. Use `.bytes` for other
native typed-array methods instead of relying on inherited methods.

| Operation                                                          | Storage behavior                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| `new WebBuf(length)` / `alloc`                                     | Allocate ordinary ArrayBuffer storage                 |
| `new WebBuf(arrayLikeOrIterable)` / `fromUint8Array` / `fromArray` | Copy                                                  |
| `new WebBuf(arrayBuffer, offset?, length?)`                        | View the selected backing storage                     |
| `view(arrayOrWebBuf)`                                              | Share selected bytes, preserving offset and length    |
| `from(arrayOrWebBuf)` without mapper                               | Share (preserved behavior)                            |
| `from(input, mapper)`                                              | Mapped copy, including native-array and WebBuf inputs |
| `slice` / `clone` / `toReverse`                                    | Independent copy                                      |
| `subarray` / `read`                                                | Shared view                                           |

Stored arrays always use ordinary `ArrayBuffer` backing. SharedArrayBuffer
views cannot be wrapped: explicitly copy with `fromUint8Array(sharedView)` or
`new WebBuf(sharedView)`. Native-array subclasses such as Node Buffer are
normalized to a plain Uint8Array view when wrapping, without copying storage.

`fill` uses native Uint8Array coercion, including negative indices and byte
value normalization. A mapper supplied to `from` is honored for native arrays
instead of being ignored. `wipe`, `set`, `write`, `reverse` and `fill` mutate
shared storage; `copy` handles overlapping regions.

This is the in-progress WebBuf 4 source contract. Coordinated release metadata
and publication follow the full consumer migration; no intermediate release
is intended.

## Installation

```bash
npm install @webbuf/webbuf
```

## Usage

```typescript
import { WebBuf } from "@webbuf/webbuf";

// Create from various sources
const backing = new Uint8Array([0xee, 72, 105, 0xff]);
const selected = WebBuf.view(backing.subarray(1, 3));
new TextDecoder().decode(selected.bytes); // "Hi", not the sentinels
const shared = selected.subarray(0, 1);
const copied = selected.slice(0, 1);
shared.bytes[0] = 66;
selected.toUtf8(); // "Bi": subarray shares storage
copied.toUtf8(); // "H": slice owns a copy
selected instanceof Uint8Array; // false
ArrayBuffer.isView(selected); // false

const buf1 = WebBuf.alloc(32);
const buf2 = WebBuf.fromHex("deadbeef");
const buf3 = WebBuf.fromBase64("SGVsbG8=");
const buf4 = WebBuf.fromUtf8("Hello, world!");
const buf5 = WebBuf.fromArray([1, 2, 3, 4]);

// Convert to strings
buf2.toHex(); // "deadbeef"
buf3.toBase64(); // "SGVsbG8="
buf4.toUtf8(); // "Hello, world!"

// Buffer operations
const combined = WebBuf.concat([buf1, buf2]);
const cloned = buf1.clone();
const reversed = buf1.toReverse();

// Comparison
buf1.equals(buf2); // false
buf1.compare(buf2); // -1, 0, or 1
```

## API

### Static Methods

| Method                       | Description                   |
| ---------------------------- | ----------------------------- |
| `WebBuf.alloc(size, fill?)`  | Allocate buffer of given size |
| `WebBuf.concat(list)`        | Concatenate multiple buffers  |
| `WebBuf.fromUint8Array(arr)` | Create from Uint8Array        |
| `WebBuf.fromArray(arr)`      | Create from number array      |
| `WebBuf.fromHex(hex)`        | Create from hex string        |
| `WebBuf.fromBase64(b64)`     | Create from base64 string     |
| `WebBuf.fromUtf8(str)`       | Create from UTF-8 string      |

### Instance Methods

| Method                   | Description              |
| ------------------------ | ------------------------ |
| `toHex()`                | Convert to hex string    |
| `toBase64()`             | Convert to base64 string |
| `toUtf8()`               | Convert to UTF-8 string  |
| `clone()`                | Create a copy            |
| `toReverse()`            | Create reversed copy     |
| `equals(other)`          | Check equality           |
| `compare(other)`         | Compare (-1, 0, 1)       |
| `slice(start?, end?)`    | Get slice as WebBuf      |
| `subarray(start?, end?)` | Get subarray as WebBuf   |

## License

MIT
