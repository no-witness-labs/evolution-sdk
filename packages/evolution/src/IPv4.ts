import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes4 from "./Bytes4.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for IPv4 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class IPv4Error extends Data.TaggedError("IPv4Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for IPv4 representing an IPv4 network address.
 * Stored as 4 bytes in network byte order (big-endian).
 *
 * @since 2.0.0
 * @category schemas
 */
export const IPv4 = pipe(Bytes4.HexSchema, Schema.brand("IPv4")).annotations({
  identifier: "IPv4"
})

export type IPv4 = typeof IPv4.Type

export const FromBytes = Schema.compose(
  Bytes4.FromBytes, // Uint8Array -> hex string
  IPv4 // hex string -> IPv4
).annotations({
  identifier: "IPv4.Bytes"
})

export const FromHex = Schema.compose(
  Bytes4.HexSchema, // string -> hex string
  IPv4 // hex string -> IPv4
).annotations({
  identifier: "IPv4.Hex"
})

/**
 * Check if two IPv4 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: IPv4, b: IPv4): boolean => a === b

/**
 * Generate a random IPv4.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes4.BYTES_LENGTH,
  maxLength: Bytes4.BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for IPv4 encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  IPv4Error
)
