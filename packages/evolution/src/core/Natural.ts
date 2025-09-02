import { Data, Either as E, FastCheck, Schema } from "effect"

/**
 * Error class for Natural related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NaturalError extends Data.TaggedError("NaturalError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Natural number schema for positive integers.
 * Used for validating non-negative integers greater than 0.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Natural = Schema.Positive.annotations({
  identifier: "Natural",
  title: "Natural Number",
  description: "A positive integer greater than 0"
})

/**
 * Type alias for Natural representing positive integers.
 *
 * @since 2.0.0
 * @category model
 */
export type Natural = typeof Natural.Type

/**
 * Smart constructor for Natural that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Natural.make

/**
 * Check if two Natural instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Natural, b: Natural): boolean => a === b

/**
 * Check if the given value is a valid Natural
 *
 * @since 2.0.0
 * @category predicates
 */
export const isNatural = Schema.is(Natural)

/**
 * FastCheck arbitrary for generating random Natural instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.integer({
  min: 1,
  max: Number.MAX_SAFE_INTEGER
}).map((number) => number as Natural)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Natural from number.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromNumber = (num: number): Natural => {
  try {
    return Schema.decodeSync(Natural)(num)
  } catch (cause) {
    throw new NaturalError({
      message: "Failed to parse Natural from number",
      cause
    })
  }
}

/**
 * Encode Natural to number.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toNumber = (natural: Natural): number => {
  try {
    return Schema.encodeSync(Natural)(natural)
  } catch (cause) {
    throw new NaturalError({
      message: "Failed to encode Natural to number",
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
   * Parse Natural from number with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromNumber = (num: number): E.Either<Natural, NaturalError> =>
    E.mapLeft(
      Schema.decodeEither(Natural)(num),
      (cause) =>
        new NaturalError({
          message: "Failed to parse Natural from number",
          cause
        })
    )

  /**
   * Encode Natural to number with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toNumber = (natural: Natural): E.Either<number, NaturalError> =>
    E.mapLeft(
      Schema.encodeEither(Natural)(natural),
      (cause) =>
        new NaturalError({
          message: "Failed to encode Natural to number",
          cause
        })
    )
}
