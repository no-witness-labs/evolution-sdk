import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes64 from "./Bytes64.js"

/**
 * Error class for Ed25519Signature related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class Ed25519SignatureError extends Data.TaggedError("Ed25519SignatureError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Ed25519Signature representing an Ed25519 signature.
 * ed25519_signature = bytes .size 64
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Ed25519Signature = Bytes64.HexSchema.pipe(Schema.brand("Ed25519Signature")).annotations({
  identifier: "Ed25519Signature"
})

export type Ed25519Signature = typeof Ed25519Signature.Type

export const FromBytes = Schema.compose(
  Bytes64.FromBytes, // Uint8Array -> hex string
  Ed25519Signature // hex string -> Ed25519Signature
).annotations({
  identifier: "Ed25519Signature.Bytes"
})

export const FromHex = Schema.compose(
  Bytes64.HexSchema, // string -> hex string
  Ed25519Signature // hex string -> Ed25519Signature
).annotations({
  identifier: "Ed25519Signature.Hex"
})

/**
 * Smart constructor for Ed25519Signature that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Ed25519Signature.make

/**
 * Check if two Ed25519Signature instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Ed25519Signature, b: Ed25519Signature): boolean => a === b

/**
 * Check if the given value is a valid Ed25519Signature
 *
 * @since 2.0.0
 * @category predicates
 */
export const isEd25519Signature = Schema.is(Ed25519Signature)

/**
 * FastCheck arbitrary for generating random Ed25519Signature instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes64.HEX_LENGTH,
  maxLength: Bytes64.HEX_LENGTH
}).map((hex) => hex as Ed25519Signature)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Ed25519Signature from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): Ed25519Signature => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse Ed25519Signature from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): Ed25519Signature => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode Ed25519Signature to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (signature: Ed25519Signature): Uint8Array => Eff.runSync(Effect.toBytes(signature))

/**
 * Encode Ed25519Signature to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (signature: Ed25519Signature): string => Eff.runSync(Effect.toHex(signature))

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
   * Parse Ed25519Signature from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<Ed25519Signature, Ed25519SignatureError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new Ed25519SignatureError({
            message: "Failed to parse Ed25519Signature from bytes",
            cause
          })
      )
    )

  /**
   * Parse Ed25519Signature from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<Ed25519Signature, Ed25519SignatureError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new Ed25519SignatureError({
            message: "Failed to parse Ed25519Signature from hex",
            cause
          })
      )
    )

  /**
   * Encode Ed25519Signature to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (signature: Ed25519Signature): Eff.Effect<Uint8Array, Ed25519SignatureError> =>
    Schema.encode(FromBytes)(signature).pipe(
      Eff.mapError(
        (cause) =>
          new Ed25519SignatureError({
            message: "Failed to encode Ed25519Signature to bytes",
            cause
          })
      )
    )

  /**
   * Encode Ed25519Signature to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (signature: Ed25519Signature): Eff.Effect<string, Ed25519SignatureError> =>
    Schema.encode(FromHex)(signature).pipe(
      Eff.mapError(
        (cause) =>
          new Ed25519SignatureError({
            message: "Failed to encode Ed25519Signature to hex",
            cause
          })
      )
    )
}
