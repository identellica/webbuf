/* @ts-self-types="./webbuf_aescbc.d.ts" */
import { wasm } from "./webbuf_aescbc_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_aescbc_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    aes_decrypt, aes_encrypt, aescbc_decrypt, aescbc_encrypt
} from "./webbuf_aescbc_bg.js";
