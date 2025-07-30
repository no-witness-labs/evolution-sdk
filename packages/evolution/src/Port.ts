import { Data, Schema } from "effect"

import * as Numeric from "./Numeric.js"

/**
 * CDDL specification:
 * port = uint .le 65535
 *
 * @since 2.0.0
 * @category constants
 */
export const PORT_MIN_VALUE = Numeric.UINT16_MIN
export const PORT_MAX_VALUE = Numeric.UINT16_MAX

/**
 * Error class for Port related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PortError extends Data.TaggedError("PortError")<{
  message?: string
  reason?: "InvalidRange" | "NegativeValue" | "ExceedsMaxValue"
}> {}

/**
 * Schema for validating port numbers (0-65535).
 *
 * @since 2.0.0
 * @category schemas
 */
export const PortSchema = Numeric.Uint16Schema.annotations({
  identifier: "Port",
  description: "Network port number (16-bit unsigned integer)"
})

/**
 * Type alias for Port representing network port numbers.
 * Valid range is 0-65535 as per standard TCP/UDP port specification.
 *
 * @since 2.0.0
 * @category model
 */
export type Port = typeof PortSchema.Type

/**
 * Smart constructor for creating Port values.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (value: number): Port => PortSchema.make(value)

/**
 * Check if a value is a valid Port.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = (value: unknown): value is Port => Schema.is(PortSchema)(value)

/**
 * Check if two Port instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Port, b: Port): boolean => a === b

/**
 * Check if a port is a well-known port (0-1023).
 *
 * @since 2.0.0
 * @category predicates
 */
export const isWellKnown = (port: Port): boolean => port >= 0 && port <= 1023

/**
 * Check if a port is a registered port (1024-49151).
 *
 * @since 2.0.0
 * @category predicates
 */
export const isRegistered = (port: Port): boolean => port >= 1024 && port <= 49151

/**
 * Check if a port is a dynamic/private port (49152-65535).
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDynamic = (port: Port): boolean => port >= 49152 && port <= 65535

/**
 * Generate a random Port.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = Numeric.Uint16Generator

/**
 * Synchronous encoding/decoding utilities.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Encode = {
  sync: Schema.encodeSync(PortSchema)
}

export const Decode = {
  sync: Schema.decodeUnknownSync(PortSchema)
}

/**
 * Either encoding/decoding utilities.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const EncodeEither = {
  either: Schema.encodeEither(PortSchema)
}

export const DecodeEither = {
  either: Schema.decodeUnknownEither(PortSchema)
}
