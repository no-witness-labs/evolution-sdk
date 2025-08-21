import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as NativeScripts from "../src/NativeScripts.js"

describe("NativeScripts CML Compatibility", () => {
  it("validates native script sig compatibility", () => {
    // Create a simple native script (sig script) - use 28 bytes for Ed25519KeyHash
    const keyHashBytes = new Uint8Array(28).fill(0x42) // 28 bytes of 0x42

    const evolutionNativeScript = {
      type: "sig" as const,
      keyHash: Array.from(keyHashBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    }

    const cmlNativeScript = CML.NativeScript.new_script_pubkey(CML.Ed25519KeyHash.from_raw_bytes(keyHashBytes))

    // Compare CBOR outputs
    const evolutionCbor = NativeScripts.toCBORHex(evolutionNativeScript)
    const cmlCbor = cmlNativeScript.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })
})
