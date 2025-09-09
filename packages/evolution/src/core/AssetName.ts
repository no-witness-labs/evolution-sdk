import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

/**
 * Error class for AssetName related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class AssetNameError extends Data.TaggedError("AssetNameError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for AssetName representing a native asset identifier.
 * Asset names are limited to 32 bytes (0-64 hex characters).
 *
 * @since 2.0.0
 * @category model
 */
export class AssetName extends Schema.TaggedClass<AssetName>()("AssetName", {
  bytes: Bytes32.VariableBytesFromHex
}) {}

/**
 * Schema for encoding/decoding AssetName as bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(
  Schema.typeSchema(Bytes32.VariableBytesFromHex),
  Schema.typeSchema(AssetName),
  {
    strict: true,
    decode: (bytes) => new AssetName({ bytes }, { disableValidation: true }),
    encode: (assetName) => assetName.bytes
  }
).annotations({
  identifier: "AssetName.FromBytes"
})

/**
 * Schema for encoding/decoding AssetName as hex strings.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.VariableBytesFromHex, // string -> Bytes32
  FromBytes // Bytes32 -> AssetName
).annotations({
  identifier: "AssetName.FromHex"
})

/**
 * Smart constructor for AssetName that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof AssetName>) => new AssetName(...args)

/**
 * Check if two AssetName instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AssetName, b: AssetName): boolean => Bytes32.equals(a.bytes, b.bytes)

/**
 * Check if the given value is a valid AssetName
 *
 * @since 2.0.0
 * @category predicates
 */
export const isAssetName = Schema.is(AssetName)

/**
 * FastCheck arbitrary for generating random AssetName instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: 0,
  maxLength: 32
}).map((bytes) => new AssetName({ bytes }, { disableValidation: true }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse AssetName from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, AssetNameError, "AssetName.fromBytes")

/**
 * Parse AssetName from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, AssetNameError, "AssetName.fromHex")

/**
 * Encode AssetName to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, AssetNameError, "AssetName.toBytes")

/**
 * Encode AssetName to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, AssetNameError, "AssetName.toHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse AssetName from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, AssetNameError)

  /**
   * Parse AssetName from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, AssetNameError)

  /**
   * Encode AssetName to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, AssetNameError)

  /**
   * Encode AssetName to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, AssetNameError)
}
