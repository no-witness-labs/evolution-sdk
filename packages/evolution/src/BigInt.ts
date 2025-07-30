import { Data, Schema } from "effect"

/**
 * Error class for BigInt related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class BigIntError extends Data.TaggedError("BigIntError")<{
  message?: string
  reason?: "InvalidFormat" | "OutOfRange"
}> {}

/**
 * BigUInt schema based on Conway CDDL specification
 *
 * CDDL: big_uint = #6.2(bounded_bytes)
 *
 * @since 2.0.0
 * @category schemas
 */
export const BigUIntSchema = Schema.TaggedStruct("BigUInt", {
  bytes: Schema.Uint8ArrayFromSelf
})

/**
 * Type alias for BigUInt.
 *
 * @since 2.0.0
 * @category model
 */
export type BigUInt = typeof BigUIntSchema.Type

/**
 * BigNInt schema based on Conway CDDL specification
 *
 * CDDL: big_nint = #6.3(bounded_bytes)
 *
 * @since 2.0.0
 * @category schemas
 */
export const BigNIntSchema = Schema.TaggedStruct("BigNInt", {
  bytes: Schema.Uint8ArrayFromSelf
})

/**
 * Type alias for BigNInt.
 *
 * @since 2.0.0
 * @category model
 */
export type BigNInt = typeof BigNIntSchema.Type

/**
 * BigInt schema based on Conway CDDL specification
 *
 * CDDL: big_int = int/ big_uint/ big_nint
 *
 * @since 2.0.0
 * @category schemas
 */
export const BigIntSchema = Schema.Union(
  // int - regular JavaScript number for small integers
  Schema.TaggedStruct("Int", {
    value: Schema.Number
  }),
  // big_uint - positive big integers
  BigUIntSchema,
  // big_nint - negative big integers
  BigNIntSchema
)

/**
 * Type alias for BigInt.
 *
 * @since 2.0.0
 * @category model
 */
export type BigInt = typeof BigIntSchema.Type

/**
 * Creates an integer value
 *
 * @since 2.0.0
 * @category constructors
 */
export const int = (value: number): BigInt => ({
  _tag: "Int",
  value
})

/**
 * Creates a big unsigned integer from bytes
 *
 * @since 2.0.0
 * @category constructors
 */
export const bigUInt = (bytes: Uint8Array): BigInt => ({
  _tag: "BigUInt",
  bytes
})

/**
 * Creates a big negative integer from bytes
 *
 * @since 2.0.0
 * @category constructors
 */
export const bigNInt = (bytes: Uint8Array): BigInt => ({
  _tag: "BigNInt",
  bytes
})

/**
 * Pattern matching helper for BigInt types
 *
 * @since 2.0.0
 * @category utilities
 */
export const match = <T>(
  bigInt: BigInt,
  cases: {
    Int: (value: number) => T
    BigUInt: (bytes: Uint8Array) => T
    BigNInt: (bytes: Uint8Array) => T
  }
): T => {
  switch (bigInt._tag) {
    case "Int":
      return cases.Int(bigInt.value)
    case "BigUInt":
      return cases.BigUInt(bigInt.bytes)
    case "BigNInt":
      return cases.BigNInt(bigInt.bytes)
    default:
      throw new BigIntError({
        message: `Unknown BigInt variant: ${(bigInt as any)._tag}`
      })
  }
}
