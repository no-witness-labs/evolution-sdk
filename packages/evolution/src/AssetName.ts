import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

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
export const AssetName = Bytes32.VariableHexSchema.pipe(Schema.brand("AssetName")).annotations({
  identifier: "AssetName"
})

export type AssetName = typeof AssetName.Type

/**
 * Schema for encoding/decoding AssetName as bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(Bytes32.FromVariableBytes, AssetName).annotations({
  identifier: "AssetName.Bytes"
})

/**
 * Schema for encoding/decoding AssetName as hex strings.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Bytes32.VariableHexSchema, AssetName).annotations({
  identifier: "AssetName.Hex"
})

/**
 * Smart constructor for AssetName that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = AssetName.make

/**
 * Check if two AssetName instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AssetName, b: AssetName): boolean => a === b

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
export const arbitrary = FastCheck.hexaString({
  minLength: 0,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => fromHex(hex))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse AssetName from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): AssetName => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse AssetName from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): AssetName => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode AssetName to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (assetName: AssetName): Uint8Array => Eff.runSync(Effect.toBytes(assetName))

/**
 * Encode AssetName to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (assetName: AssetName): string => Eff.runSync(Effect.toHex(assetName))

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
   * Parse AssetName from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<AssetName, AssetNameError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new AssetNameError({
            message: "Failed to parse AssetName from bytes",
            cause
          })
      )
    )

  /**
   * Parse AssetName from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<AssetName, AssetNameError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new AssetNameError({
            message: "Failed to parse AssetName from hex",
            cause
          })
      )
    )

  /**
   * Encode AssetName to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (assetName: AssetName): Eff.Effect<Uint8Array, AssetNameError> =>
    Schema.encode(FromBytes)(assetName).pipe(
      Eff.mapError(
        (cause) =>
          new AssetNameError({
            message: "Failed to encode AssetName to bytes",
            cause
          })
      )
    )

  /**
   * Encode AssetName to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (assetName: AssetName): Eff.Effect<string, AssetNameError> =>
    Schema.encode(FromHex)(assetName).pipe(
      Eff.mapError(
        (cause) =>
          new AssetNameError({
            message: "Failed to encode AssetName to hex",
            cause
          })
      )
    )
}
