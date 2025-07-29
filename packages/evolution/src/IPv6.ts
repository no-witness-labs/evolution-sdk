import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes16 from "./Bytes16.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for IPv6 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class IPv6Error extends Data.TaggedError("IPv6Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for IPv6 representing an IPv6 network address.
 * Stored as 16 bytes in network byte order (big-endian).
 *
 * @since 2.0.0
 * @category schemas
 */
export const IPv6 = pipe(Bytes16.HexSchema, Schema.brand("IPv6")).annotations({
  identifier: "IPv6"
})

export type IPv6 = typeof IPv6.Type

export const FromBytes = Schema.compose(
  Bytes16.FromBytes, // Uint8Array -> hex string
  IPv6 // hex string -> IPv6
).annotations({
  identifier: "IPv6.Bytes"
})

export const FromHex = Schema.compose(
  Bytes16.HexSchema, // string -> hex string
  IPv6 // hex string -> IPv6
).annotations({
  identifier: "IPv6.Hex"
})

/**
 * Check if two IPv6 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: IPv6, b: IPv6): boolean => a === b

/**
 * Generate a random IPv6.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes16.BYTES_LENGTH,
  maxLength: Bytes16.BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for IPv6 encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  IPv6Error
)
