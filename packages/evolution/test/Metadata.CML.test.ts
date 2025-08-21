import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as AuxiliaryData from "../src/AuxiliaryData.js"
import * as TransactionMetadatum from "../src/TransactionMetadatum.js"

describe("Metadata CML Compatibility", () => {
  it("validates metadata CBOR parity when embedded in Conway AuxiliaryData", () => {
    // Evolution SDK metadata map
    const metadata = new Map<bigint, TransactionMetadatum.TransactionMetadatum>([
      [1n, TransactionMetadatum.text("Hello")],
      [2n, TransactionMetadatum.int(42n)]
    ])

    // Wrap metadata in Conway-format AuxiliaryData (CML has a stable parser for this)
    const aux = AuxiliaryData.conway({ metadata })
    const evolutionHex = AuxiliaryData.toCBORHex(aux)

    // Parse with CML and ensure identical CBOR hex
    const cmlAux = CML.ConwayFormatAuxData.from_cbor_hex(evolutionHex)
    const cmlHex = cmlAux.to_cbor_hex()

    expect(evolutionHex).toBe(cmlHex)
  })
})
