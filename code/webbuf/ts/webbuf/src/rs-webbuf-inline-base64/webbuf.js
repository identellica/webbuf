/* @ts-self-types="./webbuf.d.ts" */
import { wasm } from "./webbuf_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    decode_base32_crockford, decode_base32_rfc4648, decode_base32_rfc4648_hex, decode_base32_rfc4648_hex_lower, decode_base32_rfc4648_lower, decode_base32_z, decode_base64, decode_base64_strip_whitespace, decode_hex, encode_base32_crockford, encode_base32_rfc4648, encode_base32_rfc4648_hex, encode_base32_rfc4648_hex_lower, encode_base32_rfc4648_lower, encode_base32_z, encode_base64, encode_hex
} from "./webbuf_bg.js";
