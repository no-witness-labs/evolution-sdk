import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

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
 * @category model
 */
export class ScriptDataHash extends Schema.TaggedClass<ScriptDataHash>()("ScriptDataHash", {
  hash: Bytes32.BytesFromHex
}) {}

/**
 * Schema for transforming between Uint8Array and ScriptDataHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.typeSchema(Bytes32.BytesFromHex), Schema.typeSchema(ScriptDataHash), {
  strict: true,
  decode: (bytes) => new ScriptDataHash({ hash: bytes }, { disableValidation: true }),
  encode: (s) => s.hash
}).annotations({
  identifier: "ScriptDataHash.FromBytes"
})

/**
 * Schema for transforming between hex string and ScriptDataHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.BytesFromHex, // string -> Bytes32
  FromBytes // Bytes32 -> ScriptDataHash
).annotations({
  identifier: "ScriptDataHash.FromHex"
})

/**
 * Smart constructor for ScriptDataHash.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof ScriptDataHash>) => new ScriptDataHash(...args)

/**
 * Check if two ScriptDataHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptDataHash, b: ScriptDataHash): boolean => Bytes32.equals(a.hash, b.hash)

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
export const arbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map(
  (bytes) => new ScriptDataHash({ hash: bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse ScriptDataHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, ScriptDataHashError, "ScriptDataHash.fromBytes")

/**
 * Parse ScriptDataHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, ScriptDataHashError, "ScriptDataHash.fromHex")

/**
 * Encode ScriptDataHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, ScriptDataHashError, "ScriptDataHash.toBytes")

/**
 * Encode ScriptDataHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, ScriptDataHashError, "ScriptDataHash.toHex")

// ============================================================================
// Either Namespace (composable non-throwing API)
// ============================================================================

export namespace Either {
  /**
   * Parse ScriptDataHash from bytes with composable error handling.
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, ScriptDataHashError)

  /**
   * Parse ScriptDataHash from hex string with composable error handling.
   */
  export const fromHex = Function.makeDecodeEither(FromHex, ScriptDataHashError)

  /**
   * Encode ScriptDataHash to bytes with composable error handling.
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, ScriptDataHashError)

  /**
   * Encode ScriptDataHash to hex string with composable error handling.
   */
  export const toHex = Function.makeEncodeEither(FromHex, ScriptDataHashError)
}
