import { Data, FastCheck, Schema } from "effect"

import { createEncoders } from "./Codec.js"
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

export const generator = FastCheck.string({
  minLength: TEXT128_MIN_LENGTH,
  maxLength: TEXT128_MAX_LENGTH
})

export const Codec = createEncoders(
  {
    bytes: FromVariableBytes,
    hex: FromVariableHex
  },
  Text128Error
)
