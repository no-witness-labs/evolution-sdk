import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as ProtocolParamUpdate from "../src/core/ProtocolParamUpdate.js"

describe("ProtocolParamUpdate CML Compatibility", () => {
  it("Empty ProtocolParamUpdate works with CML", () => {
    // Test empty ProtocolParamUpdate
    const empty = ProtocolParamUpdate.ProtocolParamUpdate.make({})
    const emptyHex = ProtocolParamUpdate.toCBORHex(empty)

    // Test CML compatibility
    const cmlEmpty = CML.ProtocolParamUpdate.new()
    const cmlEmptyHex = cmlEmpty.to_cbor_hex()

    expect(emptyHex).toBe(cmlEmptyHex)

    // Test CML can parse our CBOR
    expect(() => CML.ProtocolParamUpdate.from_cbor_hex(emptyHex)).not.toThrow()
  })

  it("Simple ProtocolParamUpdate fields work with CML", () => {
    // Test with simple numeric fields only
    const simple = ProtocolParamUpdate.ProtocolParamUpdate.make({
      minfeeA: 44n,
      minfeeB: 155381n,
      maxBlockBodySize: 90112n,
      maxTxSize: 16384n
    })

    const simpleHex = ProtocolParamUpdate.toCBORHex(simple)

    // Test Evolution roundtrip
    const roundTrip = ProtocolParamUpdate.fromCBORHex(simpleHex)
    expect(roundTrip._tag).toBe("ProtocolParamUpdate")

    // Test CML can parse our CBOR
    expect(() => CML.ProtocolParamUpdate.from_cbor_hex(simpleHex)).not.toThrow()
  })

  it("ProtocolParamUpdate arbitrary (property test)", () => {
    FastCheck.assert(
      FastCheck.property(ProtocolParamUpdate.arbitrary, (ppu) => {
        const hex = ProtocolParamUpdate.toCBORHex(ppu)

        const cml = CML.ProtocolParamUpdate.from_cbor_hex(hex)
        expect(cml.to_cbor_hex()).toBe(hex)
      })
    )
  })
})
