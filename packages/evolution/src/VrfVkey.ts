import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

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
export class VrfVkey extends Schema.TaggedClass<VrfVkey>()("VrfVkey", {
  bytes: Bytes32.BytesSchema
}) {}

export const FromBytes = Schema.transform(Bytes32.BytesSchema, VrfVkey, {
  strict: true,
  decode: (bytes) => new VrfVkey({ bytes }),
  encode: (vrfVkey) => vrfVkey.bytes
}).annotations({
  identifier: "VrfVkey.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes32.FromHex, // string -> Bytes32
  FromBytes // Bytes32 -> VrfVkey
).annotations({
  identifier: "VrfVkey.FromHex"
})

export const make = (...args: ConstructorParameters<typeof VrfVkey>) => new VrfVkey(...args)

/**
 * Check if two VrfVkey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfVkey, b: VrfVkey): boolean => Bytes.equals(a.bytes, b.bytes)

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
export const arbitrary = FastCheck.uint8Array({
  minLength: Bytes32.BYTES_LENGTH,
  maxLength: Bytes32.BYTES_LENGTH
}).map((bytes) => new VrfVkey({ bytes }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse VrfVkey from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, VrfVkeyError, "VrfVkey.fromBytes")

/**
 * Parse VrfVkey from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, VrfVkeyError, "VrfVkey.fromHex")

/**
 * Encode VrfVkey to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, VrfVkeyError, "VrfVkey.toBytes")

/**
 * Encode VrfVkey to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, VrfVkeyError, "VrfVkey.toHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse VrfVkey from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, VrfVkeyError)

  /**
   * Parse VrfVkey from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, VrfVkeyError)

  /**
   * Encode VrfVkey to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, VrfVkeyError)

  /**
   * Encode VrfVkey to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, VrfVkeyError)
}
