import { Data, Effect as Eff, FastCheck, pipe, Schema } from "effect"

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
 * Smart constructor for PoolKeyHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PoolKeyHash.make

/**
 * Check if two PoolKeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PoolKeyHash, b: PoolKeyHash): boolean => a === b

/**
 * FastCheck arbitrary for generating random PoolKeyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: Hash28.BYTES_LENGTH,
  maxLength: Hash28.BYTES_LENGTH
}).map((bytes) => Eff.runSync(Effect.fromBytes(bytes)))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse PoolKeyHash from raw bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): PoolKeyHash => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse PoolKeyHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): PoolKeyHash => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode PoolKeyHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (poolKeyHash: PoolKeyHash): Uint8Array => Eff.runSync(Effect.toBytes(poolKeyHash))

/**
 * Encode PoolKeyHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (poolKeyHash: PoolKeyHash): string => poolKeyHash // Already a hex string

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
   * Parse PoolKeyHash from raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<PoolKeyHash, PoolKeyHashError> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new PoolKeyHashError({
          message: "Failed to parse PoolKeyHash from bytes",
          cause
        })
    )

  /**
   * Parse PoolKeyHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<PoolKeyHash, PoolKeyHashError> =>
    Eff.mapError(
      Schema.decode(PoolKeyHash)(hex),
      (cause) =>
        new PoolKeyHashError({
          message: "Failed to parse PoolKeyHash from hex",
          cause
        })
    )

  /**
   * Encode PoolKeyHash to raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (poolKeyHash: PoolKeyHash): Eff.Effect<Uint8Array, PoolKeyHashError> =>
    Eff.mapError(
      Schema.encode(FromBytes)(poolKeyHash),
      (cause) =>
        new PoolKeyHashError({
          message: "Failed to encode PoolKeyHash to bytes",
          cause
        })
    )
}
