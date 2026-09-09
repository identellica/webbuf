/* @ts-self-types="./webbuf_x25519.d.ts" */
import { wasm } from "./webbuf_x25519_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_x25519_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    x25519_public_key_create, x25519_shared_secret_raw
} from "./webbuf_x25519_bg.js";
