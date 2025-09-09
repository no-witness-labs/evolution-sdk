import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as AuxiliaryData from "../src/core/AuxiliaryData.js"

/**
 * CML compatibility test for AuxiliaryData CBOR serialization.
 *
 * This test validates that the Evolution SDK produces identical CBOR output
 * to the Cardano Multiplatform Library (CML) when both use Conway format.
 *
 * CML automatically switches between era formats, but we force it to use
 * Conway format with .as_conway() to ensure true one-to-one compatibility.
 */
describe("AuxiliaryData CML Compatibility", () => {
  it("validates empty auxiliary data compatibility", () => {
    // Both CML Conway format and Evolution SDK use Conway format (map) for empty auxiliary data
    const evolutionAuxData = AuxiliaryData.empty()
    const cmlAuxData = CML.ConwayFormatAuxData.new()

    // Compare CBOR outputs - these should be identical in Conway format
    const evolutionCbor = AuxiliaryData.toCBORHex(evolutionAuxData)
    const cmlCbor = cmlAuxData.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("property: Evolution SDK CBOR matches CML CBOR for any generated AuxiliaryData", () => {
    FastCheck.assert(
      FastCheck.property(AuxiliaryData.arbitrary, (evolutionAuxData) => {
        // Evolution → CBOR hex
        const evolutionCbor = AuxiliaryData.toCBORHex(evolutionAuxData)

        // CBOR hex → CML (ensures parity)
        const cmlAux = CML.AuxiliaryData.from_cbor_hex(evolutionCbor)
        const cmlCbor = cmlAux.to_cbor_hex()

        // Evolution and CML CBOR must match
        expect(evolutionCbor).toBe(cmlCbor)

        const decoded = AuxiliaryData.fromCBORHex(cmlCbor)
        expect(AuxiliaryData.equals(decoded, evolutionAuxData)).toBe(true)
      })
    )
  })

  it("property: ShelleyMAAuxiliaryData  ", () => {
    FastCheck.assert(
      FastCheck.property(AuxiliaryData.shelleyMAArbitrary, (evolutionAuxData) => {
        // Evolution → CBOR hex
        const evolutionCbor = AuxiliaryData.toCBORHex(evolutionAuxData)

        // CBOR hex → CML (ensures parity)
        const cmlAux = CML.ShelleyMAFormatAuxData.from_cbor_hex(evolutionCbor)
        const cmlCbor = cmlAux.to_cbor_hex()

        // Evolution and CML CBOR must match
        expect(evolutionCbor).toBe(cmlCbor)

        const decoded = AuxiliaryData.fromCBORHex(cmlCbor)
        expect(AuxiliaryData.equals(decoded, evolutionAuxData)).toBe(true)
      })
    )
  })

  it("property: ShelleyAuxiliaryData", () => {
    FastCheck.assert(
      FastCheck.property(AuxiliaryData.shelleyArbitrary, (evolutionAuxData) => {
        // Evolution → CBOR hex
        const evolutionCbor = AuxiliaryData.toCBORHex(evolutionAuxData)

        // CBOR hex → CML (ensures parity)
        const cmlAux = CML.AuxiliaryData.from_cbor_hex(evolutionCbor)
        const cmlCbor = cmlAux.to_cbor_hex()

        // Evolution and CML CBOR must match
        expect(evolutionCbor).toBe(cmlCbor)

        const decoded = AuxiliaryData.fromCBORHex(cmlCbor)
        expect(AuxiliaryData.equals(decoded, evolutionAuxData)).toBe(true)
      })
    )
  })
})
