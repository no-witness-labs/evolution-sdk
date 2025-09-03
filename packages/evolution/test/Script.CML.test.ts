import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as PlutusV1 from "../src/core/PlutusV1.js"
import * as PlutusV2 from "../src/core/PlutusV2.js"
import * as PlutusV3 from "../src/core/PlutusV3.js"
import * as Script from "../src/core/Script.js"
import * as ScriptHash from "../src/core/ScriptHash.js"

/**
 * CML compatibility test for Script CBOR serialization.
 *
 * This test ensures CBOR hex compatibility between the Evolution SDK and the
 * Cardano Multiplatform Library (CML). The purpose is to prove that both libraries
 * generate identical CBOR hex for the same script object.
 */
describe("Script CML Compatibility", () => {
  it("validates CBOR hex compatibility for PlutusV1 scripts", () => {
    // 1. Generate deterministic test data
    const testScriptBytes = new Uint8Array([0x59, 0x01, 0x35, 0x59, 0x01, 0x32, 0x01, 0x00, 0x00, 0x32, 0x32])

    // 2. Create Evolution SDK object
    const evolutionPlutusV1 = new PlutusV1.PlutusV1({ bytes: testScriptBytes })
    const evolutionScript: Script.Script = evolutionPlutusV1

    // 3. Create equivalent CML object
    const cmlPlutusV1Script = CML.PlutusV1Script.from_raw_bytes(testScriptBytes)
    const cmlScript = CML.Script.new_plutus_v1(cmlPlutusV1Script)

    // 4. Compare CBOR hex outputs
    const evolutionCbor = Script.toCBORHex(evolutionScript)
    const cmlCbor = cmlScript.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates CBOR hex compatibility for PlutusV2 scripts", () => {
    // 1. Generate deterministic test data
    const testScriptBytes = new Uint8Array([0x49, 0x48, 0x01, 0x00, 0x00, 0x22, 0x21, 0x20, 0x01, 0x01])

    // 2. Create Evolution SDK object
    const evolutionPlutusV2 = new PlutusV2.PlutusV2({ bytes: testScriptBytes })
    const evolutionScript: Script.Script = evolutionPlutusV2

    // 3. Create equivalent CML object
    const cmlPlutusV2Script = CML.PlutusV2Script.from_raw_bytes(testScriptBytes)
    const cmlScript = CML.Script.new_plutus_v2(cmlPlutusV2Script)

    // 4. Compare CBOR hex outputs
    const evolutionCbor = Script.toCBORHex(evolutionScript)
    const cmlCbor = cmlScript.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates CBOR hex compatibility for PlutusV3 scripts", () => {
    // 1. Generate deterministic test data
    const testScriptBytes = new Uint8Array([0x49, 0x48, 0x01, 0x00, 0x00, 0x22, 0x21, 0x20, 0x01, 0x01])

    // 2. Create Evolution SDK object
    const evolutionPlutusV3 = new PlutusV3.PlutusV3({ bytes: testScriptBytes })
    const evolutionScript: Script.Script = evolutionPlutusV3

    // 3. Create equivalent CML object
    const cmlPlutusV3Script = CML.PlutusV3Script.from_raw_bytes(testScriptBytes)
    const cmlScript = CML.Script.new_plutus_v3(cmlPlutusV3Script)

    // 4. Compare CBOR hex outputs
    const evolutionCbor = Script.toCBORHex(evolutionScript)
    const cmlCbor = cmlScript.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates CBOR hex compatibility for deterministic scripts", () => {
    // 1. Generate deterministic test data using FastCheck
    const testData = FastCheck.sample(Script.arbitrary, { seed: 42, numRuns: 1 })[0]

    // 2. Create Evolution SDK object
    const evolutionScript = testData

    // 3. Create equivalent CML object (match ALL properties and handle union types)
    const cmlScript = createEquivalentCMLScript(evolutionScript)

    // 4. Compare CBOR hex outputs
    const evolutionCbor = Script.toCBORHex(evolutionScript)
    const cmlCbor = cmlScript.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  // TODO: Investigate script hash differences between Evolution SDK and CML
  // The CBOR serialization matches perfectly, but script hash computation differs.
  // This needs further investigation of CML's script hash algorithm.
  it("validates script hash compatibility with CML", () => {
    // Test that script hashes match between Evolution SDK and CML
    const testScriptBytes = new Uint8Array([0x49, 0x48, 0x01, 0x00, 0x00, 0x22, 0x21, 0x20, 0x01, 0x01])

    // Create Evolution SDK PlutusV2 script
    const evolutionPlutusV2 = new PlutusV2.PlutusV2({ bytes: testScriptBytes })
    const evolutionScript: Script.Script = evolutionPlutusV2

    // Create equivalent CML script
    const cmlPlutusV2Script = CML.PlutusV2Script.from_raw_bytes(testScriptBytes)
    const cmlScript = CML.Script.new_plutus_v2(cmlPlutusV2Script)

    // Compare script hashes using ScriptHash module
    const evolutionScriptHash = ScriptHash.fromScript(evolutionScript)
    const cmlScriptHash = cmlScript.hash()

    // Convert Evolution hash to hex for comparison
    const evolutionHashHex = ScriptHash.toHex(evolutionScriptHash)

    // Convert CML hash to hex for comparison
    const cmlHashHex = cmlScriptHash.to_hex()

    // Current results show different hashes:
    // Evolution: '53582d8da6eee8751044cd2a3ffa34b22baa429728fd7be8334ad3e2'
    // CML:       'f14241393964259a53ca546af364e7f5688ca5aaa35f1e0da0f951b2'
    // This indicates different hash computation algorithms or input formatting

    expect(evolutionHashHex).toBe(cmlHashHex)
  })
})

/**
 * Helper function to create equivalent CML Script objects from Evolution SDK scripts.
 * Handles all union types by checking _tag properties and script types.
 */
function createEquivalentCMLScript(evolutionScript: Script.Script): CML.Script {
  // Handle native scripts (no _tag property, has type property)
  if ("type" in evolutionScript) {
    const cmlNativeScript = createEquivalentCMLNativeScript(evolutionScript)
    return CML.Script.new_native(cmlNativeScript)
  }

  // Handle Plutus scripts (with _tag property)
  if ("_tag" in evolutionScript) {
    switch (evolutionScript._tag) {
      case "PlutusV1":
        return CML.Script.new_plutus_v1(CML.PlutusV1Script.from_raw_bytes(evolutionScript.bytes))
      case "PlutusV2":
        return CML.Script.new_plutus_v2(CML.PlutusV2Script.from_raw_bytes(evolutionScript.bytes))
      case "PlutusV3":
        return CML.Script.new_plutus_v3(CML.PlutusV3Script.from_raw_bytes(evolutionScript.bytes))
      default:
        throw new Error(`Unknown Plutus script type: ${(evolutionScript as any)._tag}`)
    }
  }

  throw new Error("Invalid script structure")
}

/**
 * Helper function to create equivalent CML NativeScript objects.
 * Handles all native script types: sig, all, any, n_of_k, after, before.
 */
function createEquivalentCMLNativeScript(evolutionNativeScript: any): CML.NativeScript {
  switch (evolutionNativeScript.type) {
    case "sig": {
      // Convert hex string to bytes for Ed25519KeyHash
      const keyHashBytes = new Uint8Array(
        evolutionNativeScript.keyHash.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []
      )
      const ed25519KeyHash = CML.Ed25519KeyHash.from_raw_bytes(keyHashBytes)
      return CML.NativeScript.new_script_pubkey(ed25519KeyHash)
    }

    case "all": {
      const nativeScriptList = CML.NativeScriptList.new()
      if (evolutionNativeScript.scripts) {
        for (const script of evolutionNativeScript.scripts) {
          const cmlSubScript = createEquivalentCMLNativeScript(script)
          nativeScriptList.add(cmlSubScript)
        }
      }
      return CML.NativeScript.new_script_all(nativeScriptList)
    }

    case "any": {
      const nativeScriptList = CML.NativeScriptList.new()
      if (evolutionNativeScript.scripts) {
        for (const script of evolutionNativeScript.scripts) {
          const cmlSubScript = createEquivalentCMLNativeScript(script)
          nativeScriptList.add(cmlSubScript)
        }
      }
      return CML.NativeScript.new_script_any(nativeScriptList)
    }

    case "n_of_k": {
      const nativeScriptList = CML.NativeScriptList.new()
      if (evolutionNativeScript.scripts) {
        for (const script of evolutionNativeScript.scripts) {
          const cmlSubScript = createEquivalentCMLNativeScript(script)
          nativeScriptList.add(cmlSubScript)
        }
      }
      const n = evolutionNativeScript.required || 0
      return CML.NativeScript.new_script_n_of_k(n, nativeScriptList)
    }

    case "after": {
      const slot = BigInt(evolutionNativeScript.slot || 0)
      return CML.NativeScript.new_script_invalid_before(slot)
    }

    case "before": {
      const slot = BigInt(evolutionNativeScript.slot || 0)
      return CML.NativeScript.new_script_invalid_hereafter(slot)
    }

    default:
      throw new Error(`Unknown native script type: ${evolutionNativeScript.type}`)
  }
}
