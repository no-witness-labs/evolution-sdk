import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

/**
 * Error class for ScriptDataHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ScriptDataHashError extends Data.TaggedError("ScriptDataHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * ScriptDataHash based on Conway CDDL specification
 *
 * CDDL: script_data_hash = Bytes32
 *
 * This is a hash of data which may affect evaluation of a script.
 * This data consists of:
 *   - The redeemers from the transaction_witness_set (the value of field 5).
 *   - The datums from the transaction_witness_set (the value of field 4).
 *   - The value in the cost_models map corresponding to the script's language
 *     (in field 18 of protocol_param_update.)
 *
 * @since 2.0.0
 * @category schemas
 */
export const ScriptDataHash = Bytes32.HexSchema.pipe(Schema.brand("ScriptDataHash")).annotations({
  identifier: "ScriptDataHash"
})

export type ScriptDataHash = typeof ScriptDataHash.Type

/**
 * Schema for transforming between Uint8Array and ScriptDataHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  ScriptDataHash // hex string -> ScriptDataHash
).annotations({
  identifier: "ScriptDataHash.Bytes"
})

/**
 * Schema for transforming between hex string and ScriptDataHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  ScriptDataHash // hex string -> ScriptDataHash
).annotations({
  identifier: "ScriptDataHash.Hex"
})

/**
 * Smart constructor for ScriptDataHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = ScriptDataHash.make

/**
 * Check if two ScriptDataHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptDataHash, b: ScriptDataHash): boolean => a === b

/**
 * Check if the given value is a valid ScriptDataHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isScriptDataHash = Schema.is(ScriptDataHash)

/**
 * FastCheck arbitrary for generating random ScriptDataHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as ScriptDataHash)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse ScriptDataHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): ScriptDataHash =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse ScriptDataHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): ScriptDataHash =>
  Eff.runSync(Effect.fromHex(hex))

/**
 * Encode ScriptDataHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (scriptDataHash: ScriptDataHash): Uint8Array =>
  Eff.runSync(Effect.toBytes(scriptDataHash))

/**
 * Encode ScriptDataHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (scriptDataHash: ScriptDataHash): string =>
  Eff.runSync(Effect.toHex(scriptDataHash))

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
   * Parse ScriptDataHash from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<ScriptDataHash, ScriptDataHashError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new ScriptDataHashError({
            message: "Failed to parse ScriptDataHash from bytes",
            cause
          })
      )
    )

  /**
   * Parse ScriptDataHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<ScriptDataHash, ScriptDataHashError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new ScriptDataHashError({
            message: "Failed to parse ScriptDataHash from hex",
            cause
          })
      )
    )

  /**
   * Encode ScriptDataHash to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (scriptDataHash: ScriptDataHash): Eff.Effect<Uint8Array, ScriptDataHashError> =>
    Schema.encode(FromBytes)(scriptDataHash).pipe(
      Eff.mapError(
        (cause) =>
          new ScriptDataHashError({
            message: "Failed to encode ScriptDataHash to bytes",
            cause
          })
      )
    )

  /**
   * Encode ScriptDataHash to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (scriptDataHash: ScriptDataHash): Eff.Effect<string, ScriptDataHashError> =>
    Schema.encode(FromHex)(scriptDataHash).pipe(
      Eff.mapError(
        (cause) =>
          new ScriptDataHashError({
            message: "Failed to encode ScriptDataHash to hex",
            cause
          })
      )
    )
}
