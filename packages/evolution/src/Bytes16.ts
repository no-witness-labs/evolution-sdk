import { pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export const BYTES_LENGTH = 16
export const HEX_LENGTH = 32

export const BytesSchema = pipe(
  Schema.Uint8ArrayFromSelf,
  Schema.filter((a) => a.length === BYTES_LENGTH, {
    message: (issue) =>
      `${issue.actual} must be a byte array of length ${BYTES_LENGTH}, but got ${(issue.actual as Uint8Array).length}`,
    identifier: "Bytes16.Bytes"
  })
)

export const HexSchema = pipe(
  Bytes.HexSchema,
  Schema.filter((a) => a.length === HEX_LENGTH, {
    message: (issue) =>
      `${issue.actual} must be a hex string of length ${HEX_LENGTH}, but got ${(issue.actual as string).length}`,
    identifier: "Bytes16.Hex"
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
