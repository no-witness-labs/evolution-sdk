import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as NetworkId from "./NetworkId.js"

/**
 * Error class for Network related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Network representing Cardano network types.
 * Supports Mainnet, Preview, Preprod, and Custom networks.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Network = Schema.String.pipe(
  Schema.filter((str): str is "Mainnet" | "Preview" | "Preprod" | "Custom" => 
    str === "Mainnet" || str === "Preview" || str === "Preprod" || str === "Custom"
  ),
  Schema.brand("Network")
).annotations({
  identifier: "Network",
  title: "Cardano Network",
  description: "A Cardano network type (Mainnet, Preview, Preprod, or Custom)"
})

/**
 * Type alias for Network representing Cardano network types.
 *
 * @since 2.0.0
 * @category model
 */
export type Network = typeof Network.Type

/**
 * Smart constructor for Network that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Schema.decodeSync(Network)

/**
 * Check if two Network instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Network, b: Network): boolean => a === b

/**
 * Check if a value is a valid Network.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = (value: unknown): value is Network => Schema.is(Network)(value)

/**
 * FastCheck arbitrary for generating random Network instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.constantFrom("Mainnet", "Preview", "Preprod", "Custom").map((literal) => 
  make(literal)
)

/**
 * Converts a Network type to NetworkId number.
 *
 * @since 2.0.0
 * @category conversion
 */
export const toId = <T extends Network>(network: T): NetworkId.NetworkId => {
  switch (network) {
    case "Preview":
    case "Preprod":
    case "Custom":
      return NetworkId.make(0)
    case "Mainnet":
      return NetworkId.make(1)
    default:
      throw new Error(`Exhaustive check failed: Unhandled case ${network}`)
  }
}

/**
 * Converts a NetworkId to Network type.
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromId = (id: NetworkId.NetworkId): Network => {
  switch (id) {
    case 0:
      return make("Preview")
    case 1:
      return make("Mainnet")
    default:
      throw new Error(`Exhaustive check failed: Unhandled case ${id}`)
  }
}

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Network from string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromString = (str: string): Network =>
  Eff.runSync(Effect.fromString(str))

/**
 * Encode Network to string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toString = (network: Network): string =>
  Eff.runSync(Effect.toString(network))

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
   * Parse Network from string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromString = (str: string): Eff.Effect<Network, NetworkError> =>
    Schema.decode(Network)(str).pipe(
      Eff.mapError(
        (cause) =>
          new NetworkError({
            message: "Failed to parse Network from string",
            cause
          })
      )
    )

  /**
   * Encode Network to string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toString = (network: Network): Eff.Effect<string, NetworkError> =>
    Schema.encode(Network)(network).pipe(
      Eff.mapError(
        (cause) =>
          new NetworkError({
            message: "Failed to encode Network to string",
            cause
          })
      )
    )
}

// ============================================================================
