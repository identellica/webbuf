/* @ts-self-types="./webbuf_mldsa.d.ts" */
import { wasm } from "./webbuf_mldsa_bg.wasm.js";
import { __wbg_set_wasm } from "./webbuf_mldsa_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    ml_dsa_44_keypair, ml_dsa_44_sign, ml_dsa_44_sign_hedged, ml_dsa_44_sign_internal, ml_dsa_44_verify, ml_dsa_44_verify_internal, ml_dsa_65_keypair, ml_dsa_65_sign, ml_dsa_65_sign_hedged, ml_dsa_65_sign_internal, ml_dsa_65_verify, ml_dsa_65_verify_internal, ml_dsa_87_keypair, ml_dsa_87_sign, ml_dsa_87_sign_hedged, ml_dsa_87_sign_internal, ml_dsa_87_verify, ml_dsa_87_verify_internal
} from "./webbuf_mldsa_bg.js";
