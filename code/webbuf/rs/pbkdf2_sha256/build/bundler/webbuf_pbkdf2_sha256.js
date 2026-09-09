/* @ts-self-types="./webbuf_pbkdf2_sha256.d.ts" */
import * as wasm from "./webbuf_pbkdf2_sha256_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_pbkdf2_sha256_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    pbkdf2_sha256
} from "./webbuf_pbkdf2_sha256_bg.js";
