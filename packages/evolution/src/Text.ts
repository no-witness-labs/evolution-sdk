import { Data, Either as E, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"

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

/**
 * Schema for converting between strings and UTF-8 byte arrays.
 * text -> bytes
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.Uint8ArrayFromSelf, Schema.String, {
  strict: true,
  encode: (fromA) => new TextEncoder().encode(fromA),
  decode: (toA) => new TextDecoder().decode(toA)
}).annotations({
  identifier: "Text.FromBytes",
  description: "Transforms UTF-8 bytes to string"
})

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
export const FromHex = Schema.compose(Bytes.FromHex, FromBytes).annotations({
  identifier: "Text.FromHex",
  description: "Transforms hex string to UTF-8 text"
})

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
  export const fromBytes = (bytes: Uint8Array) =>
    E.mapLeft(
      Schema.decodeEither(FromBytes)(bytes),
      (cause) => new TextError({ message: "Failed to decode from bytes", cause })
    )

  /**
   * Convert hex string to text using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromHex = (hex: string) =>
    E.mapLeft(
      Schema.decodeEither(FromHex)(hex),
      (cause) => new TextError({ message: "Failed to decode from hex", cause })
    )

  /**
   * Convert text to bytes using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toBytes = (text: string) =>
    E.mapLeft(
      Schema.encodeEither(FromBytes)(text),
      (cause) => new TextError({ message: "Failed to encode to bytes", cause })
    )

  /**
   * Convert text to hex string using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toHex = (text: string) =>
    E.mapLeft(
      Schema.encodeEither(FromHex)(text),
      (cause) => new TextError({ message: "Failed to encode to hex", cause })
    )
}

/**
 * Convert bytes to text (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromBytes = (bytes: Uint8Array): string => {
  try {
    return Schema.decodeSync(FromBytes)(bytes)
  } catch (cause) {
    throw new TextError({ message: "Failed to decode from bytes", cause })
  }
}

/**
 * Convert hex string to text (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromHex = (hex: string): string => {
  try {
    return Schema.decodeSync(FromHex)(hex)
  } catch (cause) {
    throw new TextError({ message: "Failed to decode from hex", cause })
  }
}

/**
 * Convert text to bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toBytes = (text: string): Uint8Array => {
  try {
    return Schema.encodeSync(FromBytes)(text)
  } catch (cause) {
    throw new TextError({ message: "Failed to encode to bytes", cause })
  }
}

/**
 * Convert text to hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toHex = (text: string): string => {
  try {
    return Schema.encodeSync(FromHex)(text)
  } catch (cause) {
    throw new TextError({ message: "Failed to encode to hex", cause })
  }
}
