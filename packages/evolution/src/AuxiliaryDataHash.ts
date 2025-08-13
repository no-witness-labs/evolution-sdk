/**
 * Auxiliary Data Hash module - provides an alias for Bytes32 specialized for auxiliary data hashing.
 *
 * In Cardano, auxiliary_data_hash = Bytes32, representing a 32-byte hash
 * used for auxiliary data (metadata) attached to transactions.
 *
 * @since 2.0.0
 */

import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

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
 * @category schemas
 */
export const AuxiliaryDataHash = Bytes32.HexSchema.pipe(Schema.brand("AuxiliaryDataHash")).annotations({
  identifier: "AuxiliaryDataHash"
})

export type AuxiliaryDataHash = typeof AuxiliaryDataHash.Type

export const BytesSchema = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  AuxiliaryDataHash // hex string -> AuxiliaryDataHash
).annotations({
  identifier: "AuxiliaryDataHash.Bytes"
})

export const HexSchema = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  AuxiliaryDataHash // hex string -> AuxiliaryDataHash
).annotations({
  identifier: "AuxiliaryDataHash.Hex"
})

/**
 * Smart constructor for AuxiliaryDataHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = AuxiliaryDataHash.make

/**
 * Check if two AuxiliaryDataHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AuxiliaryDataHash, b: AuxiliaryDataHash): boolean => a === b

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
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes32.HEX_LENGTH,
  maxLength: Bytes32.HEX_LENGTH
}).map((hex) => hex as AuxiliaryDataHash)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse AuxiliaryDataHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): AuxiliaryDataHash => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse AuxiliaryDataHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): AuxiliaryDataHash => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode AuxiliaryDataHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (auxDataHash: AuxiliaryDataHash): Uint8Array => Eff.runSync(Effect.toBytes(auxDataHash))

/**
 * Encode AuxiliaryDataHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (auxDataHash: AuxiliaryDataHash): string => Eff.runSync(Effect.toHex(auxDataHash))

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
   * Parse AuxiliaryDataHash from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<AuxiliaryDataHash, AuxiliaryDataHashError> =>
    Schema.decode(BytesSchema)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataHashError({
            message: "Failed to parse AuxiliaryDataHash from bytes",
            cause
          })
      )
    )

  /**
   * Parse AuxiliaryDataHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<AuxiliaryDataHash, AuxiliaryDataHashError> =>
    Schema.decode(HexSchema)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataHashError({
            message: "Failed to parse AuxiliaryDataHash from hex",
            cause
          })
      )
    )

  /**
   * Encode AuxiliaryDataHash to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (auxDataHash: AuxiliaryDataHash): Eff.Effect<Uint8Array, AuxiliaryDataHashError> =>
    Schema.encode(BytesSchema)(auxDataHash).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataHashError({
            message: "Failed to encode AuxiliaryDataHash to bytes",
            cause
          })
      )
    )

  /**
   * Encode AuxiliaryDataHash to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (auxDataHash: AuxiliaryDataHash): Eff.Effect<string, AuxiliaryDataHashError> =>
    Schema.encode(HexSchema)(auxDataHash).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataHashError({
            message: "Failed to encode AuxiliaryDataHash to hex",
            cause
          })
      )
    )
}
