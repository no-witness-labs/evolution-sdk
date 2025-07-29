import { Data, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for Text related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TextError extends Data.TaggedError("TextError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for converting between strings and UTF-8 byte arrays.
 * text -> bytes
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.Uint8ArrayFromSelf, Schema.String, {
  strict: true,
  encode: (fromA) => new TextEncoder().encode(fromA),
  decode: (toA) => new TextDecoder().decode(toA)
}).annotations({
  identifier: "Text.FromBytes"
})

/**
 * Schema for converting between strings and hex representation of UTF-8 bytes.
 * 
 * ```
 * text <-> hex
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Bytes.FromHex, FromBytes).annotations({
  identifier: "Text.FromHex"
})

/**
 * Codec utilities for Text encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  TextError
)
