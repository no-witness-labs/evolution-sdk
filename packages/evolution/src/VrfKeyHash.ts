import { Data, Effect as Eff, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

/**
 * Error class for VrfKeyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VrfKeyHashError extends Data.TaggedError("VrfKeyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * VrfKeyHash is a 32-byte hash representing a VRF verification key.
 * vrf_keyhash = Bytes32
 *
 * @since 2.0.0
 * @category schemas
 */
export const VrfKeyHash = pipe(Bytes32.HexSchema, Schema.brand("VrfKeyHash")).annotations({
  identifier: "VrfKeyHash"
})

export type VrfKeyHash = typeof VrfKeyHash.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VrfKeyHash // hex string -> VrfKeyHash
).annotations({
  identifier: "VrfKeyHash.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  VrfKeyHash // hex string -> VrfKeyHash
).annotations({
  identifier: "VrfKeyHash.Hex"
})

/**
 * Check if two VrfKeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfKeyHash, b: VrfKeyHash): boolean => a === b

/**
 * FastCheck arbitrary for generating random VrfKeyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: Bytes32.BYTES_LENGTH,
  maxLength: Bytes32.BYTES_LENGTH
}).map((bytes) => Eff.runSync(Effect.fromBytes(bytes)))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse VrfKeyHash from raw bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): VrfKeyHash => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse VrfKeyHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): VrfKeyHash => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode VrfKeyHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (vrfKeyHash: VrfKeyHash): Uint8Array => Eff.runSync(Effect.toBytes(vrfKeyHash))

/**
 * Encode VrfKeyHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (vrfKeyHash: VrfKeyHash): string => vrfKeyHash // Already a hex string

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
   * Parse VrfKeyHash from raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<VrfKeyHash, VrfKeyHashError> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new VrfKeyHashError({
          message: "Failed to parse VrfKeyHash from bytes",
          cause
        })
    )

  /**
   * Parse VrfKeyHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<VrfKeyHash, VrfKeyHashError> =>
    Eff.mapError(
      Schema.decode(VrfKeyHash)(hex),
      (cause) =>
        new VrfKeyHashError({
          message: "Failed to parse VrfKeyHash from hex",
          cause
        })
    )

  /**
   * Encode VrfKeyHash to raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (vrfKeyHash: VrfKeyHash): Eff.Effect<Uint8Array, VrfKeyHashError> =>
    Eff.mapError(
      Schema.encode(FromBytes)(vrfKeyHash),
      (cause) =>
        new VrfKeyHashError({
          message: "Failed to encode VrfKeyHash to bytes",
          cause
        })
    )
}
