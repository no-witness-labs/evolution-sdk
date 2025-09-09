import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as Transaction from "../src/core/Transaction.js"

/**
 * CML compatibility test for full Transaction CBOR serialization.
 *
 * Validates Evolution SDK Transaction CBOR matches CML's encoding and
 * roundtrips through both libraries.
 */
describe("Transaction CML Compatibility", () => {
  it("property: Evolution Transaction CBOR equals CML and roundtrips", () => {
    FastCheck.assert(
      FastCheck.property(Transaction.arbitrary, (evoTx) => {
        // Evolution -> CBOR hex
        const evoHex = Transaction.toCBORHex(evoTx)
        // CML parses it
        const cmlTx = CML.Transaction.from_cbor_hex(evoHex)
        // CML -> CBOR hex
        const cmlHex = cmlTx.to_cbor_hex()
        // Equality on hex
        expect(cmlHex).toBe(evoHex)
        // Roundtrip back into Evolution and compare (let failures throw)
        const evoBack = Transaction.fromCBORHex(cmlHex)
        expect(Transaction.equals(evoBack, evoTx)).toBe(true)
      })
    )
  })
})
