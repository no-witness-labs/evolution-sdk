import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as TransactionOutput from "../src/TransactionOutput.js"

describe("TransactionOutput CML Compatibility", () => {
  it("property: Evolution SDK CBOR matches CML CBOR for any generated TransactionOutput", () => {
    FastCheck.assert(
      FastCheck.property(TransactionOutput.arbitrary(), (evOut) => {
        const evCbor = TransactionOutput.toCBORHex(evOut)
        const cmlOut = CML.TransactionOutput.from_cbor_hex(evCbor)
        const cmlCbor = cmlOut.to_cbor_hex()
        expect(evCbor).toBe(cmlCbor)
      }),
      { numRuns: 10, seed: 123 }
    )
  })
})
