/* @ts-self-types="./webbuf_mlkem.d.ts" */
import * as wasm from "./webbuf_mlkem_bg.wasm";
import { __wbg_set_wasm } from "./webbuf_mlkem_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    ml_kem_1024_decapsulate, ml_kem_1024_encapsulate, ml_kem_1024_keypair, ml_kem_512_decapsulate, ml_kem_512_encapsulate, ml_kem_512_keypair, ml_kem_768_decapsulate, ml_kem_768_encapsulate, ml_kem_768_keypair
} from "./webbuf_mlkem_bg.js";
