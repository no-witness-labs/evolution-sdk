import { FastCheck, Schema } from "effect"

/**
 * Natural number constructors
 * Used for validating non negative integers
 *
 * @since 2.0.0
 */
export const Natural = Schema.Positive.pipe(Schema.brand("Natural"))

export type Natural = typeof Natural.Type

/**
 * Check if the given value is a valid PositiveNumber
 *
 * @since 2.0.0
 * @category predicates
 */

export const generator = FastCheck.integer({
  min: 1,
  max: Number.MAX_SAFE_INTEGER
}).map((number) => Natural.make(number))
