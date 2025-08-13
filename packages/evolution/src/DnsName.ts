import { Data, Effect as Eff, Schema } from "effect"

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
 * Check if the given value is a valid DnsName
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDnsName = Schema.is(DnsName)

/**
 * FastCheck arbitrary for generating random DnsName instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = Text128.arbitrary.map((text) => make(text))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse DnsName from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): DnsName => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse DnsName from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): DnsName => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode DnsName to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (dnsName: DnsName): Uint8Array => Eff.runSync(Effect.toBytes(dnsName))

/**
 * Encode DnsName to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (dnsName: DnsName): string => Eff.runSync(Effect.toHex(dnsName))

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
   * Parse DnsName from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<DnsName, DnsNameError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new DnsNameError({
            message: "Failed to parse DnsName from bytes",
            cause
          })
      )
    )

  /**
   * Parse DnsName from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<DnsName, DnsNameError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new DnsNameError({
            message: "Failed to parse DnsName from hex",
            cause
          })
      )
    )

  /**
   * Encode DnsName to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (dnsName: DnsName): Eff.Effect<Uint8Array, DnsNameError> =>
    Schema.encode(FromBytes)(dnsName).pipe(
      Eff.mapError(
        (cause) =>
          new DnsNameError({
            message: "Failed to encode DnsName to bytes",
            cause
          })
      )
    )

  /**
   * Encode DnsName to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (dnsName: DnsName): Eff.Effect<string, DnsNameError> =>
    Schema.encode(FromHex)(dnsName).pipe(
      Eff.mapError(
        (cause) =>
          new DnsNameError({
            message: "Failed to encode DnsName to hex",
            cause
          })
      )
    )
}
