/**
 * Auxiliary Data Hash module - provides an alias for Bytes32 specialized for auxiliary data hashing.
 *
 * In Cardano, auxiliary_data_hash = Bytes32, representing a 32-byte hash
 * used for auxiliary data (metadata) attached to transactions.
 *
 * @since 2.0.0
 */

import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

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
export const AuxiliaryDataHash = pipe(Bytes32.HexSchema, Schema.brand("AuxiliaryDataHash")).annotations({
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
 * Check if two AuxiliaryDataHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AuxiliaryDataHash, b: AuxiliaryDataHash): boolean => a === b

/**
 * Generate a random AuxiliaryDataHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for AuxiliaryDataHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: BytesSchema,
    hex: HexSchema
  },
  AuxiliaryDataHashError
)
