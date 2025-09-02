import { Data, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"
import * as Text128 from "./Text128.js"

/**
 * Error class for Url related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class UrlError extends Data.TaggedError("UrlError")<{
  message?: string
  reason?: "InvalidLength" | "InvalidFormat" | "TooLong"
  cause?: unknown
}> {}

/**
 * Schema for Url representing URLs as branded text.
 * url = text .size (0..128)
 *
 * @since 2.0.0
 * @category model
 */
export class Url extends Schema.TaggedClass<Url>("Url")("Url", {
  href: Text128.Text128
}) {}

export const make = (...args: ConstructorParameters<typeof Url>) => new Url(...args)

export const FromBytes = Schema.transform(Text128.FromVariableBytes, Url, {
  strict: true,
  decode: (bytes) => new Url({ href: bytes }, { disableValidation: true }), // Disable validation since we already check length in Text128
  encode: (url) => url.href
})

export const FromHex = Schema.compose(
  Bytes.BytesFromHexLenient, // string -> hex string
  FromBytes
).annotations({
  identifier: "Url.Hex"
})

/**
 * Check if two Url instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Url, b: Url): boolean => a.href === b.href

/**
 * Check if the given value is a valid Url
 *
 * @since 2.0.0
 * @category predicates
 */
export const isUrl = Schema.is(Url)

/**
 * FastCheck arbitrary for generating random Url instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = Text128.arbitrary.map((text) => Url.make({ href: text }, { disableValidation: true }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Url from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, UrlError, "Url.fromBytes")

/**
 * Parse Url from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, UrlError, "Url.fromHex")

/**
 * Encode Url to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, UrlError, "Url.toBytes")

/**
 * Encode Url to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, UrlError, "Url.toHex")

// ============================================================================
// Either Namespace
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse Url from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeCBORDecodeEither(FromBytes, UrlError)

  /**
   * Parse Url from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeCBORDecodeEither(FromHex, UrlError)

  /**
   * Encode Url to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeSync(FromBytes, UrlError, "Url.toBytes")

  /**
   * Encode Url to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeSync(FromHex, UrlError, "Url.toHex")
}
