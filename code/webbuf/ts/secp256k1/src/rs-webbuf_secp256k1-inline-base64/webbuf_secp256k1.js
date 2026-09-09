/* @ts-self-types="./webbuf_secp256k1.d.ts" */
import { wasm } from "./webbuf_secp256k1_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_secp256k1_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    private_key_add, private_key_verify, public_key_add, public_key_create, public_key_verify, shared_secret, sign, verify
} from "./webbuf_secp256k1_bg.js";
