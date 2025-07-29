import { BigDecimal, Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import { createEncoders } from "./Codec.js"
import * as Numeric from "./Numeric.js"

/**
 * Error class for UnitInterval related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class UnitIntervalError extends Data.TaggedError("UnitIntervalError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for UnitInterval representing a fractional value between 0 and 1.
 *
 * CDDL: unit_interval = #6.30([uint, uint])
 *
 * A unit interval is a number in the range between 0 and 1, which
 * means there are two extra constraints:
 *   1. numerator <= denominator
 *   2. denominator > 0
 *
 * @since 2.0.0
 * @category schemas
 */
export const UnitInterval = Schema.Struct({
  numerator: Numeric.Uint64Schema,
  denominator: Numeric.Uint64Schema
})
  .pipe(
    Schema.filter((interval) => {
      if (interval.denominator <= 0n) {
        return {
          path: ["denominator"],
          message: `denominator (${interval.denominator}) must be > 0`
        }
      }
      if (interval.numerator > interval.denominator) {
        return {
          path: ["numerator"],
          message: `numerator (${interval.numerator}) must be <= denominator (${interval.denominator})`
        }
      }
      return true
    })
  )
  .annotations({
    identifier: "UnitInterval"
  })

export type UnitInterval = typeof UnitInterval.Type

/**
 * CDDL schema for UnitInterval following the Conway specification.
 * unit_interval = #6.30([uint, uint])
 *
 * Transforms between CBOR tag 30 structure and UnitInterval model.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CBOR.Tag, UnitInterval, {
  strict: true,
  encode: (_, __, ___, unitInterval) =>
    Effect.succeed(
      new CBOR.Tag({
        tag: 30,
        value: [unitInterval.numerator, unitInterval.denominator]
      })
    ),
  decode: (_, __, ___, taggedValue) =>
    Effect.gen(function* () {
      // Validate tag number
      if (taggedValue.tag !== 30) {
        return yield* Effect.fail(
          new ParseResult.Type(
            UnitInterval.ast,
            taggedValue,
            `Expected tag 30 for UnitInterval, got ${taggedValue.tag}`
          )
        )
      }

      // Validate that the value is a tuple of two integers
      const tupleValue = yield* ParseResult.decodeUnknown(Schema.Tuple(CBOR.Integer, CBOR.Integer))(taggedValue.value)

      const [numerator, denominator] = tupleValue

      // Create and validate UnitInterval using the validated schema
      return yield* ParseResult.decode(UnitInterval)({
        numerator,
        denominator
      })
    })
}).annotations({
  identifier: "UnitInterval.CDDL"
})

/**
 * CBOR bytes transformation schema for UnitInterval.
 * Transforms between Uint8Array and UnitInterval using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → UnitInterval
  ).annotations({
    identifier: "UnitInterval.CBORBytes"
  })

/**
 * CBOR hex transformation schema for UnitInterval.
 * Transforms between hex string and UnitInterval using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → UnitInterval
  ).annotations({
    identifier: "UnitInterval.CBORHex"
  })

/**
 * Check if two UnitInterval instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: UnitInterval, b: UnitInterval): boolean =>
  a.numerator === b.numerator && a.denominator === b.denominator

/**
 * Convert UnitInterval to BigDecimal value.
 *
 * @since 2.0.0
 * @category transformation
 */
export const toBigDecimal = (interval: UnitInterval) =>
  BigDecimal.unsafeDivide(BigDecimal.fromBigInt(interval.numerator), BigDecimal.fromBigInt(interval.denominator))

/**
 * Create UnitInterval from BigDecimal value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromBigDecimal = (value: BigDecimal.BigDecimal): UnitInterval => {
  const normalized = BigDecimal.normalize(value)
  const denominator = BigInt(10) ** BigInt(Math.max(0, normalized.scale))
  const numerator = normalized.value

  return UnitInterval.make({ numerator, denominator })
}

/**
 * Generate a random UnitInterval.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.bigInt({ min: 1n, max: 1000000n }).chain((denominator) =>
  FastCheck.bigInt({ min: 0n, max: denominator }).map((numerator) => UnitInterval.make({ numerator, denominator }))
)

/**
 * CBOR codec utilities for UnitInterval.
 *
 * @since 2.0.0
 * @category codecs
 */
export const CBORCodec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  createEncoders(
    {
      cborBytes: FromCBORBytes(options),
      cborHex: FromCBORHex(options)
    },
    UnitIntervalError
  )
