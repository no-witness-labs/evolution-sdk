import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"
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
 * ```
 * script_hash = hash28
 * ```
 * Follows CIP-0019 binary representation.
 *
 * Stores raw 28-byte value for performance.
 *
 * @since 2.0.0
 * @category schemas
 */
export class ScriptHash extends Schema.TaggedClass<ScriptHash>()("ScriptHash", {
  hash: Hash28.BytesSchema
}) {
  toJSON(): string {
    return toHex(this)
  }

  toString(): string {
    return toHex(this)
  }
}

/**
 * Schema for transforming between Uint8Array and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Hash28.BytesSchema, ScriptHash, {
  strict: true,
  decode: (bytes) => new ScriptHash({ hash: bytes }, { disableValidation: true }), // Disable validation since we already check length in Hash28
  encode: (scriptHash) => scriptHash.hash
}).annotations({
  identifier: "ScriptHash.FromBytes"
})

/**
 * Schema for transforming between hex string and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes.FromHex, // string -> Uint8Array
  FromBytes
).annotations({
  identifier: "ScriptHash.FromHex"
})

/**
 * Smart constructor for ScriptHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof ScriptHash>) => new ScriptHash(...args)

/**
 * Check if two ScriptHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptHash, b: ScriptHash): boolean => Bytes.equals(a.hash, b.hash)

/**
 * FastCheck arbitrary for generating random ScriptHash instances.
 * Used for property-based testing to generate valid test data.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<ScriptHash> = FastCheck.uint8Array({ minLength: 28, maxLength: 28 }).map(
  (bytes) => make({ hash: bytes }, { disableValidation: true })
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a ScriptHash from raw bytes.
 * Expects exactly 28 bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, ScriptHashError, "ScriptHash.fromBytes")

/**
 * Parse a ScriptHash from a hex string.
 * Expects exactly 56 hex characters (28 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, ScriptHashError, "ScriptHash.fromHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a ScriptHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (scriptHash: ScriptHash): Uint8Array => new Uint8Array(scriptHash.hash) // Return a copy of the underlying bytes

/**
 * Convert a ScriptHash to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (scriptHash: ScriptHash): string => Bytes.toHex(scriptHash.hash)

// ============================================================================
// Either Namespace - Either-based Error Handling
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, ScriptHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, ScriptHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, ScriptHashError)
  export const toHex = Function.makeEncodeEither(FromHex, ScriptHashError)
}
