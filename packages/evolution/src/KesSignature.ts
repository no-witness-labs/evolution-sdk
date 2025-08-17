import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes448 from "./Bytes448.js"
import * as Function from "./Function.js"

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
 * KesSignature model stored as 448 raw bytes.
 * kes_signature = bytes .size 448
 *
 * @since 2.0.0
 * @category schemas
 */
export class KesSignature extends Schema.TaggedClass<KesSignature>()("KesSignature", {
  bytes: Bytes448.BytesSchema
}) {
  toJSON(): string {
    return toHex(this)
  }
  toString(): string {
    return toHex(this)
  }
}

// Transform between raw bytes (Uint8Array length 448) and KesSignature
export const FromBytes = Schema.transform(Bytes448.BytesSchema, KesSignature, {
  strict: true,
  decode: (bytes) => new KesSignature({ bytes }, { disableValidation: true }),
  encode: (value) => value.bytes
}).annotations({
  identifier: "KesSignature.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes448.FromHex, // string -> Uint8Array(448)
  FromBytes // bytes -> KesSignature
).annotations({
  identifier: "KesSignature.FromHex"
})

/**
 * Equality on bytes
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KesSignature, b: KesSignature): boolean => Bytes.equals(a.bytes, b.bytes)

/**
 * Predicate for KesSignature instances
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
export const arbitrary = FastCheck.uint8Array({ minLength: 448, maxLength: 448 }).map(
  (bytes) => new KesSignature({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse KesSignature from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, KesSignatureError, "KesSignature.fromBytes")

/**
 * Parse KesSignature from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, KesSignatureError, "KesSignature.fromHex")

/**
 * Encode KesSignature to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, KesSignatureError, "KesSignature.toBytes")

/**
 * Encode KesSignature to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, KesSignatureError, "KesSignature.toHex")

// ============================================================================
// Either Namespace
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse KesSignature from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, KesSignatureError)

  /**
   * Parse KesSignature from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, KesSignatureError)

  /**
   * Encode KesSignature to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, KesSignatureError)

  /**
   * Encode KesSignature to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, KesSignatureError)
}
