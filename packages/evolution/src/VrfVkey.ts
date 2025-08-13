import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

/**
 * Error class for VrfVkey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VrfVkeyError extends Data.TaggedError("VrfVkeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for VrfVkey representing a VRF verification key.
 * vrf_vkey = bytes .size 32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VrfVkey = Bytes32.HexSchema.pipe(Schema.brand("VrfVkey")).annotations({
  identifier: "VrfVkey"
})

export type VrfVkey = typeof VrfVkey.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VrfVkey // hex string -> VrfVkey
).annotations({
  identifier: "VrfVkey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  VrfVkey // hex string -> VrfVkey
).annotations({
  identifier: "VrfVkey.Hex"
})

/**
 * Check if two VrfVkey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfVkey, b: VrfVkey): boolean => a === b

/**
 * Check if the given value is a valid VrfVkey
 *
 * @since 2.0.0
 * @category predicates
 */
export const isVrfVkey = Schema.is(VrfVkey)

/**
 * FastCheck arbitrary for generating random VrfVkey instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as VrfVkey)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse VrfVkey from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): VrfVkey => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse VrfVkey from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): VrfVkey => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode VrfVkey to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (vrfVkey: VrfVkey): Uint8Array => Eff.runSync(Effect.toBytes(vrfVkey))

/**
 * Encode VrfVkey to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (vrfVkey: VrfVkey): string => Eff.runSync(Effect.toHex(vrfVkey))

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
   * Parse VrfVkey from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<VrfVkey, VrfVkeyError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new VrfVkeyError({
            message: "Failed to parse VrfVkey from bytes",
            cause
          })
      )
    )

  /**
   * Parse VrfVkey from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<VrfVkey, VrfVkeyError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new VrfVkeyError({
            message: "Failed to parse VrfVkey from hex",
            cause
          })
      )
    )

  /**
   * Encode VrfVkey to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (vrfVkey: VrfVkey): Eff.Effect<Uint8Array, VrfVkeyError> =>
    Schema.encode(FromBytes)(vrfVkey).pipe(
      Eff.mapError(
        (cause) =>
          new VrfVkeyError({
            message: "Failed to encode VrfVkey to bytes",
            cause
          })
      )
    )

  /**
   * Encode VrfVkey to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (vrfVkey: VrfVkey): Eff.Effect<string, VrfVkeyError> =>
    Schema.encode(FromHex)(vrfVkey).pipe(
      Eff.mapError(
        (cause) =>
          new VrfVkeyError({
            message: "Failed to encode VrfVkey to hex",
            cause
          })
      )
    )
}
