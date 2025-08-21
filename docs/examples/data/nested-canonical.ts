// @title: Canonical nested structure
// @description: Complex nested Data encoding with canonical CBOR options.
import assert from "node:assert/strict"
import { CBOR, Data } from "@evolution-sdk/evolution"

// #region main
const nestedUnsortedData = new Data.Constr({
  index: 1n,
  fields: [
    new Data.Constr({
      index: 0n,
      fields: [new Data.Constr({ index: 2n, fields: [] })]
    }),
    new Map<Data.Data, Data.Data>([
      ["deadbeef01", new Data.Constr({ index: 0n, fields: [] })],
      ["beef", 19n],
      ["deadbeef03", new Data.Constr({ index: 1n, fields: [] })]
    ]),
    [10n, 5n, 2n, 3n, 1n, 4n]
  ]
})

const cborHex = Data.toCBORHex(nestedUnsortedData)
const decoded = Data.fromCBORHex(cborHex)
const canonicalCborHex = Data.toCBORHex(nestedUnsortedData, CBOR.CANONICAL_OPTIONS)

assert.deepStrictEqual(decoded, nestedUnsortedData)
// #endregion main
