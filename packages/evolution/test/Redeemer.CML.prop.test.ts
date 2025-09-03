import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck, Schema } from "effect"
import { describe, expect, it } from "vitest"

import * as CBOR from "../src/core/CBOR.js"
import * as Redeemer from "../src/core/Redeemer.js"

describe("Redeemer CML Compatibility (property)", () => {
  it("Array of Redeemers encoded via Evolution CDDL is parseable by CML.Redeemers and roundtrips", () => {
    const redeemersArr = FastCheck.array(Redeemer.arbitrary, { maxLength: 5 })
    FastCheck.assert(
      FastCheck.property(redeemersArr, (redeemers) => {
        const encRedeemer = Schema.encodeSync(Redeemer.FromCDDL)
        const redeemersCbor = redeemers.map((r) => encRedeemer(r))
        const evoHex = CBOR.toCBORHex(redeemersCbor)

        // TODO: Add redeemer map modules, redeemer list is going to be deprecated
        const cmlRedeemers = CML.Redeemers.from_cbor_hex(evoHex)
        const cmlHex = cmlRedeemers.to_cbor_hex()
        expect(cmlHex).toBe(evoHex)
      })
    )
  })
})
