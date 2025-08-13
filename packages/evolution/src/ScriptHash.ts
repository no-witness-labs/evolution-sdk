import { Data, Effect as Eff, FastCheck, pipe, Schema } from "effect"

import * as Hash28 from "./Hash28.js"

/**
 * Error class for ScriptHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ScriptHashError extends Data.TaggedError("ScriptHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for ScriptHash representing a script hash credential.
 * script_hash = hash28
 * Follows CIP-0019 binary representation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ScriptHash = pipe(Hash28.HexSchema, Schema.brand("ScriptHash")).annotations({
  identifier: "ScriptHash"
})

export type ScriptHash = typeof ScriptHash.Type

/**
 * Schema for transforming between Uint8Array and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(
  Hash28.FromBytes, // Uint8Array -> hex string
  ScriptHash // hex string -> ScriptHash
).annotations({
  identifier: "ScriptHash.Bytes"
})

/**
 * Schema for transforming between hex string and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Hash28.HexSchema, // string -> hex string
  ScriptHash // hex string -> ScriptHash
).annotations({
  identifier: "ScriptHash.Hex"
})

/**
 * Smart constructor for ScriptHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = ScriptHash.make

/**
 * Check if two ScriptHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptHash, b: ScriptHash): boolean => a === b

/**
 * FastCheck arbitrary for generating random ScriptHash instances.
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
 * Parse ScriptHash from raw bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): ScriptHash => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse ScriptHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): ScriptHash => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode ScriptHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (scriptHash: ScriptHash): Uint8Array => Eff.runSync(Effect.toBytes(scriptHash))

/**
 * Encode ScriptHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (scriptHash: ScriptHash): string => scriptHash // Already a hex string

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
   * Parse ScriptHash from raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<ScriptHash, ScriptHashError> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new ScriptHashError({
          message: "Failed to parse ScriptHash from bytes",
          cause
        })
    )

  /**
   * Parse ScriptHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<ScriptHash, ScriptHashError> =>
    Eff.mapError(
      Schema.decode(ScriptHash)(hex),
      (cause) =>
        new ScriptHashError({
          message: "Failed to parse ScriptHash from hex",
          cause
        })
    )

  /**
   * Encode ScriptHash to raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (scriptHash: ScriptHash): Eff.Effect<Uint8Array, ScriptHashError> =>
    Eff.mapError(
      Schema.encode(FromBytes)(scriptHash),
      (cause) =>
        new ScriptHashError({
          message: "Failed to encode ScriptHash to bytes",
          cause
        })
    )
}
