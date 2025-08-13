import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

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
export const BlockHeaderHash = Bytes32.HexSchema.pipe(Schema.brand("BlockHeaderHash")).annotations({
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
 * Smart constructor for BlockHeaderHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = BlockHeaderHash.make

/**
 * Check if two BlockHeaderHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BlockHeaderHash, b: BlockHeaderHash): boolean => a === b

/**
 * Check if the given value is a valid BlockHeaderHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isBlockHeaderHash = Schema.is(BlockHeaderHash)

/**
 * FastCheck arbitrary for generating random BlockHeaderHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as BlockHeaderHash)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse BlockHeaderHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): BlockHeaderHash => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse BlockHeaderHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): BlockHeaderHash => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode BlockHeaderHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (blockHeaderHash: BlockHeaderHash): Uint8Array => Eff.runSync(Effect.toBytes(blockHeaderHash))

/**
 * Encode BlockHeaderHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (blockHeaderHash: BlockHeaderHash): string => Eff.runSync(Effect.toHex(blockHeaderHash))

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse BlockHeaderHash from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<BlockHeaderHash, BlockHeaderHashError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new BlockHeaderHashError({
            message: "Failed to parse BlockHeaderHash from bytes",
            cause
          })
      )
    )

  /**
   * Parse BlockHeaderHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<BlockHeaderHash, BlockHeaderHashError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new BlockHeaderHashError({
            message: "Failed to parse BlockHeaderHash from hex",
            cause
          })
      )
    )

  /**
   * Encode BlockHeaderHash to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (blockHeaderHash: BlockHeaderHash): Eff.Effect<Uint8Array, BlockHeaderHashError> =>
    Schema.encode(FromBytes)(blockHeaderHash).pipe(
      Eff.mapError(
        (cause) =>
          new BlockHeaderHashError({
            message: "Failed to encode BlockHeaderHash to bytes",
            cause
          })
      )
    )

  /**
   * Encode BlockHeaderHash to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (blockHeaderHash: BlockHeaderHash): Eff.Effect<string, BlockHeaderHashError> =>
    Schema.encode(FromHex)(blockHeaderHash).pipe(
      Eff.mapError(
        (cause) =>
          new BlockHeaderHashError({
            message: "Failed to encode BlockHeaderHash to hex",
            cause
          })
      )
    )
}
