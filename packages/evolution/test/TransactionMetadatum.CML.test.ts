import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as TransactionMetadatum from "../src/core/TransactionMetadatum.js"

describe("TransactionMetadatum CML Compatibility", () => {
  it("validates text metadatum compatibility", () => {
    // Create a simple text metadatum
    const evolutionMetadatum = TransactionMetadatum.text("Hello World")
    const cmlMetadatum = CML.TransactionMetadatum.new_text("Hello World")

    // Compare CBOR outputs
    const evolutionCbor = TransactionMetadatum.toCBORHex(evolutionMetadatum)
    const cmlCborBytes = cmlMetadatum.to_cbor_bytes()
    const cmlCbor = Array.from(cmlCborBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates int metadatum compatibility", () => {
    // Create a simple integer metadatum
    const evolutionMetadatum = TransactionMetadatum.int(42n)
    const cmlMetadatum = CML.TransactionMetadatum.new_int(CML.Int.new(42n))

    // Compare CBOR outputs
    const evolutionCbor = TransactionMetadatum.toCBORHex(evolutionMetadatum)
    const cmlCborBytes = cmlMetadatum.to_cbor_bytes()
    const cmlCbor = Array.from(cmlCborBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    expect(evolutionCbor).toBe(cmlCbor)
  })
})
