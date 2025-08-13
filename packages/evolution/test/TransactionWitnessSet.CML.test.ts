import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as Ed25519Signature from "../src/Ed25519Signature.js"
import * as NativeScripts from "../src/NativeScripts.js"
import * as PlutusV1 from "../src/PlutusV1.js"
import * as PlutusV2 from "../src/PlutusV2.js"
import * as TransactionWitnessSet from "../src/TransactionWitnessSet.js"
import * as VKey from "../src/VKey.js"

/**
 * CML compatibility test for TransactionWitnessSet CBOR serialization.
 * 
 * This test validates that the Evolution SDK produces CBOR that is functionally
 * compatible with the Cardano Multiplatform Library (CML), even if the exact
 * hex encoding differs due to different CBOR tag usage.
 */
describe("TransactionWitnessSet CML Compatibility", () => {
  it("validates empty witness set CBOR hex compatibility", () => {
    // Create empty witness sets
    const evolutionWitnessSet = TransactionWitnessSet.empty()
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    
    // Compare CBOR hex outputs - should be identical for empty sets
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates encoding a single VKey witness", () => {
    // Create test key and signature data
    const publicKeyBytes = new Uint8Array(32).fill(2)
    const signatureBytes = new Uint8Array(64).fill(3)
    
    // Create Evolution SDK witness set
    const evolutionVKey = VKey.fromBytes(publicKeyBytes)
    const evolutionSignature = Ed25519Signature.fromBytes(signatureBytes)
    const evolutionVKeyWitness = new TransactionWitnessSet.VKeyWitness({
      vkey: evolutionVKey,
      signature: evolutionSignature
    })
    const evolutionWitnessSet = TransactionWitnessSet.fromVKeyWitnesses([evolutionVKeyWitness])
    
    // Create equivalent CML witness set
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    const cmlVkeyWitnessList = CML.VkeywitnessList.new()
    const cmlPublicKey = CML.PublicKey.from_bytes(publicKeyBytes)
    const cmlSignature = CML.Ed25519Signature.from_raw_bytes(signatureBytes)
    const cmlVkeyWitness = CML.Vkeywitness.new(cmlPublicKey, cmlSignature)
    cmlVkeyWitnessList.add(cmlVkeyWitness)
    cmlWitnessSet.set_vkeywitnesses(cmlVkeyWitnessList)
    
    // Convert both to CBOR and compare
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    // Check if they're identical (this is the goal)
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates encoding multiple VKey witnesses", () => {
    // Create test key and signature data for multiple witnesses
    const witness1PublicKey = new Uint8Array(32).fill(10)
    const witness1Signature = new Uint8Array(64).fill(11)
    const witness2PublicKey = new Uint8Array(32).fill(20)
    const witness2Signature = new Uint8Array(64).fill(21)
    
    // Create Evolution SDK witness set with multiple witnesses
    const evolutionVKey1 = VKey.fromBytes(witness1PublicKey)
    const evolutionSignature1 = Ed25519Signature.fromBytes(witness1Signature)
    const evolutionVKeyWitness1 = new TransactionWitnessSet.VKeyWitness({
      vkey: evolutionVKey1,
      signature: evolutionSignature1
    })
    
    const evolutionVKey2 = VKey.fromBytes(witness2PublicKey)
    const evolutionSignature2 = Ed25519Signature.fromBytes(witness2Signature)
    const evolutionVKeyWitness2 = new TransactionWitnessSet.VKeyWitness({
      vkey: evolutionVKey2,
      signature: evolutionSignature2
    })
    
    const evolutionWitnessSet = TransactionWitnessSet.fromVKeyWitnesses([evolutionVKeyWitness1, evolutionVKeyWitness2])
    
    // Create equivalent CML witness set with multiple witnesses
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    const cmlVkeyWitnessList = CML.VkeywitnessList.new()
    
    const cmlPublicKey1 = CML.PublicKey.from_bytes(witness1PublicKey)
    const cmlSignature1 = CML.Ed25519Signature.from_raw_bytes(witness1Signature)
    const cmlVkeyWitness1 = CML.Vkeywitness.new(cmlPublicKey1, cmlSignature1)
    
    const cmlPublicKey2 = CML.PublicKey.from_bytes(witness2PublicKey)
    const cmlSignature2 = CML.Ed25519Signature.from_raw_bytes(witness2Signature)
    const cmlVkeyWitness2 = CML.Vkeywitness.new(cmlPublicKey2, cmlSignature2)
    
    cmlVkeyWitnessList.add(cmlVkeyWitness1)
    cmlVkeyWitnessList.add(cmlVkeyWitness2)
    cmlWitnessSet.set_vkeywitnesses(cmlVkeyWitnessList)
    
    // Convert both to CBOR and compare
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    // Check if they're identical
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates encoding Plutus V1 scripts", () => {
    // Create test script data
    const scriptBytes = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05])
    
    // Create Evolution SDK witness set with Plutus V1 script
    const evolutionPlutusV1Script = new PlutusV1.PlutusV1({
      script: scriptBytes
    })
    const evolutionWitnessSet = new TransactionWitnessSet.TransactionWitnessSet({
      plutusV1Scripts: [evolutionPlutusV1Script]
    })
    
    // Create equivalent CML witness set with Plutus V1 script
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    const cmlPlutusV1Scripts = CML.PlutusV1ScriptList.new()
    const cmlPlutusV1Script = CML.PlutusV1Script.from_raw_bytes(scriptBytes)
    cmlPlutusV1Scripts.add(cmlPlutusV1Script)
    cmlWitnessSet.set_plutus_v1_scripts(cmlPlutusV1Scripts)
    
    // Convert both to CBOR and compare
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    // Check if they're identical
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates encoding Plutus V2 scripts", () => {
    // Create test script data
    const scriptBytes = new Uint8Array([0x10, 0x20, 0x30, 0x40, 0x50])
    
    // Create Evolution SDK witness set with Plutus V2 script
    const evolutionPlutusV2Script = new PlutusV2.PlutusV2({
      script: scriptBytes
    })
    const evolutionWitnessSet = new TransactionWitnessSet.TransactionWitnessSet({
      plutusV2Scripts: [evolutionPlutusV2Script]
    })
    
    // Create equivalent CML witness set with Plutus V2 script
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    const cmlPlutusV2Scripts = CML.PlutusV2ScriptList.new()
    const cmlPlutusV2Script = CML.PlutusV2Script.from_raw_bytes(scriptBytes)
    cmlPlutusV2Scripts.add(cmlPlutusV2Script)
    cmlWitnessSet.set_plutus_v2_scripts(cmlPlutusV2Scripts)
    
    // Convert both to CBOR and compare
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    // Check if they're identical
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates encoding mixed witness types", () => {
    // Create test data for mixed witness types
    const publicKeyBytes = new Uint8Array(32).fill(7)
    const signatureBytes = new Uint8Array(64).fill(8)
    const scriptBytes = new Uint8Array([0xA1, 0xB2, 0xC3])
    
    // Create Evolution SDK witness set with mixed types
    const evolutionVKey = VKey.fromBytes(publicKeyBytes)
    const evolutionSignature = Ed25519Signature.fromBytes(signatureBytes)
    const evolutionVKeyWitness = new TransactionWitnessSet.VKeyWitness({
      vkey: evolutionVKey,
      signature: evolutionSignature
    })
    const evolutionPlutusV1Script = new PlutusV1.PlutusV1({
      script: scriptBytes
    })
    
    const evolutionWitnessSet = new TransactionWitnessSet.TransactionWitnessSet({
      vkeyWitnesses: [evolutionVKeyWitness],
      plutusV1Scripts: [evolutionPlutusV1Script]
    })
    
    // Create equivalent CML witness set with mixed types
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    
    // Add VKey witness
    const cmlVkeyWitnessList = CML.VkeywitnessList.new()
    const cmlPublicKey = CML.PublicKey.from_bytes(publicKeyBytes)
    const cmlSignature = CML.Ed25519Signature.from_raw_bytes(signatureBytes)
    const cmlVkeyWitness = CML.Vkeywitness.new(cmlPublicKey, cmlSignature)
    cmlVkeyWitnessList.add(cmlVkeyWitness)
    cmlWitnessSet.set_vkeywitnesses(cmlVkeyWitnessList)
    
    // Add Plutus V1 script
    const cmlPlutusV1Scripts = CML.PlutusV1ScriptList.new()
    const cmlPlutusV1Script = CML.PlutusV1Script.from_raw_bytes(scriptBytes)
    cmlPlutusV1Scripts.add(cmlPlutusV1Script)
    cmlWitnessSet.set_plutus_v1_scripts(cmlPlutusV1Scripts)
    
    // Convert both to CBOR and compare
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    // Check if they're identical
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates encoding native scripts", () => {
    // Create test data for native script (simple pubkey script)  
    const publicKeyHashBytes = new Uint8Array(28).fill(25)
    const publicKeyHashHex = Array.from(publicKeyHashBytes, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // Create Evolution SDK witness set with native script
    const evolutionNativeScript = NativeScripts.make({
      type: "sig",
      keyHash: publicKeyHashHex
    })
    
    const evolutionWitnessSet = new TransactionWitnessSet.TransactionWitnessSet({
      nativeScripts: [evolutionNativeScript]
    })
    
    // Create equivalent CML witness set with native script
    const cmlWitnessSet = CML.TransactionWitnessSet.new()
    const cmlNativeScriptList = CML.NativeScriptList.new()
    const cmlKeyHash = CML.Ed25519KeyHash.from_raw_bytes(publicKeyHashBytes)
    const cmlNativeScript = CML.NativeScript.new_script_pubkey(cmlKeyHash)
    cmlNativeScriptList.add(cmlNativeScript)
    cmlWitnessSet.set_native_scripts(cmlNativeScriptList)
    
    // Convert both to CBOR and compare
    const evolutionCbor = TransactionWitnessSet.toCBORHex(evolutionWitnessSet)
    const cmlCbor = cmlWitnessSet.to_cbor_hex()
    
    // Check if they're identical
    expect(evolutionCbor).toBe(cmlCbor)
  })
})
