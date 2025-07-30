import { Data, Schema } from "effect"

import * as _Codec from "./Codec.js"
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
 * Generate a random Url.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = Text128.generator.map((text) => Url.make(text))

export const Codec = _Codec.createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  UrlError
)
