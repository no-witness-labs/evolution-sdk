import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

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
 * @category model
 */
export class KESVkey extends Schema.TaggedClass<KESVkey>()("KESVkey", {
  bytes: Bytes32.BytesSchema
}) {}

/**
 * Schema for transforming between Uint8Array and KESVkey.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Bytes32.BytesSchema, KESVkey, {
  strict: true,
  decode: (bytes) => new KESVkey({ bytes }, { disableValidation: true }),
  encode: (k) => k.bytes
}).annotations({
  identifier: "KESVkey.FromBytes"
})

/**
 * Schema for transforming between hex string and KESVkey.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.FromHex, // string -> Bytes32
  FromBytes // Bytes32 -> KESVkey
).annotations({
  identifier: "KESVkey.FromHex"
})

/**
 * Smart constructor for KESVkey.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof KESVkey>) => new KESVkey(...args)

/**
 * Check if two KESVkey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KESVkey, b: KESVkey): boolean => Bytes32.equals(a.bytes, b.bytes)

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
export const arbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map(
  (bytes) => new KESVkey({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse KESVkey from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, KESVkeyError, "KESVkey.fromBytes")

/**
 * Parse KESVkey from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, KESVkeyError, "KESVkey.fromHex")

/**
 * Encode KESVkey to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, KESVkeyError, "KESVkey.toBytes")

/**
 * Encode KESVkey to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, KESVkeyError, "KESVkey.toHex")

// ============================================================================
// Either Namespace (composable non-throwing API)
// ============================================================================

export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, KESVkeyError)
  export const fromHex = Function.makeDecodeEither(FromHex, KESVkeyError)
  export const toBytes = Function.makeEncodeEither(FromBytes, KESVkeyError)
  export const toHex = Function.makeEncodeEither(FromHex, KESVkeyError)
}
