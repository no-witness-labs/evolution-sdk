import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

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
export const BlockBodyHash = Bytes32.HexSchema.pipe(Schema.brand("BlockBodyHash")).annotations({
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
 * Smart constructor for BlockBodyHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = BlockBodyHash.make

/**
 * Check if two BlockBodyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BlockBodyHash, b: BlockBodyHash): boolean => a === b

/**
 * Check if the given value is a valid BlockBodyHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isBlockBodyHash = Schema.is(BlockBodyHash)

/**
 * FastCheck arbitrary for generating random BlockBodyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as BlockBodyHash)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse BlockBodyHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): BlockBodyHash =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse BlockBodyHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): BlockBodyHash =>
  Eff.runSync(Effect.fromHex(hex))

/**
 * Encode BlockBodyHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (blockBodyHash: BlockBodyHash): Uint8Array =>
  Eff.runSync(Effect.toBytes(blockBodyHash))

/**
 * Encode BlockBodyHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (blockBodyHash: BlockBodyHash): string =>
  Eff.runSync(Effect.toHex(blockBodyHash))

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
   * Parse BlockBodyHash from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<BlockBodyHash, BlockBodyHashError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new BlockBodyHashError({
            message: "Failed to parse BlockBodyHash from bytes",
            cause
          })
      )
    )

  /**
   * Parse BlockBodyHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<BlockBodyHash, BlockBodyHashError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new BlockBodyHashError({
            message: "Failed to parse BlockBodyHash from hex",
            cause
          })
      )
    )

  /**
   * Encode BlockBodyHash to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (blockBodyHash: BlockBodyHash): Eff.Effect<Uint8Array, BlockBodyHashError> =>
    Schema.encode(FromBytes)(blockBodyHash).pipe(
      Eff.mapError(
        (cause) =>
          new BlockBodyHashError({
            message: "Failed to encode BlockBodyHash to bytes",
            cause
          })
      )
    )

  /**
   * Encode BlockBodyHash to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (blockBodyHash: BlockBodyHash): Eff.Effect<string, BlockBodyHashError> =>
    Schema.encode(FromHex)(blockBodyHash).pipe(
      Eff.mapError(
        (cause) =>
          new BlockBodyHashError({
            message: "Failed to encode BlockBodyHash to hex",
            cause
          })
      )
    )
}
