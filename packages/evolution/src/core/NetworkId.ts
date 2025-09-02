import { Data, FastCheck, Schema } from "effect"

/**
 * Error class for NetworkId related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NetworkIdError extends Data.TaggedError("NetworkIdError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for NetworkId representing a Cardano network identifier.
 * 0 = Testnet, 1 = Mainnet
 *
 * @since 2.0.0
 * @category schemas
 */
export const NetworkId = Schema.NonNegativeInt.annotations({
  identifier: "NetworkId"
})

export type NetworkId = typeof NetworkId.Type

/**
 * Smart constructor for NetworkId that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = NetworkId.make

/**
 * Check if two NetworkId instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: NetworkId, b: NetworkId): boolean => a === b

/**
 * FastCheck generator for creating NetworkId instances.
 * Generates values 0 (Testnet) or 1 (Mainnet).
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.integer({
  min: 0,
  max: 2
}).map((number) => make(number))
