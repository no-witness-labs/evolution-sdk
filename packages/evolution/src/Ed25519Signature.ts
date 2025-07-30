import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes64 from "./Bytes64.js"
import { createEncoders } from "./Codec.js"

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
export const Ed25519Signature = pipe(Bytes64.HexSchema, Schema.brand("Ed25519Signature")).annotations({
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
 * Check if two Ed25519Signature instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Ed25519Signature, b: Ed25519Signature): boolean => a === b

/**
 * Generate a random Ed25519Signature.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes64.BYTES_LENGTH,
  maxLength: Bytes64.BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for Ed25519Signature encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  Ed25519SignatureError
)
