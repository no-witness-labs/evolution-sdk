import { Data, Schema } from "effect"

import * as Function from "./Function.js"
import * as Text128 from "./Text128.js"

/**
 * Error class for DnsName related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class DnsNameError extends Data.TaggedError("DnsNameError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for DnsName with DNS-specific validation.
 * dns_name = text .size (0 .. 128)
 *
 * @since 2.0.0
 * @category model
 */
export const DnsName = Text128.FromVariableHex.pipe(Schema.brand("DnsName"))

/**
 * Type alias for DnsName.
 *
 * @since 2.0.0
 * @category model
 */
export type DnsName = typeof DnsName.Type

export const FromBytes = Schema.compose(Text128.FromVariableBytes, DnsName).annotations({
  identifier: "DnsName.FromBytes"
})

export const FromHex = Schema.compose(Text128.FromVariableHex, DnsName).annotations({
  identifier: "DnsName.FromHex"
})

/**
 * Create a DnsName from a string.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = DnsName.make

/**
 * Check if two DnsName instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: DnsName, b: DnsName): boolean => a === b

/**
 * Check if the given value is a valid DnsName
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDnsName = Schema.is(DnsName)

/**
 * FastCheck arbitrary for generating random DnsName instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = Text128.arbitrary.map((text) => make(text))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse DnsName from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, DnsNameError, "DnsName.fromBytes")

/**
 * Parse DnsName from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, DnsNameError, "DnsName.fromHex")

/**
 * Encode DnsName to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, DnsNameError, "DnsName.toBytes")

/**
 * Encode DnsName to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, DnsNameError, "DnsName.toHex")

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
   * Parse DnsName from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, DnsNameError)

  /**
   * Parse DnsName from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, DnsNameError)

  /**
   * Encode DnsName to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, DnsNameError)

  /**
   * Encode DnsName to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, DnsNameError)
}
