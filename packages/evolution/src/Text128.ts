import { Data, Effect as Eff, FastCheck, Schema } from "effect"

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
 * Schema for validating variable-length text between 0 and 128 characters.
 * text .size (0 .. 128)
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromVariableBytes = Text.FromBytes.pipe(
  Schema.filter((text) => text.length >= TEXT128_MIN_LENGTH && text.length <= TEXT128_MAX_LENGTH, {
    message: (issue) =>
      `Text128 must be between ${TEXT128_MIN_LENGTH} and ${TEXT128_MAX_LENGTH} characters, but got ${(issue.actual as string).length} characters.`
  })
)

export const FromVariableHex = Text.FromHex.pipe(
  Schema.filter((text) => text.length >= TEXT128_MIN_LENGTH && text.length <= TEXT128_MAX_LENGTH, {
    message: (issue) =>
      `Text128 must be between ${TEXT128_MIN_LENGTH} and ${TEXT128_MAX_LENGTH} characters, but got ${(issue.actual as string).length} characters.`
  })
).annotations({
  identifier: "Text128.FromHex"
})

/**
 * Schema for Text128 representing a variable-length text string (0-128 chars).
 * text .size (0 .. 128)
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Text128 = FromVariableHex.pipe(Schema.brand("Text128")).annotations({
  identifier: "Text128"
})

export type Text128 = typeof Text128.Type

export const FromBytes = Schema.compose(
  FromVariableBytes, // Uint8Array -> string
  Text128 // string -> Text128
).annotations({
  identifier: "Text128.Bytes"
})

export const FromHex = Schema.compose(
  FromVariableHex, // string -> string
  Text128 // string -> Text128
).annotations({
  identifier: "Text128.Hex"
})

/**
 * Check if two Text128 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Text128, b: Text128): boolean => a === b

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
 * Parse Text128 from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): Text128 => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse Text128 from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): Text128 => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode Text128 to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (text: Text128): Uint8Array => Eff.runSync(Effect.toBytes(text))

/**
 * Encode Text128 to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (text: Text128): string => Eff.runSync(Effect.toHex(text))

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse Text128 from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<Text128, Text128Error> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new Text128Error({
            message: "Failed to parse Text128 from bytes",
            cause
          })
      )
    )

  /**
   * Parse Text128 from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<Text128, Text128Error> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new Text128Error({
            message: "Failed to parse Text128 from hex",
            cause
          })
      )
    )

  /**
   * Encode Text128 to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (text: Text128): Eff.Effect<Uint8Array, Text128Error> =>
    Schema.encode(FromBytes)(text).pipe(
      Eff.mapError(
        (cause) =>
          new Text128Error({
            message: "Failed to encode Text128 to bytes",
            cause
          })
      )
    )

  /**
   * Encode Text128 to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (text: Text128): Eff.Effect<string, Text128Error> =>
    Schema.encode(FromHex)(text).pipe(
      Eff.mapError(
        (cause) =>
          new Text128Error({
            message: "Failed to encode Text128 to hex",
            cause
          })
      )
    )
}
