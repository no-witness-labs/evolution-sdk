import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"
import * as Text from "./Text.js"

/**
 * Error class for Text128 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class Text128Error extends Data.TaggedError("Text128Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Constants for Text128 validation.
 * text .size (0 .. 128)
 *
 * @since 2.0.0
 * @category constants
 */
export const TEXT128_MIN_LENGTH = 0
export const TEXT128_MAX_LENGTH = 128

/**
 * Schema for Text128 representing a variable-length text string (0-128 chars).
 * text .size (0 .. 128)
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Text128 = Text.Text.pipe(Text.textLengthBetween(TEXT128_MIN_LENGTH, TEXT128_MAX_LENGTH, "Text128"))

export type Text128 = typeof Text128.Type

export const FromVariableBytes = Text.makeTextTransformation({
  id: "Text128.FromBytes",
  to: Text128,
  from: Schema.Uint8ArrayFromSelf
})

export const FromVariableHex = Schema.compose(
  Bytes.BytesFromHexLenient,
  FromVariableBytes // Uint8Array -> Text128
).annotations({
  identifier: "Text128.FromHex"
})

/**
 * Check if the given value is a valid Text128
 *
 * @since 2.0.0
 * @category predicates
 */
export const isText128 = Schema.is(Text128)

/**
 * FastCheck arbitrary for generating random Text128 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.string({
  minLength: TEXT128_MIN_LENGTH,
  maxLength: TEXT128_MAX_LENGTH
}).map((text) => text as Text128)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Text128 from bytes (unsafe)
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromVariableBytes, Text128Error, "Text128.fromBytes")

/**
 * Parse Text128 from hex string (unsafe)
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromVariableHex, Text128Error, "Text128.fromHex")

/**
 * Encode Text128 to bytes (unsafe)
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromVariableBytes, Text128Error, "Text128.toBytes")

/**
 * Encode Text128 to hex string (unsafe)
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromVariableHex, Text128Error, "Text128.toHex")

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
   * Parse Text128 from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromVariableBytes, Text128Error)

  /**
   * Parse Text128 from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromVariableHex, Text128Error)

  /**
   * Encode Text128 to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromVariableBytes, Text128Error)

  /**
   * Encode Text128 to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromVariableHex, Text128Error)
}
