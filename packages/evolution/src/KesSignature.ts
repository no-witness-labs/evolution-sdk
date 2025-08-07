import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes448 from "./Bytes448.js"

/**
 * Error class for KesSignature related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class KesSignatureError extends Data.TaggedError("KesSignatureError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for KesSignature representing a KES signature.
 * kes_signature = bytes .size 448
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const KesSignature = Bytes448.HexSchema.pipe(Schema.brand("KesSignature")).annotations({
  identifier: "KesSignature"
})

export type KesSignature = typeof KesSignature.Type

export const FromBytes = Schema.compose(
  Bytes448.FromBytes, // Uint8Array -> hex string
  KesSignature // hex string -> KesSignature
).annotations({
  identifier: "KesSignature.Bytes"
})

export const FromHex = Schema.compose(
  Bytes448.HexSchema, // string -> hex string
  KesSignature // hex string -> KesSignature
).annotations({
  identifier: "KesSignature.Hex"
})

/**
 * Check if two KesSignature instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KesSignature, b: KesSignature): boolean => a === b

/**
 * Check if the given value is a valid KesSignature
 *
 * @since 2.0.0
 * @category predicates
 */
export const isKesSignature = Schema.is(KesSignature)

/**
 * FastCheck arbitrary for generating random KesSignature instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes448.HEX_LENGTH,
  maxLength: Bytes448.HEX_LENGTH
}).map((hex) => hex as KesSignature)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse KesSignature from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): KesSignature =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse KesSignature from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): KesSignature =>
  Eff.runSync(Effect.fromHex(hex))

/**
 * Encode KesSignature to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (kesSignature: KesSignature): Uint8Array =>
  Eff.runSync(Effect.toBytes(kesSignature))

/**
 * Encode KesSignature to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (kesSignature: KesSignature): string =>
  Eff.runSync(Effect.toHex(kesSignature))

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
   * Parse KesSignature from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<KesSignature, KesSignatureError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new KesSignatureError({
            message: "Failed to parse KesSignature from bytes",
            cause
          })
      )
    )

  /**
   * Parse KesSignature from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<KesSignature, KesSignatureError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new KesSignatureError({
            message: "Failed to parse KesSignature from hex",
            cause
          })
      )
    )

  /**
   * Encode KesSignature to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (kesSignature: KesSignature): Eff.Effect<Uint8Array, KesSignatureError> =>
    Schema.encode(FromBytes)(kesSignature).pipe(
      Eff.mapError(
        (cause) =>
          new KesSignatureError({
            message: "Failed to encode KesSignature to bytes",
            cause
          })
      )
    )

  /**
   * Encode KesSignature to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (kesSignature: KesSignature): Eff.Effect<string, KesSignatureError> =>
    Schema.encode(FromHex)(kesSignature).pipe(
      Eff.mapError(
        (cause) =>
          new KesSignatureError({
            message: "Failed to encode KesSignature to hex",
            cause
          })
      )
    )
}
