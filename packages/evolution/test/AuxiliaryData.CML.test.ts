import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as AuxiliaryData from "../src/AuxiliaryData.js"

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

  it("validates auxiliary data with native scripts - Conway format compatibility", () => {
    // Create a simple native script (sig script) - use 28 bytes for Ed25519KeyHash
    const keyHashBytes = new Uint8Array(28).fill(0x42) // 28 bytes of 0x42

    const evolutionNativeScript = {
      type: "sig" as const,
      keyHash: Array.from(keyHashBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    }

    const cmlNativeScript = CML.NativeScript.new_script_pubkey(CML.Ed25519KeyHash.from_raw_bytes(keyHashBytes))

    // Create auxiliary data with native scripts
    const evolutionAuxData = AuxiliaryData.conway({
      nativeScripts: [evolutionNativeScript]
    })

    const cmlNativeScriptList = CML.NativeScriptList.new()
    cmlNativeScriptList.add(cmlNativeScript)

    const cmlAuxData = CML.ConwayFormatAuxData.new()
    cmlAuxData.set_native_scripts(cmlNativeScriptList)

    // Compare CBOR outputs - these should be identical in Conway format
    const evolutionCbor = AuxiliaryData.toCBORHex(evolutionAuxData)
    const cmlCbor = cmlAuxData.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates auxiliary data with multiple native scripts - Conway format compatibility", () => {
    // Create multiple native scripts with 28-byte hashes
    const keyHash1 = new Uint8Array(28).fill(0x42)
    const keyHash2 = new Uint8Array(28).fill(0x24)

    const evolutionScript1 = {
      type: "sig" as const,
      keyHash: Array.from(keyHash1)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    }

    const evolutionScript2 = {
      type: "sig" as const,
      keyHash: Array.from(keyHash2)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    }

    const cmlScript1 = CML.NativeScript.new_script_pubkey(CML.Ed25519KeyHash.from_raw_bytes(keyHash1))

    const cmlScript2 = CML.NativeScript.new_script_pubkey(CML.Ed25519KeyHash.from_raw_bytes(keyHash2))

    // Create auxiliary data with native scripts
    const evolutionAuxData = AuxiliaryData.conway({
      nativeScripts: [evolutionScript1, evolutionScript2]
    })

    const cmlNativeScriptList = CML.NativeScriptList.new()
    cmlNativeScriptList.add(cmlScript1)
    cmlNativeScriptList.add(cmlScript2)

    const cmlAuxData = CML.ConwayFormatAuxData.new()
    cmlAuxData.set_native_scripts(cmlNativeScriptList)

    // Compare CBOR outputs - these should be identical in Conway format
    const evolutionCbor = AuxiliaryData.toCBORHex(evolutionAuxData)
    const cmlCbor = cmlAuxData.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })
})
