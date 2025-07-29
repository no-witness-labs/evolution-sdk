import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes448 from "./Bytes448.js"
import { createEncoders } from "./Codec.js"

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
export const KesSignature = pipe(Bytes448.HexSchema, Schema.brand("KesSignature")).annotations({
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
 * Generate a random KesSignature.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes448.BYTES_LENGTH,
  maxLength: Bytes448.BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for KesSignature encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  KesSignatureError
)
