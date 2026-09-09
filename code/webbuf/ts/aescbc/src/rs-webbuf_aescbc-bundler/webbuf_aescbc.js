/* @ts-self-types="./webbuf_aescbc.d.ts" */
import * as wasm from "./webbuf_aescbc_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_aescbc_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    aes_decrypt, aes_encrypt, aescbc_decrypt, aescbc_encrypt
} from "./webbuf_aescbc_bg.js";
