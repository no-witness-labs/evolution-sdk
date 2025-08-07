import { Data, Effect as Eff, Schema } from "effect"

import * as Text128 from "./Text128.js"

/**
 * CDDL specification:
 * url = text .size (0..128)
 *
 * @since 2.0.0
 * @category constants
 */
export const URL_MAX_LENGTH = 128

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
export const Url = Text128.FromVariableHex.pipe(Schema.brand("Url"))

/**
 * Type alias for Url.
 *
 * @since 2.0.0
 * @category model
 */
export type Url = typeof Url.Type

export const make = Url.make

export const FromBytes = Schema.compose(
  Text128.FromVariableBytes, // Uint8Array -> hex string
  Url // hex string -> Url
).annotations({
  identifier: "Url.Bytes"
})

export const FromHex = Schema.compose(
  Text128.FromVariableHex, // string -> hex string
  Url // hex string -> Url
).annotations({
  identifier: "Url.Hex"
})

/**
 * Check if two Url instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Url, b: Url): boolean => a === b

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
export const arbitrary = Text128.arbitrary.map((text) => Url.make(text))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Url from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): Url =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse Url from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): Url =>
  Eff.runSync(Effect.fromHex(hex))

/**
 * Encode Url to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (url: Url): Uint8Array =>
  Eff.runSync(Effect.toBytes(url))

/**
 * Encode Url to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (url: Url): string =>
  Eff.runSync(Effect.toHex(url))

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
   * Parse Url from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<Url, UrlError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new UrlError({
            message: "Failed to parse Url from bytes",
            cause
          })
      )
    )

  /**
   * Parse Url from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<Url, UrlError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new UrlError({
            message: "Failed to parse Url from hex",
            cause
          })
      )
    )

  /**
   * Encode Url to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (url: Url): Eff.Effect<Uint8Array, UrlError> =>
    Schema.encode(FromBytes)(url).pipe(
      Eff.mapError(
        (cause) =>
          new UrlError({
            message: "Failed to encode Url to bytes",
            cause
          })
      )
    )

  /**
   * Encode Url to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (url: Url): Eff.Effect<string, UrlError> =>
    Schema.encode(FromHex)(url).pipe(
      Eff.mapError(
        (cause) =>
          new UrlError({
            message: "Failed to encode Url to hex",
            cause
          })
      )
    )
}
