import {
  ripemd160_hash,
  double_ripemd160_hash,
} from "./rs-webbuf_ripemd160-inline-base64/webbuf_ripemd160.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

export function ripemd160Hash(buf: WebBuf): FixedBuf<20> {
  const hash = ripemd160_hash(buf);
  return FixedBuf.fromBuf(20, WebBuf.fromUint8Array(hash));
}

export function doubleRipemd160Hash(buf: WebBuf): FixedBuf<20> {
  const hash = double_ripemd160_hash(buf);
  return FixedBuf.fromBuf(20, WebBuf.fromUint8Array(hash));
}
