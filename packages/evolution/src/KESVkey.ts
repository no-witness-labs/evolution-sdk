import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

/**
 * Error class for KESVkey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class KESVkeyError extends Data.TaggedError("KESVkeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for KESVkey representing a KES verification key.
 * kes_vkey = bytes .size 32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const KESVkey = Bytes32.HexSchema.pipe(Schema.brand("KESVkey")).annotations({
  identifier: "KESVkey"
})

export type KESVkey = typeof KESVkey.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  KESVkey // hex string -> KESVkey
).annotations({
  identifier: "KESVkey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  KESVkey // hex string -> KESVkey
).annotations({
  identifier: "KESVkey.Hex"
})

/**
 * Check if two KESVkey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KESVkey, b: KESVkey): boolean => a === b

/**
 * Check if the given value is a valid KESVkey
 *
 * @since 2.0.0
 * @category predicates
 */
export const isKESVkey = Schema.is(KESVkey)

/**
 * FastCheck arbitrary for generating random KESVkey instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as KESVkey)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse KESVkey from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): KESVkey => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse KESVkey from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): KESVkey => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode KESVkey to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (kesVkey: KESVkey): Uint8Array => Eff.runSync(Effect.toBytes(kesVkey))

/**
 * Encode KESVkey to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (kesVkey: KESVkey): string => Eff.runSync(Effect.toHex(kesVkey))

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
   * Parse KESVkey from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<KESVkey, KESVkeyError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new KESVkeyError({
            message: "Failed to parse KESVkey from bytes",
            cause
          })
      )
    )

  /**
   * Parse KESVkey from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<KESVkey, KESVkeyError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new KESVkeyError({
            message: "Failed to parse KESVkey from hex",
            cause
          })
      )
    )

  /**
   * Encode KESVkey to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (kesVkey: KESVkey): Eff.Effect<Uint8Array, KESVkeyError> =>
    Schema.encode(FromBytes)(kesVkey).pipe(
      Eff.mapError(
        (cause) =>
          new KESVkeyError({
            message: "Failed to encode KESVkey to bytes",
            cause
          })
      )
    )

  /**
   * Encode KESVkey to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (kesVkey: KESVkey): Eff.Effect<string, KESVkeyError> =>
    Schema.encode(FromHex)(kesVkey).pipe(
      Eff.mapError(
        (cause) =>
          new KESVkeyError({
            message: "Failed to encode KESVkey to hex",
            cause
          })
      )
    )
}
