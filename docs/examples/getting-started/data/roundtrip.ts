// @title: Roundtrip encode/decode
// @description: Encode a Data value to CBOR hex and decode back.
// #region main
import assert from "node:assert/strict"
import { CBOR, Data } from "@evolution-sdk/evolution"

const original = new Data.Constr({ index: 0n, fields: ["beef", 19n] })
const hexCbor = Data.toCBORHex(original, CBOR.CANONICAL_OPTIONS)
const back = Data.fromCBORHex(hexCbor)
assert.deepStrictEqual(back, original)
// #endregion main
