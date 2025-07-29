import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for BlockBodyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class BlockBodyHashError extends Data.TaggedError("BlockBodyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for BlockBodyHash representing a block body hash.
 * block_body_hash = Bytes32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BlockBodyHash = pipe(Bytes32.HexSchema, Schema.brand("BlockBodyHash")).annotations({
  identifier: "BlockBodyHash"
})

export type BlockBodyHash = typeof BlockBodyHash.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  BlockBodyHash // hex string -> BlockBodyHash
).annotations({
  identifier: "BlockBodyHash.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  BlockBodyHash // hex string -> BlockBodyHash
).annotations({
  identifier: "BlockBodyHash.Hex"
})

/**
 * Check if two BlockBodyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BlockBodyHash, b: BlockBodyHash): boolean => a === b

/**
 * Generate a random BlockBodyHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for BlockBodyHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  BlockBodyHashError
)
