# @webbuf/blake3

## WebBuf 4 byte access

Public inputs and outputs retain WebBuf/FixedBuf wrapper types. Use
`value.bytes` (WebBuf) or `value.buf.bytes` (FixedBuf) when calling native
array APIs yourself. This package unwraps selected byte views at its WASM
boundary; algorithms, output formats and existing input/output ownership
remain unchanged. Nonzero-offset views are supported without copying inputs.

BLAKE3 cryptographic hash and MAC, optimized with Rust/WASM.

## Installation

```bash
npm install @webbuf/blake3
```

## Usage

```typescript
import { blake3Hash, doubleBlake3Hash, blake3Mac } from "@webbuf/blake3";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

// Hash data
const data = WebBuf.fromUtf8("Hello, world!");
const hash = blake3Hash(data);
console.log(hash.toHex()); // 32-byte hash

// Double hash (hash of hash)
const doubleHash = doubleBlake3Hash(data);

// Keyed MAC (requires 32-byte key)
const key = FixedBuf.fromRandom<32>(32);
const mac = blake3Mac(key, data);
console.log(mac.toHex()); // 32-byte MAC
```

## API

| Function                                                   | Description          |
| ---------------------------------------------------------- | -------------------- |
| `blake3Hash(data: WebBuf): FixedBuf<32>`                   | Compute BLAKE3 hash  |
| `doubleBlake3Hash(data: WebBuf): FixedBuf<32>`             | Compute hash of hash |
| `blake3Mac(key: FixedBuf<32>, data: WebBuf): FixedBuf<32>` | Compute keyed MAC    |

## License

MIT
