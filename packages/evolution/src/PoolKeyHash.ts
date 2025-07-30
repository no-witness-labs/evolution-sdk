import { Data, FastCheck, pipe, Schema } from "effect"

import { createEncoders } from "./Codec.js"
import * as Hash28 from "./Hash28.js"

/**
 * Error class for PoolKeyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PoolKeyHashError extends Data.TaggedError("PoolKeyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * PoolKeyHash is a 28-byte hash representing a stake pool's verification key.
 * pool_keyhash = hash28
 *
 * @since 2.0.0
 * @category schemas
 */
export const PoolKeyHash = pipe(Hash28.HexSchema, Schema.brand("PoolKeyHash")).annotations({
  identifier: "PoolKeyHash"
})

export type PoolKeyHash = typeof PoolKeyHash.Type

export const FromBytes = Schema.compose(
  Hash28.FromBytes, // Uint8Array -> hex string
  PoolKeyHash // hex string -> PoolKeyHash
).annotations({
  identifier: "PoolKeyHash.Bytes"
})

export const FromHex = Schema.compose(
  Hash28.HexSchema, // string -> hex string
  PoolKeyHash // hex string -> PoolKeyHash
).annotations({
  identifier: "PoolKeyHash.Hex"
})

/**
 * Check if two PoolKeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PoolKeyHash, b: PoolKeyHash): boolean => a === b

/**
 * Generate a random PoolKeyHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Hash28.HASH28_BYTES_LENGTH,
  maxLength: Hash28.HASH28_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for PoolKeyHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  PoolKeyHashError
)
