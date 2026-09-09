import {
  encode_base64,
  decode_base64,
  decode_base64_strip_whitespace,
  encode_hex,
  decode_hex,
  encode_base32_crockford,
  decode_base32_crockford,
  encode_base32_rfc4648,
  decode_base32_rfc4648,
  encode_base32_rfc4648_lower,
  decode_base32_rfc4648_lower,
  encode_base32_rfc4648_hex,
  decode_base32_rfc4648_hex,
  encode_base32_rfc4648_hex_lower,
  decode_base32_rfc4648_hex_lower,
  encode_base32_z,
  decode_base32_z,
} from "./rs-webbuf-inline-base64/webbuf.js";

/**
 * Base32 alphabet types matching the Rust base32 crate
 */
export type Base32Alphabet =
  | "Crockford"
  | "Rfc4648"
  | "Rfc4648Lower"
  | "Rfc4648Hex"
  | "Rfc4648HexLower"
  | "Z";

/**
 * Options for base32 encoding/decoding
 */
export interface Base32Options {
  /**
   * The alphabet to use for encoding/decoding.
   * @default "Crockford"
   */
  alphabet?: Base32Alphabet;
  /**
   * Whether to use padding (only applies to Rfc4648* alphabets).
   * @default true
   */
  padding?: boolean;
}

function verifyOffset(offset: number, ext: number, length: number) {
  if (offset % 1 !== 0 || offset < 0) {
    throw new Error("offset is not uint");
  }
  if (offset + ext > length) {
    throw new Error("Trying to access beyond buffer length");
  }
}

// Intrinsic getters validate internal slots across realms, unlike instanceof.
function isArrayBuffer(value: unknown): value is ArrayBuffer {
  try {
    Reflect.get(ArrayBuffer.prototype, "byteLength", value);
    return true;
  } catch {
    return false;
  }
}

function isSharedArrayBuffer(value: unknown): boolean {
  if (typeof SharedArrayBuffer === "undefined") return false;
  try {
    Reflect.get(SharedArrayBuffer.prototype, "byteLength", value);
    return true;
  } catch {
    return false;
  }
}

export class WebBuf implements Iterable<number> {
  readonly bytes: Uint8Array<ArrayBuffer>;

  constructor(
    source: number | ArrayBuffer | ArrayLike<number> | Iterable<number> = 0,
    byteOffset?: number,
    length?: number,
  ) {
    if (typeof source === "number") {
      this.bytes = new Uint8Array(source);
    } else if (isArrayBuffer(source)) {
      this.bytes = new Uint8Array(source, byteOffset, length);
    } else if (isSharedArrayBuffer(source)) {
      throw new TypeError(
        "SharedArrayBuffer storage requires an explicit copy",
      );
    } else {
      this.bytes = Uint8Array.from(Array.from(source));
    }
  }

  get length(): number {
    return this.bytes.length;
  }
  get byteLength(): number {
    return this.bytes.byteLength;
  }
  get byteOffset(): number {
    return this.bytes.byteOffset;
  }
  get buffer(): ArrayBuffer {
    return this.bytes.buffer;
  }
  [Symbol.iterator](): IterableIterator<number> {
    return this.bytes.values();
  }

  set(source: ArrayLike<number> | WebBuf, offset = 0): void {
    this.bytes.set(source instanceof WebBuf ? source.bytes : source, offset);
  }

  static concat(list: (Uint8Array | WebBuf)[]) {
    const size = list.reduce((acc, buf) => acc + buf.length, 0);
    const result = new WebBuf(size);
    let offset = 0;
    for (const buf of list) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }

  static alloc(size: number, fill = 0) {
    const buf = new WebBuf(size);
    if (fill !== 0) {
      buf.fill(fill);
    }
    return buf;
  }

  fill(value: number, start = 0, end = this.length) {
    this.bytes.fill(value, start, end);
    return this;
  }

  // slice copies; subarray shares the selected storage.
  slice(start?: number, end?: number): WebBuf {
    const slicedArray = this.bytes.slice(start, end);
    return new WebBuf(
      slicedArray.buffer,
      slicedArray.byteOffset,
      slicedArray.byteLength,
    ); // Return a WebBuf instead
  }

  subarray(start?: number, end?: number): WebBuf {
    const subArray = this.bytes.subarray(start, end);
    return new WebBuf(
      subArray.buffer,
      subArray.byteOffset,
      subArray.byteLength,
    );
  }

  /**
   * Reverse the buffer in place
   * @returns webbuf
   */
  reverse(): this {
    this.bytes.reverse();
    return this;
  }

  clone() {
    return new WebBuf(this);
  }

  toReverse() {
    const cloned = new WebBuf(this);
    cloned.reverse();
    return cloned;
  }

  copy(
    target: WebBuf,
    targetStart = 0,
    sourceStart = 0,
    sourceEnd = this.length,
  ) {
    if (sourceStart >= sourceEnd) {
      return 0;
    }
    if (targetStart >= target.length) {
      throw new Error("targetStart out of bounds");
    }
    if (sourceEnd > this.length) {
      throw new Error("sourceEnd out of bounds");
    }
    if (targetStart + sourceEnd - sourceStart > target.length) {
      throw new Error("source is too large");
    }

    target.set(this.subarray(sourceStart, sourceEnd), targetStart);
    return sourceEnd - sourceStart;
  }

  /**
   * Return a WebBuf that is a view of the same data as the input Uint8Array
   *
   * @param buffer
   * @returns WebBuf
   */
  static view(buffer: Uint8Array | WebBuf): WebBuf {
    if (!isArrayBuffer(buffer.buffer)) {
      throw new TypeError(
        "SharedArrayBuffer storage requires an explicit copy",
      );
    }
    return new WebBuf(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }

  /**
   * Create a new WebBuf from a Uint8Array (copy)
   * @param buffer
   * @returns webbuf
   */
  static fromUint8Array(buffer: Uint8Array) {
    return new WebBuf(buffer);
  }

  static fromArray(array: number[]) {
    return new WebBuf(array);
  }

  static fromUtf8(str: string) {
    const encoder = new TextEncoder();
    return new WebBuf(encoder.encode(str));
  }

  static fromString(str: string, encoding: "utf8" | "hex" | "base64" = "utf8") {
    if (encoding === "hex") {
      return WebBuf.fromHex(str);
    }
    if (encoding === "base64") {
      return WebBuf.fromBase64(str);
    }
    return WebBuf.fromUtf8(str);
  }

  // we use wasm for big data, because small data is faster in js

  // experiments show wasm is always faster
  static FROM_BASE64_ALGO_THRESHOLD = 10; // str len

  // experiments show wasm is always faster
  static TO_BASE64_ALGO_THRESHOLD = 10; // buf len

  // experimentally derived for optimal performance
  static FROM_HEX_ALGO_THRESHOLD = 1_000; // str len

  // experiments show wasm is always faster
  static TO_HEX_ALGO_THRESHOLD = 10; // buf len

  static fromHexPureJs(hex: string): WebBuf {
    const result = new WebBuf(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      result.bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
    }
    return result;
  }

  static fromHexWasm(hex: string): WebBuf {
    const uint8array = decode_hex(hex);
    return WebBuf.view(uint8array);
  }

  static fromHex(hex: string): WebBuf {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string");
    }
    if (hex.length < WebBuf.FROM_HEX_ALGO_THRESHOLD) {
      return WebBuf.fromHexPureJs(hex);
    }
    return WebBuf.fromHexWasm(hex);
  }

  toHexPureJs(): string {
    return Array.from(this)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  toHexWasm(): string {
    return encode_hex(this.bytes);
  }

  toHex(): string {
    // disabled: experiments show this is not faster, even for small buffers
    // if (this.length < WebBuf.TO_HEX_ALGO_THRESHOLD) {
    //   return this.toHexPureJs();
    // }
    return this.toHexWasm();
  }

  static fromBase64PureJs(b64: string, stripWhitespace = false): WebBuf {
    const uint8array = new Uint8Array(
      atob(stripWhitespace ? b64.replace(/\s+/g, "") : b64)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    return WebBuf.view(uint8array);
  }

  static fromBase64Wasm(b64: string, stripWhitespace = false): WebBuf {
    const uint8array = stripWhitespace
      ? decode_base64_strip_whitespace(b64)
      : decode_base64(b64);
    return WebBuf.view(uint8array);
  }

  /**
   * Convert a base64 string to a Uint8Array. Tolerant of whitespace, but
   * throws if the string has invalid characters.
   *
   * @param b64
   * @returns Uint8Array
   * @throws {Error} if the input string is not valid base64
   */
  static fromBase64(b64: string, stripWhitespace = false): WebBuf {
    // disabled: experiments show this is not faster, even for small buffers
    // if (b64.length < WebBuf.FROM_BASE64_ALGO_THRESHOLD) {
    //   return WebBuf.fromBase64PureJs(b64, stripWhitespace);
    // }
    return WebBuf.fromBase64Wasm(b64, stripWhitespace);
  }

  toBase64PureJs(): string {
    return btoa(String.fromCharCode(...this.bytes));
  }

  toBase64Wasm(): string {
    return encode_base64(this.bytes);
  }

  toBase64() {
    // disabled: experiments show this is not faster, even for small buffers
    // if (this.length < WebBuf.TO_BASE64_ALGO_THRESHOLD) {
    //   return this.toBase64PureJs();
    // }
    return this.toBase64Wasm();
  }

  /**
   * Encode this buffer as a base32 string.
   *
   * @param options - Options for encoding
   * @param options.alphabet - The alphabet to use (default: "Crockford")
   * @param options.padding - Whether to use padding for Rfc4648* alphabets (default: true)
   * @returns The base32 encoded string
   */
  toBase32(options?: Base32Options): string {
    const alphabet = options?.alphabet ?? "Crockford";
    const padding = options?.padding ?? true;

    switch (alphabet) {
      case "Crockford":
        return encode_base32_crockford(this.bytes);
      case "Rfc4648":
        return encode_base32_rfc4648(this.bytes, padding);
      case "Rfc4648Lower":
        return encode_base32_rfc4648_lower(this.bytes, padding);
      case "Rfc4648Hex":
        return encode_base32_rfc4648_hex(this.bytes, padding);
      case "Rfc4648HexLower":
        return encode_base32_rfc4648_hex_lower(this.bytes, padding);
      case "Z":
        return encode_base32_z(this.bytes);
    }
  }

  /**
   * Create a WebBuf from a base32 encoded string.
   *
   * @param str - The base32 encoded string
   * @param options - Options for decoding
   * @param options.alphabet - The alphabet to use (default: "Crockford")
   * @param options.padding - Whether the string uses padding for Rfc4648* alphabets (default: true)
   * @returns The decoded WebBuf
   */
  static fromBase32(str: string, options?: Base32Options): WebBuf {
    const alphabet = options?.alphabet ?? "Crockford";
    const padding = options?.padding ?? true;

    let uint8array: Uint8Array;
    switch (alphabet) {
      case "Crockford":
        uint8array = decode_base32_crockford(str);
        break;
      case "Rfc4648":
        uint8array = decode_base32_rfc4648(str, padding);
        break;
      case "Rfc4648Lower":
        uint8array = decode_base32_rfc4648_lower(str, padding);
        break;
      case "Rfc4648Hex":
        uint8array = decode_base32_rfc4648_hex(str, padding);
        break;
      case "Rfc4648HexLower":
        uint8array = decode_base32_rfc4648_hex_lower(str, padding);
        break;
      case "Z":
        uint8array = decode_base32_z(str);
        break;
    }
    return WebBuf.view(uint8array);
  }

  /**
   * Wrap native arrays/WebBuf without a mapper; otherwise create a copy.
   *
   * @param source An array-like or iterable object to convert to WebBuf
   * @param mapFn Optional map function to call on every element of the array
   * @param thisArg Optional value to use as `this` when executing `mapFn`
   * @returns WebBuf
   */
  static from(
    source: ArrayLike<number> | Iterable<number> | string,
    mapFn?: ((v: number, k: number) => number) | string,
    thisArg?: unknown,
  ): WebBuf {
    if (typeof mapFn === "string") {
      if (typeof source !== "string") {
        throw new TypeError("Invalid mapFn");
      }
      if (mapFn === "hex") {
        return WebBuf.fromHex(source);
      }
      if (mapFn === "base64") {
        return WebBuf.fromBase64(source);
      }
      if (mapFn === "utf8") {
        return WebBuf.fromUtf8(source);
      }
      throw new TypeError("Invalid mapFn");
    }
    if (typeof source === "string") {
      return WebBuf.fromUtf8(source);
    }
    if (
      (source instanceof Uint8Array || source instanceof WebBuf) &&
      mapFn === undefined
    ) {
      return WebBuf.view(source);
    }
    const sourceArray = Array.from(source);
    const uint8Array = Uint8Array.from(sourceArray, mapFn, thisArg);
    return new WebBuf(
      uint8Array.buffer,
      uint8Array.byteOffset,
      uint8Array.byteLength,
    );
  }

  toUtf8(): string {
    const decoder = new TextDecoder();
    return decoder.decode(this.bytes);
  }

  toString(encoding?: "utf8" | "hex" | "base64") {
    if (encoding === "hex") {
      return this.toHex();
    }
    if (encoding === "base64") {
      return this.toBase64();
    }
    if (encoding === "utf8") {
      const decoder = new TextDecoder();
      return decoder.decode(this.bytes);
    }
    return this.toUtf8();
  }

  inspect() {
    return `<WebBuf ${this.toHex().slice(0, 40) + (this.length > 40 ? "..." : "")}>`;
  }

  toArray() {
    return Array.from(this);
  }

  compare(other: WebBuf): number {
    const len = Math.min(this.length, other.length);

    for (let i = 0; i < len; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const a = this.bytes[i]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const b = other.bytes[i]!;
      if (a !== b) {
        return a < b ? -1 : 1;
      }
    }

    if (this.length < other.length) {
      return -1;
    }
    if (this.length > other.length) {
      return 1;
    }

    return 0;
  }

  static compare(buf1: WebBuf, buf2: WebBuf): number {
    return buf1.compare(buf2);
  }

  equals(other: WebBuf): boolean {
    return this.compare(other) === 0;
  }

  write(buf: WebBuf, offset = 0): number {
    verifyOffset(offset, buf.length, this.length);
    this.set(buf, offset);
    return buf.length;
  }

  read(offset: number, ext: number): WebBuf {
    verifyOffset(offset, ext, this.length);
    return this.subarray(offset, offset + ext);
  }

  /**
   * Securely wipe the buffer by filling it with zeros.
   *
   * Call this method before releasing references to buffers containing
   * sensitive data (keys, passwords, etc.) to minimize the window where
   * sensitive data remains in memory.
   *
   * Note: This is a best-effort security measure. JavaScript's JIT compiler
   * may optimize away the write if it detects the buffer isn't read afterward,
   * and copies of the data may exist elsewhere in memory.
   */
  wipe(): void {
    this.fill(0);
  }
}
