/* @ts-self-types="./webbuf_ripemd160.d.ts" */
import * as wasm from "./webbuf_ripemd160_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_ripemd160_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    double_ripemd160_hash, ripemd160_hash
} from "./webbuf_ripemd160_bg.js";
