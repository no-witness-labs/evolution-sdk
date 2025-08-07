import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Bytes16 from "./Bytes16.js"

/**
 * Error class for IPv6 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class IPv6Error extends Data.TaggedError("IPv6Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for IPv6 representing an IPv6 network address.
 * Stored as 16 bytes in network byte order (big-endian).
 *
 * @since 2.0.0
 * @category schemas
 */
export const IPv6 = Bytes16.HexSchema.pipe(Schema.brand("IPv6")).annotations({
  identifier: "IPv6"
})

export type IPv6 = typeof IPv6.Type

export const FromBytes = Schema.compose(
  Bytes16.FromBytes, // Uint8Array -> hex string
  IPv6 // hex string -> IPv6
).annotations({
  identifier: "IPv6.Bytes"
})

export const FromHex = Schema.compose(
  Bytes16.HexSchema, // string -> hex string
  IPv6 // hex string -> IPv6
).annotations({
  identifier: "IPv6.Hex"
})

/**
 * Check if two IPv6 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: IPv6, b: IPv6): boolean => a === b

/**
 * Check if the given value is a valid IPv6
 *
 * @since 2.0.0
 * @category predicates
 */
export const isIPv6 = Schema.is(IPv6)

/**
 * FastCheck arbitrary for generating random IPv6 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes16.HEX_LENGTH,
  maxLength: Bytes16.HEX_LENGTH
}).map((hex) => hex as IPv6)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse IPv6 from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): IPv6 =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse IPv6 from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): IPv6 =>
  Eff.runSync(Effect.fromHex(hex))

/**
 * Encode IPv6 to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (ipv6: IPv6): Uint8Array =>
  Eff.runSync(Effect.toBytes(ipv6))

/**
 * Encode IPv6 to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (ipv6: IPv6): string =>
  Eff.runSync(Effect.toHex(ipv6))

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
   * Parse IPv6 from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<IPv6, IPv6Error> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new IPv6Error({
            message: "Failed to parse IPv6 from bytes",
            cause
          })
      )
    )

  /**
   * Parse IPv6 from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<IPv6, IPv6Error> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new IPv6Error({
            message: "Failed to parse IPv6 from hex",
            cause
          })
      )
    )

  /**
   * Encode IPv6 to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (ipv6: IPv6): Eff.Effect<Uint8Array, IPv6Error> =>
    Schema.encode(FromBytes)(ipv6).pipe(
      Eff.mapError(
        (cause) =>
          new IPv6Error({
            message: "Failed to encode IPv6 to bytes",
            cause
          })
      )
    )

  /**
   * Encode IPv6 to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (ipv6: IPv6): Eff.Effect<string, IPv6Error> =>
    Schema.encode(FromHex)(ipv6).pipe(
      Eff.mapError(
        (cause) =>
          new IPv6Error({
            message: "Failed to encode IPv6 to hex",
            cause
          })
      )
    )
}
