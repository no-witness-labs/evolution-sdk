import { Data, Schema } from "effect"

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
export const Network = Schema.Literal("Mainnet", "Preview", "Preprod", "Custom")

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
