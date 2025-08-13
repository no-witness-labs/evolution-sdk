import { Data, Either as E, FastCheck, Schema } from "effect"

import * as Bytes4 from "./Bytes4.js"

/**
 * Error class for IPv4 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class IPv4Error extends Data.TaggedError("IPv4Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for IPv4 representing an IPv4 network address.
 * Stored as 4 bytes in network byte order (big-endian).
 *
 * @since 2.0.0
 * @category schemas
 */
export const IPv4 = Bytes4.HexSchema.pipe(Schema.brand("IPv4")).annotations({
  identifier: "IPv4"
})

export type IPv4 = typeof IPv4.Type

export const FromBytes = Schema.compose(
  Bytes4.FromBytes, // Uint8Array -> hex string
  IPv4 // hex string -> IPv4
).annotations({
  identifier: "IPv4.Bytes"
})

export const FromHex = Schema.compose(
  Bytes4.HexSchema, // string -> hex string
  IPv4 // hex string -> IPv4
).annotations({
  identifier: "IPv4.Hex"
})

/**
 * Check if two IPv4 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: IPv4, b: IPv4): boolean => a === b

/**
 * Check if the given value is a valid IPv4
 *
 * @since 2.0.0
 * @category predicates
 */
export const isIPv4 = Schema.is(IPv4)

/**
 * FastCheck arbitrary for generating random IPv4 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.hexaString({
  minLength: Bytes4.HEX_LENGTH,
  maxLength: Bytes4.HEX_LENGTH
}).map((hex) => hex as IPv4)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse IPv4 from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): IPv4 => {
  try {
    return Schema.decodeSync(FromBytes)(bytes)
  } catch (cause) {
    throw new IPv4Error({
      message: "Failed to parse IPv4 from bytes",
      cause
    })
  }
}

/**
 * Parse IPv4 from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): IPv4 => {
  try {
    return Schema.decodeSync(FromHex)(hex)
  } catch (cause) {
    throw new IPv4Error({
      message: "Failed to parse IPv4 from hex",
      cause
    })
  }
}

/**
 * Encode IPv4 to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (ipv4: IPv4): Uint8Array => {
  try {
    return Schema.encodeSync(FromBytes)(ipv4)
  } catch (cause) {
    throw new IPv4Error({
      message: "Failed to encode IPv4 to bytes",
      cause
    })
  }
}

/**
 * Encode IPv4 to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (ipv4: IPv4): string => {
  try {
    return Schema.encodeSync(FromHex)(ipv4)
  } catch (cause) {
    throw new IPv4Error({
      message: "Failed to encode IPv4 to hex",
      cause
    })
  }
}

// ============================================================================
// Either Namespace
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse IPv4 from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): E.Either<IPv4, IPv4Error> =>
    E.mapLeft(
      Schema.decodeEither(FromBytes)(bytes),
      (cause) =>
        new IPv4Error({
          message: "Failed to parse IPv4 from bytes",
          cause
        })
    )

  /**
   * Parse IPv4 from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): E.Either<IPv4, IPv4Error> =>
    E.mapLeft(
      Schema.decodeEither(FromHex)(hex),
      (cause) =>
        new IPv4Error({
          message: "Failed to parse IPv4 from hex",
          cause
        })
    )

  /**
   * Encode IPv4 to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (ipv4: IPv4): E.Either<Uint8Array, IPv4Error> =>
    E.mapLeft(
      Schema.encodeEither(FromBytes)(ipv4),
      (cause) =>
        new IPv4Error({
          message: "Failed to encode IPv4 to bytes",
          cause
        })
    )

  /**
   * Encode IPv4 to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (ipv4: IPv4): E.Either<string, IPv4Error> =>
    E.mapLeft(
      Schema.encodeEither(FromHex)(ipv4),
      (cause) =>
        new IPv4Error({
          message: "Failed to encode IPv4 to hex",
          cause
        })
    )
}
