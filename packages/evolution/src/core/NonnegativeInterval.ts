import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Numeric from "./Numeric.js"

/**
 * Error class for NonnegativeInterval related operations.
 */
export class NonnegativeIntervalError extends Data.TaggedError("NonnegativeIntervalError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for NonnegativeInterval representing a fractional value >= 0.
 *
 * CDDL: nonnegative_interval = #6.30([uint, positive_int])
 */
export const NonnegativeInterval = Schema.Struct({
  numerator: Numeric.Uint64Schema,
  denominator: Numeric.Uint64Schema // positive_int (we enforce > 0 below)
})
  .pipe(
    Schema.filter((interval) => {
      if (interval.denominator <= 0n) {
        return {
          path: ["denominator"],
          message: `denominator (${interval.denominator}) must be > 0`
        }
      }
      return true
    })
  )
  .annotations({ identifier: "NonnegativeInterval" })

export type NonnegativeInterval = typeof NonnegativeInterval.Type

export const CDDLSchema = CBOR.tag(30, Schema.Tuple(CBOR.Integer, CBOR.Integer))

/**
 * Transform between tag(30) tuple and NonnegativeInterval model.
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(NonnegativeInterval), {
  strict: true,
  encode: (_, __, ___, interval) =>
    Effect.succeed({
      _tag: "Tag" as const,
      tag: 30 as const,
      value: [interval.numerator, interval.denominator] as const
    }),
  decode: (_, __, ___, taggedValue) =>
    Effect.gen(function* () {
      if (taggedValue.tag !== 30) {
        return yield* Effect.fail(
          new ParseResult.Type(NonnegativeInterval.ast, taggedValue, `Expected tag 30, got ${taggedValue.tag}`)
        )
      }
      const [numerator, denominator] = yield* ParseResult.decodeUnknown(Schema.Tuple(CBOR.Integer, CBOR.Integer))(
        taggedValue.value
      )
      return NonnegativeInterval.make({ numerator, denominator })
    })
}).annotations({ identifier: "NonnegativeInterval.CDDL" })

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL)

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(Bytes.FromHex, FromCBORBytes(options))

export const arbitrary: FastCheck.Arbitrary<NonnegativeInterval> = FastCheck.bigInt({ min: 1n, max: 1000000n })
  .chain((denominator) =>
    FastCheck.bigInt({ min: 0n, max: denominator }).map((numerator) => ({ numerator, denominator }))
  )
  .map((v) => NonnegativeInterval.make(v))
