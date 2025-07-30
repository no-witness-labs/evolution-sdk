import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for BlockHeaderHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class BlockHeaderHashError extends Data.TaggedError("BlockHeaderHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for BlockHeaderHash representing a block header hash.
 * block_header_hash = Bytes32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BlockHeaderHash = pipe(Bytes32.HexSchema, Schema.brand("BlockHeaderHash")).annotations({
  identifier: "BlockHeaderHash"
})

export type BlockHeaderHash = typeof BlockHeaderHash.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  BlockHeaderHash // hex string -> BlockHeaderHash
).annotations({
  identifier: "BlockHeaderHash.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  BlockHeaderHash // hex string -> BlockHeaderHash
).annotations({
  identifier: "BlockHeaderHash.Hex"
})

/**
 * Check if two BlockHeaderHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BlockHeaderHash, b: BlockHeaderHash): boolean => a === b

/**
 * Generate a random BlockHeaderHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for BlockHeaderHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  BlockHeaderHashError
)
