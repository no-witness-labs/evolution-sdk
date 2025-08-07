import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as Coin from "./Coin.js"

/**
 * Error class for PositiveCoin related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PositiveCoinError extends Data.TaggedError("PositiveCoinError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Minimum value for a positive coin amount.
 *
 * @since 2.0.0
 * @category constants
 */
export const MIN_POSITIVE_COIN_VALUE = 1n

/**
 * Maximum value for a positive coin amount (maxWord64).
 *
 * @since 2.0.0
 * @category constants
 */
export const MAX_POSITIVE_COIN_VALUE = Coin.MAX_COIN_VALUE

/**
 * Schema for validating positive coin amounts.
 * positive_coin = 1 .. maxWord64
 *
 * @since 2.0.0
 * @category schemas
 */
export const PositiveCoinSchema = Schema.BigIntFromSelf.pipe(
  Schema.filter((value) => value >= MIN_POSITIVE_COIN_VALUE && value <= MAX_POSITIVE_COIN_VALUE),
).annotations({
  message: (issue) =>
    `PositiveCoin must be between ${MIN_POSITIVE_COIN_VALUE} and ${MAX_POSITIVE_COIN_VALUE}, but got ${issue.actual}`,
  identifier: "PositiveCoin",
  title: "Positive Coin Amount",
  description: "A positive amount of native assets (1 to maxWord64)"
})

/**
 * Type alias for PositiveCoin representing positive amounts of native assets.
 * Used in multiasset maps where zero amounts are not allowed.
 *
 * @since 2.0.0
 * @category model
 */
export type PositiveCoin = typeof PositiveCoinSchema.Type

/**
 * Smart constructor for creating PositiveCoin values.
 * Uses the built-in .make property for branded schemas.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PositiveCoinSchema.make

/**
 * Create a PositiveCoin from a regular Coin, throwing if the value is zero.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromCoin = (coin: Coin.Coin): PositiveCoin => {
  if (coin === 0n) {
    throw new PositiveCoinError({
      message: "Cannot create PositiveCoin from zero coin amount"
    })
  }
  return make(coin)
}

/**
 * Convert a PositiveCoin to a regular Coin.
 *
 * @since 2.0.0
 * @category transformation
 */
export const toCoin = (positiveCoin: PositiveCoin): Coin.Coin => positiveCoin

/**
 * Check if a value is a valid PositiveCoin.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = (value: unknown): value is PositiveCoin => Schema.is(PositiveCoinSchema)(value)

/**
 * Add two positive coin amounts safely.
 *
 * @since 2.0.0
 * @category transformation
 */
export const add = (a: PositiveCoin, b: PositiveCoin): PositiveCoin => {
  const result = a + b
  if (result > MAX_POSITIVE_COIN_VALUE) {
    throw new PositiveCoinError({
      message: `Addition overflow: ${a} + ${b} exceeds maximum positive coin value`
    })
  }
  return make(result)
}

/**
 * Subtract two positive coin amounts safely.
 * Note: Result must still be positive.
 *
 * @since 2.0.0
 * @category transformation
 */
export const subtract = (a: PositiveCoin, b: PositiveCoin): PositiveCoin => {
  const result = a - b
  if (result <= 0n) {
    throw new PositiveCoinError({
      message: `Subtraction underflow: ${a} - ${b} results in non-positive value`
    })
  }
  return make(result)
}

/**
 * Compare two positive coin amounts.
 *
 * @since 2.0.0
 * @category ordering
 */
export const compare = (a: PositiveCoin, b: PositiveCoin): -1 | 0 | 1 => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Check if two positive coin amounts are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PositiveCoin, b: PositiveCoin): boolean => a === b

/**
 * FastCheck arbitrary for generating random PositiveCoin values.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.bigInt({
  min: MIN_POSITIVE_COIN_VALUE,
  max: MAX_POSITIVE_COIN_VALUE
}).map(make)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse PositiveCoin from bigint value.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBigInt = (value: bigint): PositiveCoin =>
  Eff.runSync(Effect.fromBigInt(value))

/**
 * Convert PositiveCoin to bigint value.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBigInt = (positiveCoin: PositiveCoin): bigint =>
  Eff.runSync(Effect.toBigInt(positiveCoin))

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
   * Parse PositiveCoin from bigint value with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBigInt = (value: bigint): Eff.Effect<PositiveCoin, PositiveCoinError> =>
    Schema.decode(PositiveCoinSchema)(value).pipe(
      Eff.mapError(
        (cause) =>
          new PositiveCoinError({
            message: "Failed to parse PositiveCoin from bigint",
            cause
          })
      )
    )

  /**
   * Convert PositiveCoin to bigint value with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBigInt = (positiveCoin: PositiveCoin): Eff.Effect<bigint, PositiveCoinError> =>
    Schema.encode(PositiveCoinSchema)(positiveCoin).pipe(
      Eff.mapError(
        (cause) =>
          new PositiveCoinError({
            message: "Failed to encode PositiveCoin to bigint",
            cause
          })
      )
    )
}

// ============================================================================
