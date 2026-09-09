/* @ts-self-types="./webbuf_p256.d.ts" */
import * as wasm from "./webbuf_p256_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_p256_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    private_key_add, private_key_verify, public_key_add, public_key_compress, public_key_create, public_key_decompress, public_key_verify, shared_secret, shared_secret_raw, sign, verify
} from "./webbuf_p256_bg.js";
