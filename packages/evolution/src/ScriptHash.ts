import { Data, FastCheck, pipe, Schema } from "effect"

import { createEncoders } from "./Codec.js"
import * as Hash28 from "./Hash28.js"

/**
 * Error class for ScriptHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ScriptHashError extends Data.TaggedError("ScriptHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for ScriptHash representing a script hash credential.
 * script_hash = hash28
 * Follows CIP-0019 binary representation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ScriptHash = pipe(Hash28.HexSchema, Schema.brand("ScriptHash")).annotations({
  identifier: "ScriptHash"
})

export type ScriptHash = typeof ScriptHash.Type

/**
 * Schema for transforming between Uint8Array and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.compose(
  Hash28.FromBytes, // Uint8Array -> hex string
  ScriptHash // hex string -> ScriptHash
).annotations({
  identifier: "ScriptHash.Bytes"
})

/**
 * Schema for transforming between hex string and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Schema.compose(
  Hash28.HexSchema, // string -> hex string
  ScriptHash // hex string -> ScriptHash
).annotations({
  identifier: "ScriptHash.Hex"
})

/**
 * Check if two ScriptHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptHash, b: ScriptHash): boolean => a === b

/**
 * Generate a random ScriptHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Hash28.HASH28_BYTES_LENGTH,
  maxLength: Hash28.HASH28_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for ScriptHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: BytesSchema,
    hex: HexSchema
  },
  ScriptHashError
)
