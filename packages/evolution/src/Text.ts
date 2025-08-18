import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"

/**
 * Error class for Text related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TextError extends Data.TaggedError("TextError")<{
  message?: string
  cause?: unknown
}> {}

export const Text = Schema.String

/**
 * Configuration for text transformations.
 *
 * @since 2.0.0
 * @category types
 */
export interface TextTransformationConfig {
  id: string
  to: Schema.Schema<string, string>
  from: Schema.Schema<Uint8Array, Uint8Array>
}

/**
 * Creates a text transformation schema.
 *
 * @since 2.0.0
 * @category utilities
 */
export const makeTextTransformation = (config: TextTransformationConfig) => {
  const { from: bytesSchema, id, to: inputSchema } = config
  return Schema.transform(bytesSchema, inputSchema, {
    strict: true,
    decode: (input) => new TextDecoder().decode(input),
    encode: (text) => new TextEncoder().encode(text)
  }).annotations({ identifier: id })
}

/**
 * Schema for converting between strings and hex representation of UTF-8 bytes.
 *
 * ```
 * text <-> hex
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = makeTextTransformation({
  id: "Text.FromBytes",
  to: Text,
  from: Schema.Uint8ArrayFromSelf
})
// type t = typeof FromBytes.Type
// type e = typeof FromBytes.Encoded

export const FromHex = Schema.compose(
  Bytes.FromHex, // string → Uint8Array
  FromBytes // Uint8Array → string
)

// =============================================================================
// Text Length Validation Utilities
// =============================================================================

/**
 * Creates a schema that validates text length equals a specific value.
 *
 * @since 2.0.0
 * @category validation
 */
export const textLengthEquals = (length: number, identifier?: string) =>
  Schema.filter((text: string) => text.length === length, {
    message: () => `Expected text length ${length}`,
    identifier
  })

/**
 * Creates a curried filter that validates text length is within a range.
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const textLengthBetween =
  (min: number, max: number, moduleName: string) =>
  <S extends Schema.Schema<any, string>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter(
        (text: string) => {
          const textLength = text.length
          return textLength >= min && textLength <= max
        },
        {
          message: () => `Must be between ${min} and ${max} characters`,
          identifier: `${moduleName}.LengthBetween${min}And${max}`
        }
      )
    )

/**
 * Creates a schema that validates text length is at least min.
 *
 * @since 2.0.0
 * @category validation
 */
export const textLengthMin = (min: number, identifier?: string) =>
  Schema.filter((text: string) => text.length >= min, {
    message: () => `Expected text length at least ${min}`,
    identifier
  })

/**
 * Creates a schema that validates text length is at most max.
 *
 * @since 2.0.0
 * @category validation
 */
export const textLengthMax = (max: number, identifier?: string) =>
  Schema.filter((text: string) => text.length <= max, {
    message: () => `Expected text length at most ${max}`,
    identifier
  })

// =============================================================================
// Text Transformation Utilities
// =============================================================================

// =============================================================================
// Unsafe Helper Functions
// =============================================================================

/**
 * Convert bytes to text (unsafe, no validation).
 *
 * @since 2.0.0
 * @category unsafe
 */
export const fromBytesUnsafe = (bytes: Uint8Array): string => new TextDecoder().decode(bytes)

/**
 * Convert text to bytes (unsafe, no validation).
 *
 * @since 2.0.0
 * @category unsafe
 */
export const toBytesUnsafe = (text: string): Uint8Array => new TextEncoder().encode(text)

/**
 * Convert hex to text (unsafe, no validation).
 *
 * @since 2.0.0
 * @category unsafe
 */
export const fromHexUnsafe = (hex: string): string => {
  const bytes = Bytes.fromHexUnsafe(hex)
  return fromBytesUnsafe(bytes)
}

/**
 * Convert text to hex (unsafe, no validation).
 *
 * @since 2.0.0
 * @category unsafe
 */
export const toHexUnsafe = (text: string): string => {
  const bytes = toBytesUnsafe(text)
  return Bytes.toHexUnsafe(bytes)
}

/**
 * FastCheck arbitrary for generating random text strings
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.string()

/**
 * Either namespace for Text operations that can fail
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Convert bytes to text using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, TextError)

  /**
   * Convert hex string to text using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromHex = Function.makeDecodeEither(FromHex, TextError)

  /**
   * Convert text to bytes using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, TextError)

  /**
   * Convert text to hex string using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toHex = Function.makeEncodeEither(FromHex, TextError)
}

// =============================================================================
// Public (throwing) API
// =============================================================================

/**
 * Convert bytes to text (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, TextError, "Text.fromBytes")

/**
 * Convert hex string to text (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromHex = Function.makeDecodeSync(FromHex, TextError, "Text.fromHex")

/**
 * Convert text to bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toBytes = Function.makeEncodeSync(FromBytes, TextError, "Text.toBytes")

/**
 * Convert text to hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toHex = Function.makeEncodeSync(FromHex, TextError, "Text.toHex")
