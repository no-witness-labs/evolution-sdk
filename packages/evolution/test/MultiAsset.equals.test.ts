import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as MultiAsset from "../src/core/MultiAsset.js"

describe("MultiAsset property tests", () => {
  it("round-trips via CBOR and preserves equality", () => {
    FastCheck.assert(
      FastCheck.property(MultiAsset.arbitrary, (ma) => {
        const hex = MultiAsset.toCBORHex(ma)
        const decoded = MultiAsset.fromCBORHex(hex)
        expect(MultiAsset.equals(ma, decoded)).toBe(true)
      })
    )
  })
})
