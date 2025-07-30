import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for KESVkey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class KESVkeyError extends Data.TaggedError("KESVkeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for KESVkey representing a KES verification key.
 * kes_vkey = bytes .size 32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const KESVkey = pipe(Bytes32.HexSchema, Schema.brand("KESVkey")).annotations({
  identifier: "KESVkey"
})

export type KESVkey = typeof KESVkey.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  KESVkey // hex string -> KESVkey
).annotations({
  identifier: "KESVkey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  KESVkey // hex string -> KESVkey
).annotations({
  identifier: "KESVkey.Hex"
})

/**
 * Check if two KESVkey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KESVkey, b: KESVkey): boolean => a === b

/**
 * Generate a random KESVkey.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for KESVkey encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  KESVkeyError
)
