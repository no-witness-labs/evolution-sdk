import { Data, FastCheck, Schema } from "effect"

/**
 * Constants for NonZeroInt64 validation.
 * negInt64 = -9223372036854775808 .. -1
 * posInt64 = 1 .. 9223372036854775807
 * nonZeroInt64 = negInt64/ posInt64
 *
 * @since 2.0.0
 * @category constants
 */
export const NEG_INT64_MIN = -9223372036854775808n
export const NEG_INT64_MAX = -1n
export const POS_INT64_MIN = 1n
export const POS_INT64_MAX = 9223372036854775807n

/**
 * Error class for NonZeroInt64 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NonZeroInt64Error extends Data.TaggedError("NonZeroInt64Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for validating negative 64-bit integers (-9223372036854775808 to -1).
 *
 * @since 2.0.0
 * @category schemas
 */
export const NegInt64Schema = Schema.BigInt.pipe(
  Schema.filter((value: bigint) => value >= NEG_INT64_MIN && value <= NEG_INT64_MAX)
).annotations({
  message: (issue: any) => `NegInt64 must be between ${NEG_INT64_MIN} and ${NEG_INT64_MAX}, but got ${issue.actual}`,
  identifier: "NegInt64"
})

/**
 * Schema for validating positive 64-bit integers (1 to 9223372036854775807).
 *
 * @since 2.0.0
 * @category schemas
 */
export const PosInt64Schema = Schema.BigInt.pipe(
  Schema.filter((value: bigint) => value >= POS_INT64_MIN && value <= POS_INT64_MAX)
).annotations({
  message: (issue: any) => `PosInt64 must be between ${POS_INT64_MIN} and ${POS_INT64_MAX}, but got ${issue.actual}`,
  identifier: "PosInt64"
})

/**
 * Schema for NonZeroInt64 representing non-zero 64-bit signed integers.
 * nonZeroInt64 = negInt64/ posInt64
 *
 * @since 2.0.0
 * @category schemas
 */
export const NonZeroInt64 = Schema.Union(NegInt64Schema, PosInt64Schema).annotations({
  identifier: "NonZeroInt64",
  title: "Non-Zero 64-bit Integer",
  description: "A non-zero signed 64-bit integer (-9223372036854775808 to -1 or 1 to 9223372036854775807)"
})

/**
 * Type alias for NonZeroInt64 representing non-zero signed 64-bit integers.
 * Used in minting operations where zero amounts are not allowed.
 *
 * @since 2.0.0
 * @category model
 */
export type NonZeroInt64 = typeof NonZeroInt64.Type

/**
 * Smart constructor for creating NonZeroInt64 values.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Schema.decodeSync(NonZeroInt64)

/**
 * Check if a value is a valid NonZeroInt64.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(NonZeroInt64)

/**
 * Check if a NonZeroInt64 is positive.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isPositive = (value: NonZeroInt64): boolean => value > 0n

/**
 * Check if a NonZeroInt64 is negative.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isNegative = (value: NonZeroInt64): boolean => value < 0n

/**
 * Get the absolute value of a NonZeroInt64.
 *
 * @since 2.0.0
 * @category transformation
 */
export const abs = (value: NonZeroInt64): NonZeroInt64 => (value < 0n ? (-value as NonZeroInt64) : value)

/**
 * Negate a NonZeroInt64.
 *
 * @since 2.0.0
 * @category transformation
 */
export const negate = (value: NonZeroInt64): NonZeroInt64 => -value as NonZeroInt64

/**
 * Compare two NonZeroInt64 values.
 *
 * @since 2.0.0
 * @category ordering
 */
export const compare = (a: NonZeroInt64, b: NonZeroInt64): -1 | 0 | 1 => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Check if two NonZeroInt64 values are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: NonZeroInt64, b: NonZeroInt64): boolean => a === b

/**
 * FastCheck arbitrary for generating random NonZeroInt64 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.oneof(
  FastCheck.bigInt({ min: NEG_INT64_MIN, max: NEG_INT64_MAX }),
  FastCheck.bigInt({ min: POS_INT64_MIN, max: POS_INT64_MAX })
)
