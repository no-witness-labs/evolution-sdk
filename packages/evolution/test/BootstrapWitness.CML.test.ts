import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as BootstrapWitness from "../src/BootstrapWitness.js"
import * as CBOR from "../src/CBOR.js"
import * as Ed25519Signature from "../src/Ed25519Signature.js"
import * as VKey from "../src/VKey.js"

// CML compatibility tests for BootstrapWitness

describe("BootstrapWitness CML Compatibility", () => {
  it("roundtrips with empty attributes (0xa0)", () => {
    const bw = new BootstrapWitness.BootstrapWitness({
      publicKey: VKey.fromBytes(new Uint8Array(32).fill(1)),
      signature: Ed25519Signature.fromBytes(new Uint8Array(64).fill(2)),
      chainCode: new Uint8Array(32).fill(3),
      attributes: new Uint8Array([]) // will encode to 0xa0 by our encoder
    })

    const hex = BootstrapWitness.toCBORHex(bw)
    const cml = CML.BootstrapWitness.from_cbor_hex(hex)
    expect(cml.to_cbor_hex()).toBe(hex)
  })

  it("roundtrips with derivation path attribute {1: bytes}", () => {
    const bw = new BootstrapWitness.BootstrapWitness({
      publicKey: VKey.fromBytes(new Uint8Array(32).fill(11)),
      signature: Ed25519Signature.fromBytes(new Uint8Array(64).fill(12)),
      chainCode: new Uint8Array(32).fill(13),
      attributes: (() => {
        // attributes = { 1: <bytes> } (Byron derivation path)
        const path = new Uint8Array([1, 2, 3, 4])
        const m = new Map<bigint, Uint8Array>()
        const inner = CBOR.internalEncodeSync(path, CBOR.CML_DEFAULT_OPTIONS)
        m.set(1n, inner)
        // encode Byron AddrAttributes map as CBOR bytes
        // Using CML_DEFAULT_OPTIONS as in production
        return CBOR.internalEncodeSync(m, CBOR.CML_DEFAULT_OPTIONS)
      })()
    })

    const hex = BootstrapWitness.toCBORHex(bw)
    const cml = CML.BootstrapWitness.from_cbor_hex(hex)
    expect(cml.to_cbor_hex()).toBe(hex)
  })

  it("property: Evolution BootstrapWitness CBOR is parseable by CML and roundtrips CBOR", () => {
    FastCheck.assert(
      FastCheck.property(BootstrapWitness.arbitrary, (bw) => {
        const hex = BootstrapWitness.toCBORHex(bw)
        const cml = CML.BootstrapWitness.from_cbor_hex(hex)
        expect(cml.to_cbor_hex()).toBe(hex)
      })
    )
  })
})
