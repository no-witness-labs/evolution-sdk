import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes16 from "./Bytes16.js"
import * as Function from "./Function.js"

/**
 * Error class for IPv6 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class IPv6Error extends Data.TaggedError("IPv6Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * IPv6 model stored as 16 raw bytes (network byte order).
 *
 * @since 2.0.0
 * @category schemas
 */
export class IPv6 extends Schema.TaggedClass<IPv6>()("IPv6", {
  bytes: Bytes16.BytesSchema
}) {
  toJSON(): string {
    return toHex(this)
  }
  toString(): string {
    return toHex(this)
  }
}

// Transform between raw bytes (Uint8Array length 16) and IPv6
export const FromBytes = Schema.transform(Bytes16.BytesSchema, IPv6, {
  strict: true,
  decode: (bytes) => new IPv6({ bytes }, { disableValidation: true }),
  encode: (ipv6) => ipv6.bytes
}).annotations({
  identifier: "IPv6.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes16.FromHex, // string -> Uint8Array(16)
  FromBytes // bytes -> IPv6
).annotations({
  identifier: "IPv6.FromHex"
})

/**
 * Equality on bytes
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: IPv6, b: IPv6): boolean => Bytes.equals(a.bytes, b.bytes)

/**
 * Predicate for IPv6 instances
 *
 * @since 2.0.0
 * @category predicates
 */
export const isIPv6 = Schema.is(IPv6)

/**
 * FastCheck arbitrary for generating random IPv6 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({ minLength: 16, maxLength: 16 }).map(
  (bytes) => new IPv6({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse IPv6 from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, IPv6Error, "IPv6.fromBytes")

/**
 * Parse IPv6 from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, IPv6Error, "IPv6.fromHex")

/**
 * Encode IPv6 to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, IPv6Error, "IPv6.toBytes")

/**
 * Encode IPv6 to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, IPv6Error, "IPv6.toHex")

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
   * Parse IPv6 from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, IPv6Error)

  /**
   * Parse IPv6 from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, IPv6Error)

  /**
   * Encode IPv6 to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, IPv6Error)

  /**
   * Encode IPv6 to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, IPv6Error)
}
