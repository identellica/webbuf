/* tslint:disable */
/* eslint-disable */

export function aes_decrypt(key: Uint8Array, data: Uint8Array): Uint8Array;

export function aes_encrypt(key: Uint8Array, data: Uint8Array): Uint8Array;

export function aescbc_decrypt(ciphertext: Uint8Array, aes_key: Uint8Array, iv: Uint8Array): Uint8Array;

export function aescbc_encrypt(plaintext: Uint8Array, aes_key: Uint8Array, iv: Uint8Array): Uint8Array;
