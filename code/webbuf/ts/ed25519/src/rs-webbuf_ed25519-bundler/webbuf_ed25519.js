/* @ts-self-types="./webbuf_ed25519.d.ts" */
import * as wasm from "./webbuf_ed25519_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_ed25519_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    ed25519_public_key_create, ed25519_sign, ed25519_verify
} from "./webbuf_ed25519_bg.js";
