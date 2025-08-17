import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes64 from "./Bytes64.js"
import * as Function from "./Function.js"

/**
 * Class-based Ed25519Signature with compile-time and runtime safety.
 * ed25519_signature = bytes .size 64
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category model
 */
export class Ed25519Signature extends Schema.Class<Ed25519Signature>("Ed25519Signature")({
  bytes: Bytes64.BytesSchema
}) {
  toJSON(): string {
    return toHex(this)
  }

  toString(): string {
    return toHex(this)
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `Ed25519Signature(${toHex(this)})`
  }
}

/**
 * Schema transformer from bytes to Ed25519Signature.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Bytes64.BytesSchema, Ed25519Signature, {
  strict: true,
  decode: (bytes) =>
    make(
      { bytes },
      { disableValidation: true } // Disable validation since we already check length in Bytes64
    ),
  encode: (signature) => new Uint8Array(signature.bytes)
}).annotations({
  identifier: "Ed25519Signature.FromBytes"
})

/**
 * Schema transformer from hex string to Ed25519Signature.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes64.FromHex, // string -> Bytes64
  FromBytes
).annotations({
  identifier: "Ed25519Signature.FromHex"
})

// ============================================================================
// Schema Integration (for Effect Schema compatibility)
// ============================================================================

/**
 * Error class for Ed25519SignatureClass related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class Ed25519SignatureError extends Data.TaggedError("Ed25519SignatureError")<{
  message?: string
  cause?: unknown
}> {}

// ============================================================================
// Core Functions (functional interface)
// ============================================================================

export const make = (...args: ConstructorParameters<typeof Ed25519Signature>) => new Ed25519Signature(...args)

/**
 * Parse Ed25519Signature from bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, Ed25519SignatureError, "Ed25519Signature.fromBytes")

/**
 * Parse Ed25519Signature from hex string (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromHex = Function.makeDecodeSync(FromHex, Ed25519SignatureError, "Ed25519Signature.fromHex")

/**
 * Convert to hex string using optimized lookup table.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, Ed25519SignatureError, "Ed25519Signature.toHex")

/**
 * Get the underlying bytes (returns a copy for safety).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, Ed25519SignatureError, "Ed25519Signature.toBytes")

/**
 * Check equality with another Ed25519Signature.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Ed25519Signature, b: Ed25519Signature): boolean => Bytes.equals(a.bytes, b.bytes)

/**
 * Check if value is an Ed25519Signature instance.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(Ed25519Signature)

/**
 * FastCheck arbitrary for generating random Ed25519Signature instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<Ed25519Signature> = FastCheck.uint8Array({
  minLength: 64,
  maxLength: 64
}).map((bytes) => make({ bytes }, { disableValidation: true }))

export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, Ed25519SignatureError)
  export const fromHex = Function.makeDecodeEither(FromHex, Ed25519SignatureError)
  export const toBytes = Function.makeEncodeEither(FromBytes, Ed25519SignatureError)
  export const toHex = Function.makeEncodeEither(FromHex, Ed25519SignatureError)
}
