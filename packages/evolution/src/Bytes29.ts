import { pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export const BYTES_LENGTH = 29
export const HEX_LENGTH = 58

export const BytesSchema = pipe(
  Schema.Uint8ArrayFromSelf,
  Schema.filter((a) => a.length === BYTES_LENGTH, {
    message: (issue) => `${issue.actual} must be a byte array of length ${BYTES_LENGTH}, but got ${issue.actual}`,
    identifier: "Bytes29.Bytes"
  })
)

export const HexSchema = pipe(
  Bytes.HexSchema,
  Schema.filter((a) => a.length === HEX_LENGTH, {
    message: (issue) => `${issue.actual} must be a hex string of length ${HEX_LENGTH}, but got ${issue.actual}`,
    identifier: "Bytes29.Hex"
  })
)

export const BytesFromHex = Schema.transform(HexSchema, BytesSchema, {
  strict: true,
  decode: (toI) => Bytes.Codec.Encode.bytes(toI),
  encode: (fromA) => Bytes.Codec.Decode.bytes(fromA)
})
