# @webbuf/sha256

## WebBuf 4 byte access

Public inputs and outputs retain WebBuf/FixedBuf wrapper types. Use
`value.bytes` (WebBuf) or `value.buf.bytes` (FixedBuf) when calling native
array APIs yourself. This package unwraps selected byte views at its WASM
boundary; algorithms, output formats and existing input/output ownership
remain unchanged. Nonzero-offset views are supported without copying inputs.

SHA-256 hash and HMAC-SHA256, optimized with Rust/WASM.

## Installation

```bash
npm install @webbuf/sha256
```

## Usage

```typescript
import { sha256Hash, doubleSha256Hash, sha256Hmac } from "@webbuf/sha256";
import { WebBuf } from "@webbuf/webbuf";

// SHA-256 hash
const data = WebBuf.fromUtf8("abc");
const hash = sha256Hash(data);
console.log(hash.toHex());
// "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"

// Double SHA-256 (used in Bitcoin)
const doubleHash = doubleSha256Hash(data);

// HMAC-SHA256
const key = WebBuf.fromUtf8("secret key");
const message = WebBuf.fromUtf8("message");
const mac = sha256Hmac(key, message);
console.log(mac.toHex()); // 32-byte HMAC
```

## API

| Function                                                 | Description                    |
| -------------------------------------------------------- | ------------------------------ |
| `sha256Hash(data: WebBuf): FixedBuf<32>`                 | Compute SHA-256 hash           |
| `doubleSha256Hash(data: WebBuf): FixedBuf<32>`           | Compute SHA-256(SHA-256(data)) |
| `sha256Hmac(key: WebBuf, message: WebBuf): FixedBuf<32>` | Compute HMAC-SHA256            |

## License

MIT
