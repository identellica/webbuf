import { describe, expect, it } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

function selected(value: WebBuf): WebBuf {
  return WebBuf.concat([
    WebBuf.fromHex("99"),
    value,
    WebBuf.fromHex("88"),
  ]).subarray(1, value.length + 1);
}
function selectedFixed<N extends number>(value: FixedBuf<N>): FixedBuf<N> {
  return FixedBuf.fromBuf(value._size, selected(value.buf));
}
import * as api from "../src/index.js";
import * as native from "../src/rs-webbuf_slhdsa-inline-base64/webbuf_slhdsa.js";
describe("all SLH-DSA selected-byte boundaries", () => {
  it("Sha2-128s retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(16, 1)),
      selectedFixed(FixedBuf.alloc(16, 2)),
      selectedFixed(FixedBuf.alloc(16, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaSha2_128sKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_sha2_128s_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(16, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaSha2_128sSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_128s_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaSha2_128sVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaSha2_128sVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaSha2_128sVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaSha2_128sSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_128s_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaSha2_128sVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Sha2-128f retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(16, 1)),
      selectedFixed(FixedBuf.alloc(16, 2)),
      selectedFixed(FixedBuf.alloc(16, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaSha2_128fKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_sha2_128f_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(16, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaSha2_128fSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_128f_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaSha2_128fVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaSha2_128fVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaSha2_128fVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaSha2_128fSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_128f_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaSha2_128fVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Sha2-192s retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(24, 1)),
      selectedFixed(FixedBuf.alloc(24, 2)),
      selectedFixed(FixedBuf.alloc(24, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaSha2_192sKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_sha2_192s_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(24, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaSha2_192sSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_192s_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaSha2_192sVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaSha2_192sVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaSha2_192sVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaSha2_192sSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_192s_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaSha2_192sVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Sha2-192f retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(24, 1)),
      selectedFixed(FixedBuf.alloc(24, 2)),
      selectedFixed(FixedBuf.alloc(24, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaSha2_192fKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_sha2_192f_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(24, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaSha2_192fSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_192f_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaSha2_192fVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaSha2_192fVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaSha2_192fVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaSha2_192fSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_192f_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaSha2_192fVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Sha2-256s retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(32, 1)),
      selectedFixed(FixedBuf.alloc(32, 2)),
      selectedFixed(FixedBuf.alloc(32, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaSha2_256sKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_sha2_256s_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(32, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaSha2_256sSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_256s_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaSha2_256sVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaSha2_256sVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaSha2_256sVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaSha2_256sSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_256s_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaSha2_256sVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Sha2-256f retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(32, 1)),
      selectedFixed(FixedBuf.alloc(32, 2)),
      selectedFixed(FixedBuf.alloc(32, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaSha2_256fKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_sha2_256f_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(32, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaSha2_256fSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_256f_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaSha2_256fVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaSha2_256fVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaSha2_256fVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaSha2_256fSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_sha2_256f_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaSha2_256fVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Shake-128s retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(16, 1)),
      selectedFixed(FixedBuf.alloc(16, 2)),
      selectedFixed(FixedBuf.alloc(16, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaShake_128sKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_shake_128s_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(16, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaShake_128sSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_128s_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaShake_128sVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaShake_128sVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaShake_128sVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaShake_128sSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_128s_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaShake_128sVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Shake-128f retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(16, 1)),
      selectedFixed(FixedBuf.alloc(16, 2)),
      selectedFixed(FixedBuf.alloc(16, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaShake_128fKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_shake_128f_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(16, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaShake_128fSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_128f_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaShake_128fVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaShake_128fVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaShake_128fVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaShake_128fSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_128f_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaShake_128fVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Shake-192s retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(24, 1)),
      selectedFixed(FixedBuf.alloc(24, 2)),
      selectedFixed(FixedBuf.alloc(24, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaShake_192sKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_shake_192s_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(24, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaShake_192sSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_192s_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaShake_192sVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaShake_192sVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaShake_192sVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaShake_192sSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_192s_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaShake_192sVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Shake-192f retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(24, 1)),
      selectedFixed(FixedBuf.alloc(24, 2)),
      selectedFixed(FixedBuf.alloc(24, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaShake_192fKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_shake_192f_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(24, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaShake_192fSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_192f_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaShake_192fVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaShake_192fVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaShake_192fVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaShake_192fSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_192f_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaShake_192fVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Shake-256s retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(32, 1)),
      selectedFixed(FixedBuf.alloc(32, 2)),
      selectedFixed(FixedBuf.alloc(32, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaShake_256sKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_shake_256s_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(32, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaShake_256sSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_256s_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaShake_256sVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaShake_256sVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaShake_256sVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaShake_256sSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_256s_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaShake_256sVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
  it("Shake-256f retains exact native bytes for every boundary", () => {
    const seeds = [
      selectedFixed(FixedBuf.alloc(32, 1)),
      selectedFixed(FixedBuf.alloc(32, 2)),
      selectedFixed(FixedBuf.alloc(32, 3)),
    ] as const;
    const seedsBefore = seeds.map((v) => v.toHex());
    const kp = api.slhDsaShake_256fKeyPairDeterministic(...seeds);
    expect(seeds.map((v) => v.toHex())).toEqual(seedsBefore);
    const rawKey = native.slh_dsa_shake_256f_keypair(
      seeds[0].buf.bytes,
      seeds[1].buf.bytes,
      seeds[2].buf.bytes,
    );
    expect(
      WebBuf.concat([kp.verifyingKey.buf, kp.signingKey.buf]).toHex(),
    ).toBe(WebBuf.fromUint8Array(rawKey).toHex());
    const sk = selectedFixed(kp.signingKey),
      vk = selectedFixed(kp.verifyingKey);
    const message = selected(WebBuf.fromUtf8("message")),
      context = selected(WebBuf.fromUtf8("context"));
    const rnd = selectedFixed(FixedBuf.alloc(32, 4));
    const inputs = [
      ...seeds.map((v) => v.buf),
      sk.buf,
      vk.buf,
      message,
      context,
      rnd.buf,
    ];
    const before = inputs.map((v) => v.toHex());
    const sig = api.slhDsaShake_256fSignDeterministic(sk, message, context);
    expect(sig.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_256f_sign(
          sk.buf.bytes,
          message.bytes,
          context.bytes,
          new Uint8Array(),
        ),
      ).toHex(),
    );
    const selectedSig = selectedFixed(sig);
    expect(api.slhDsaShake_256fVerify(vk, message, selectedSig, context)).toBe(
      true,
    );
    expect(
      api.slhDsaShake_256fVerify(
        vk,
        message,
        selectedSig,
        selected(WebBuf.fromUtf8("wrong")),
      ),
    ).toBe(false);
    expect(
      api.slhDsaShake_256fVerify(
        vk,
        selected(WebBuf.fromUtf8("wrong")),
        selectedSig,
        context,
      ),
    ).toBe(false);
    const internal = api.slhDsaShake_256fSignInternal(sk, message, rnd);
    expect(internal.toHex()).toBe(
      WebBuf.fromUint8Array(
        native.slh_dsa_shake_256f_sign_internal(
          sk.buf.bytes,
          message.bytes,
          rnd.buf.bytes,
        ),
      ).toHex(),
    );
    expect(
      api.slhDsaShake_256fVerifyInternal(vk, message, selectedFixed(internal)),
    ).toBe(true);
    expect(inputs.map((v) => v.toHex())).toEqual(before);
    expect(selectedSig.toHex()).toBe(sig.toHex());
    const outputs = [
      kp.verifyingKey.buf,
      kp.signingKey.buf,
      sig.buf,
      internal.buf,
    ];
    const outputBefore = outputs.map((v) => v.toHex());
    for (const input of inputs) input.wipe();
    selectedSig.wipe();
    expect(outputs.map((v) => v.toHex())).toEqual(outputBefore);
  }, 120000);
});
