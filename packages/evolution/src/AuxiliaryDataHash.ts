/**
 * Auxiliary Data Hash module - provides an alias for Bytes32 specialized for auxiliary data hashing.
 *
 * In Cardano, auxiliary_data_hash = Bytes32, representing a 32-byte hash
 * used for auxiliary data (metadata) attached to transactions.
 *
 * @since 2.0.0
 */

import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

/**
 * Error class for AuxiliaryDataHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class AuxiliaryDataHashError extends Data.TaggedError("AuxiliaryDataHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for AuxiliaryDataHash representing auxiliary data hashes.
 * auxiliary_data_hash = Bytes32
 *
 * @since 2.0.0
 * @category model
 */
export class AuxiliaryDataHash extends Schema.TaggedClass<AuxiliaryDataHash>()("AuxiliaryDataHash", {
  bytes: Bytes32.BytesSchema
}) {}

export const FromBytes = Schema.transform(Bytes32.BytesSchema, AuxiliaryDataHash, {
  strict: true,
  decode: (bytes) => new AuxiliaryDataHash({ bytes }, { disableValidation: true }),
  encode: (a) => a.bytes
}).annotations({
  identifier: "AuxiliaryDataHash.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes32.FromHex, // string -> Bytes32
  FromBytes // Bytes32 -> AuxiliaryDataHash
).annotations({
  identifier: "AuxiliaryDataHash.FromHex"
})

// Back-compat aliases used in TransactionBody and elsewhere
export const BytesSchema = FromBytes
export const HexSchema = FromHex

/**
 * Smart constructor for AuxiliaryDataHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof AuxiliaryDataHash>) => new AuxiliaryDataHash(...args)

/**
 * Check if two AuxiliaryDataHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AuxiliaryDataHash, b: AuxiliaryDataHash): boolean => Bytes32.equals(a.bytes, b.bytes)

/**
 * Check if the given value is a valid AuxiliaryDataHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isAuxiliaryDataHash = Schema.is(AuxiliaryDataHash)

/**
 * FastCheck arbitrary for generating random AuxiliaryDataHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map(
  (bytes) => new AuxiliaryDataHash({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse AuxiliaryDataHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, AuxiliaryDataHashError, "AuxiliaryDataHash.fromBytes")

/**
 * Parse AuxiliaryDataHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, AuxiliaryDataHashError, "AuxiliaryDataHash.fromHex")

/**
 * Encode AuxiliaryDataHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, AuxiliaryDataHashError, "AuxiliaryDataHash.toBytes")

/**
 * Encode AuxiliaryDataHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, AuxiliaryDataHashError, "AuxiliaryDataHash.toHex")

// ============================================================================
// Either Namespace (composable non-throwing API)
// ============================================================================

export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, AuxiliaryDataHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, AuxiliaryDataHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, AuxiliaryDataHashError)
  export const toHex = Function.makeEncodeEither(FromHex, AuxiliaryDataHashError)
}
