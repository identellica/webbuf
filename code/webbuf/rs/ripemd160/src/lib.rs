use ripemd::{Ripemd160, Digest};

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn ripemd160_hash(data: &[u8]) -> Result<Vec<u8>, String> {
    let mut hasher = Ripemd160::new();
    hasher.update(data);
    Ok(hasher.finalize().to_vec())
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn double_ripemd160_hash(data: &[u8]) -> Result<Vec<u8>, String> {
    let first_hash = ripemd160_hash(data)?;
    ripemd160_hash(&first_hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex::{decode, encode};

    #[test]
    fn test_hash() {
        let pub_key_hex = "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
        let expected_pkh_hex = "5a95f9ebad92d7d0c145d835af4cecd73afd987e";

        let pub_key = decode(pub_key_hex).expect("Decoding failed");
        let expected_pkh = decode(expected_pkh_hex).expect("Decoding failed");

        let pkh = ripemd160_hash(&pub_key).unwrap();
        let pkh_hex = encode(&pkh);
        let expected_pkh_hex = encode(&expected_pkh);

        assert_eq!(pkh_hex, expected_pkh_hex);
    }

    #[test]
    fn test_double_hash() {
        let pub_key_hex = "0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628";
        let expected_pkh_hex = "604c8206367d357d6a58d98d402bc49785da34c3";

        let pub_key = decode(pub_key_hex).expect("Decoding failed");
        let expected_pkh = decode(expected_pkh_hex).expect("Decoding failed");

        let pkh = double_ripemd160_hash(&pub_key).unwrap();
        let pkh_hex = encode(&pkh);
        let expected_pkh_hex = encode(&expected_pkh);

        assert_eq!(pkh_hex, expected_pkh_hex);
    }
}
