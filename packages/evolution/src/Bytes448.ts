import { pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export const BYTES_LENGTH = 448
export const HEX_LENGTH = 896

export const BytesSchema = pipe(
  Schema.Uint8ArrayFromSelf,
  Schema.filter((a) => a.length === BYTES_LENGTH, {
    message: (issue) => `${issue.actual} must be a byte array of length ${BYTES_LENGTH}, but got ${issue.actual}`,
    identifier: "Bytes448.Bytes"
  })
)

export const HexSchema = pipe(
  Bytes.HexSchema,
  Schema.filter((a) => a.length === HEX_LENGTH, {
    message: (issue) => `${issue.actual} must be a hex string of length ${HEX_LENGTH}, but got ${issue.actual}`,
    identifier: "Bytes448.Hex"
  })
)

export const FromHex = Schema.transform(HexSchema, BytesSchema, {
  strict: true,
  decode: (toI) => Bytes.Codec.Encode.bytes(toI),
  encode: (fromA) => Bytes.Codec.Decode.bytes(fromA)
})

export const FromBytes = Schema.transform(BytesSchema, HexSchema, {
  strict: true,
  encode: (toI) => Bytes.Codec.Encode.bytes(toI),
  decode: (fromA) => Bytes.Codec.Decode.bytes(fromA)
})
