import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as Credential from "../src/Credential.js"

describe("Credential CML Compatibility", () => {
  it("property: Evolution Credential CBOR is parseable by CML and roundtrips CBOR", () => {
    FastCheck.assert(
      FastCheck.property(Credential.arbitrary, (cred) => {
        const evoHex = Credential.toCBORHex(cred)
        const cml = CML.Credential.from_cbor_hex(evoHex)
        expect(cml.to_cbor_hex()).toBe(evoHex)
      })
    )
  })
})
