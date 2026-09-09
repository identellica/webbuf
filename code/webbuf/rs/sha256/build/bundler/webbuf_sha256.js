/* @ts-self-types="./webbuf_sha256.d.ts" */
import * as wasm from "./webbuf_sha256_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_sha256_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    double_sha256_hash, sha256_hash, sha256_hmac
} from "./webbuf_sha256_bg.js";
