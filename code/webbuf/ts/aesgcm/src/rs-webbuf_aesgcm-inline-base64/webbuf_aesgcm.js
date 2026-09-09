/* @ts-self-types="./webbuf_aesgcm.d.ts" */
import { wasm } from "./webbuf_aesgcm_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_aesgcm_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    aesgcm_decrypt, aesgcm_encrypt
} from "./webbuf_aesgcm_bg.js";
