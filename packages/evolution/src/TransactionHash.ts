import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

/**
 * Error class for TransactionHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionHashError extends Data.TaggedError("TransactionHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for TransactionHash.
 * transaction_hash = Bytes32
 *
 * @since 2.0.0
 * @category schemas
 */
export const TransactionHash = Bytes32.HexSchema.pipe(Schema.brand("TransactionHash")).annotations({
  identifier: "TransactionHash"
})

export type TransactionHash = typeof TransactionHash.Type

/**
 * Schema for transforming between Uint8Array and TransactionHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  TransactionHash // hex string -> TransactionHash
).annotations({
  identifier: "TransactionHash.Bytes"
})

/**
 * Schema for transforming between hex string and TransactionHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  TransactionHash // hex string -> TransactionHash
).annotations({
  identifier: "TransactionHash.Hex"
})

/**
 * Smart constructor for TransactionHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = TransactionHash.make

/**
 * Check if two TransactionHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionHash, b: TransactionHash): boolean => a === b

/**
 * Check if the given value is a valid TransactionHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isTransactionHash = Schema.is(TransactionHash)

/**
 * FastCheck arbitrary for generating random TransactionHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as TransactionHash)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse TransactionHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): TransactionHash =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse TransactionHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): TransactionHash =>
  Eff.runSync(Effect.fromHex(hex))

/**
 * Encode TransactionHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (txHash: TransactionHash): Uint8Array =>
  Eff.runSync(Effect.toBytes(txHash))

/**
 * Encode TransactionHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (txHash: TransactionHash): string =>
  Eff.runSync(Effect.toHex(txHash))

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
   * Parse TransactionHash from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<TransactionHash, TransactionHashError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionHashError({
            message: "Failed to parse TransactionHash from bytes",
            cause
          })
      )
    )

  /**
   * Parse TransactionHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<TransactionHash, TransactionHashError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionHashError({
            message: "Failed to parse TransactionHash from hex",
            cause
          })
      )
    )

  /**
   * Encode TransactionHash to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (txHash: TransactionHash): Eff.Effect<Uint8Array, TransactionHashError> =>
    Schema.encode(FromBytes)(txHash).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionHashError({
            message: "Failed to encode TransactionHash to bytes",
            cause
          })
      )
    )

  /**
   * Encode TransactionHash to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (txHash: TransactionHash): Eff.Effect<string, TransactionHashError> =>
    Schema.encode(FromHex)(txHash).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionHashError({
            message: "Failed to encode TransactionHash to hex",
            cause
          })
      )
    )
}
