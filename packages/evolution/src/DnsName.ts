import { Data, Schema } from "effect"

import * as _Codec from "./Codec.js"
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
 * Generate a random DnsName.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = Text128.generator.map((text) => make(text))

/**
 * Codec utilities for DnsName encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = _Codec.createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  DnsNameError
)
