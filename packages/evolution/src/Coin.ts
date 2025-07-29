import { Data, FastCheck, Schema } from "effect"

/**
 * Error class for Coin related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class CoinError extends Data.TaggedError("CoinError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Maximum value for a coin amount (maxWord64).
 *
 * @since 2.0.0
 * @category constants
 */
export const MAX_COIN_VALUE = 18446744073709551615n

/**
 * Schema for validating coin amounts as unsigned 64-bit integers.
 * coin = uint
 *
 * @since 2.0.0
 * @category schemas
 */
export const CoinSchema = Schema.BigIntFromSelf.pipe(
  Schema.filter((value) => value >= 0n && value <= MAX_COIN_VALUE)
).annotations({
  message: (issue) => `Coin must be between 0 and ${MAX_COIN_VALUE}, but got ${issue.actual}`,
  identifier: "Coin"
})

/**
 * Type alias for Coin representing ADA amounts in lovelace.
 * 1 ADA = 1,000,000 lovelace
 *
 * @since 2.0.0
 * @category model
 */
export type Coin = typeof CoinSchema.Type

/**
 * Smart constructor for creating Coin values.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = CoinSchema.make

/**
 * Check if a value is a valid Coin.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(CoinSchema)

/**
 * Add two coin amounts safely.
 *
 * @since 2.0.0
 * @category transformation
 */
export const add = (a: Coin, b: Coin): Coin => {
  const result = a + b
  if (result > MAX_COIN_VALUE) {
    throw new CoinError({
      message: `Addition overflow: ${a} + ${b} exceeds maximum coin value`
    })
  }
  return result
}

/**
 * Subtract two coin amounts safely.
 *
 * @since 2.0.0
 * @category transformation
 */
export const subtract = (a: Coin, b: Coin): Coin => {
  const result = a - b
  if (result < 0n) {
    throw new CoinError({
      message: `Subtraction underflow: ${a} - ${b} results in negative value`
    })
  }
  return result
}

/**
 * Compare two coin amounts.
 *
 * @since 2.0.0
 * @category ordering
 */
export const compare = (a: Coin, b: Coin): -1 | 0 | 1 => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Check if two coin amounts are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Coin, b: Coin): boolean => a === b

/**
 * Generate a random Coin value.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.bigInt({
  min: 0n,
  max: MAX_COIN_VALUE
})
