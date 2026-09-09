/* @ts-self-types="./webbuf_blake3.d.ts" */
import { wasm } from "./webbuf_blake3_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_blake3_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    blake3_hash, blake3_mac, double_blake3_hash
} from "./webbuf_blake3_bg.js";
