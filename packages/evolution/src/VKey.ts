import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for VKey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VKeyError extends Data.TaggedError("VKeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for VKey representing a verification key.
 * vkey = bytes .size 32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VKey = pipe(Bytes32.HexSchema, Schema.brand("VKey")).annotations({
  identifier: "VKey"
})

export type VKey = typeof VKey.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VKey // hex string -> VKey
).annotations({
  identifier: "VKey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  VKey // hex string -> VKey
).annotations({
  identifier: "VKey.Hex"
})

/**
 * Check if two VKey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VKey, b: VKey): boolean => a === b

/**
 * Generate a random VKey.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for VKey encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  VKeyError
)
