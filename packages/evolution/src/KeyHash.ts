import { Data, FastCheck, pipe, Schema } from "effect"

import { createEncoders } from "./Codec.js"
import * as Hash28 from "./Hash28.js"

/**
 * Error class for KeyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class KeyHashError extends Data.TaggedError("KeyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for KeyHash representing a verification key hash.
 * addr_keyhash = hash28
 * Follows CIP-0019 binary representation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const KeyHash = pipe(Hash28.HexSchema, Schema.brand("KeyHash")).annotations({
  identifier: "KeyHash"
})

export type KeyHash = typeof KeyHash.Type

export const FromBytes = Schema.compose(
  Hash28.FromBytes, // Uint8Array -> hex string
  KeyHash // hex string -> KeyHash
).annotations({
  identifier: "KeyHash.FromBytes"
})

export const FromHex = Schema.compose(
  Hash28.HexSchema, // string -> hex string
  KeyHash // hex string -> KeyHash
).annotations({
  identifier: "KeyHash.FromHex"
})

/**
 * Check if two KeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KeyHash, b: KeyHash): boolean => a === b

/**
 * Generate a random KeyHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Hash28.HASH28_BYTES_LENGTH,
  maxLength: Hash28.HASH28_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for KeyHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    string: FromHex
  },
  KeyHashError
)
