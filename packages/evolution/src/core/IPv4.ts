import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes4 from "./Bytes4.js"
import * as Function from "./Function.js"

/**
 * Error class for IPv4 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class IPv4Error extends Data.TaggedError("IPv4Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * IPv4 model stored as 4 raw bytes (network byte order).
 *
 * @since 2.0.0
 * @category schemas
 */
export class IPv4 extends Schema.TaggedClass<IPv4>()("IPv4", {
  bytes: Bytes4.BytesSchema
}) {
  toJSON(): string {
    return toHex(this)
  }
  toString(): string {
    return toHex(this)
  }
}

// Transform between raw bytes (Uint8Array length 4) and IPv4
export const FromBytes = Schema.transform(Bytes4.BytesSchema, IPv4, {
  strict: true,
  decode: (bytes) => new IPv4({ bytes }, { disableValidation: true }),
  encode: (ipv4) => ipv4.bytes
}).annotations({
  identifier: "IPv4.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes4.FromHex, // string -> Uint8Array(4)
  FromBytes // bytes -> IPv4
).annotations({
  identifier: "IPv4.FromHex"
})

/**
 * Equality on bytes
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: IPv4, b: IPv4): boolean => Bytes.equals(a.bytes, b.bytes)

/**
 * Predicate for IPv4 instances
 *
 * @since 2.0.0
 * @category predicates
 */
export const isIPv4 = Schema.is(IPv4)

/**
 * FastCheck arbitrary for generating random IPv4 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({ minLength: 4, maxLength: 4 }).map(
  (bytes) => new IPv4({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse IPv4 from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, IPv4Error, "IPv4.fromBytes")

/**
 * Parse IPv4 from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, IPv4Error, "IPv4.fromHex")

/**
 * Encode IPv4 to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, IPv4Error, "IPv4.toBytes")

/**
 * Encode IPv4 to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, IPv4Error, "IPv4.toHex")

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
   * Parse IPv4 from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, IPv4Error)

  /**
   * Parse IPv4 from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, IPv4Error)

  /**
   * Encode IPv4 to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, IPv4Error)

  /**
   * Encode IPv4 to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, IPv4Error)
}
