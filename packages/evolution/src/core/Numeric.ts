import { Data, FastCheck, Schema } from "effect"

/**
 * Error class for Numeric related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NumericError extends Data.TaggedError("NumericError")<{
  message?: string
  cause?: unknown
}> {}

export const UINT8_MIN = 0n
export const UINT8_MAX = 255n

/**
 * Schema for 8-bit unsigned integers.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Uint8Schema = Schema.BigInt.pipe(
  Schema.filter((value) => value >= UINT8_MIN && value <= UINT8_MAX),
  Schema.annotations({
    identifier: "Uint8",
    title: "8-bit Unsigned Integer",
    description: `An 8-bit unsigned integer (${UINT8_MIN} to ${UINT8_MAX})`
  })
)

/**
 * Type alias for 8-bit unsigned integers.
 *
 * @since 2.0.0
 * @category model
 */
export type Uint8 = typeof Uint8Schema.Type

/**
 * Smart constructor for Uint8 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Uint8Make = Uint8Schema.make

/**
 * FastCheck arbitrary for generating random Uint8 instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const Uint8Generator = FastCheck.bigInt({
  min: UINT8_MIN,
  max: UINT8_MAX
}).map(Uint8Make)

export const UINT16_MIN = 0n
export const UINT16_MAX = 65535n

export const Uint16Schema = Schema.BigInt.pipe(
  Schema.filter((value) => value >= UINT16_MIN && value <= UINT16_MAX),
  Schema.annotations({
    identifier: "Uint16",
    title: "16-bit Unsigned Integer",
    description: `A 16-bit unsigned integer (${UINT16_MIN} to ${UINT16_MAX})`
  })
)

export type Uint16 = typeof Uint16Schema.Type

/**
 * Smart constructor for Uint16 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Uint16Make = Uint16Schema.make

export const Uint16Arbitrary = FastCheck.bigInt({
  min: UINT16_MIN,
  max: UINT16_MAX
}).map(Uint16Make)

export const UINT32_MIN = 0n
export const UINT32_MAX = 4294967295n

export const Uint32Schema = Schema.BigInt.pipe(
  Schema.filter((value) => value >= UINT32_MIN && value <= UINT32_MAX),
  Schema.annotations({
    identifier: "Uint32",
    title: "32-bit Unsigned Integer",
    description: `A 32-bit unsigned integer (${UINT32_MIN} to ${UINT32_MAX})`
  })
)

export type Uint32 = typeof Uint32Schema.Type

/**
 * Smart constructor for Uint32 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Uint32Make = Uint32Schema.make

export const Uint32Arbitrary = FastCheck.bigInt({
  min: UINT32_MIN,
  max: UINT32_MAX
}).map(Uint32Make)

export const UINT64_MIN = 0n
export const UINT64_MAX = 18446744073709551615n
export const Uint64Schema = Schema.BigInt.pipe(
  Schema.filter((bigint) => bigint >= UINT64_MIN && bigint <= UINT64_MAX),
  Schema.annotations({
    identifier: "Uint64",
    title: "64-bit Unsigned Integer",
    description: `A 64-bit unsigned integer (${UINT64_MIN} to ${UINT64_MAX})`
  })
)
export type Uint64 = typeof Uint64Schema.Type

/**
 * Smart constructor for Uint64 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Uint64Make = Uint64Schema.make

export const Uint64Arbitrary = FastCheck.bigInt({
  min: UINT64_MIN,
  max: UINT64_MAX
}).map(Uint64Make)

export const INT8_MIN = -128n
export const INT8_MAX = 127n

export const Int8 = Schema.BigInt.pipe(
  Schema.filter((value) => value >= INT8_MIN && value <= INT8_MAX),
  Schema.annotations({
    identifier: "Int8",
    title: "8-bit Signed Integer",
    description: `An 8-bit signed integer (${INT8_MIN} to ${INT8_MAX})`
  })
)

export type Int8 = typeof Int8.Type

/**
 * Smart constructor for Int8 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Int8Make = Int8.make

export const Int8Generator = FastCheck.bigInt({
  min: INT8_MIN,
  max: INT8_MAX
}).map(Int8Make)

export const INT16_MIN = -32768n
export const INT16_MAX = 32767n

export const Int16 = Schema.BigInt.pipe(
  Schema.filter((value) => value >= INT16_MIN && value <= INT16_MAX),
  Schema.annotations({
    identifier: "Int16",
    title: "16-bit Signed Integer",
    description: `A 16-bit signed integer (${INT16_MIN} to ${INT16_MAX})`
  })
)

export type Int16 = typeof Int16.Type

/**
 * Smart constructor for Int16 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Int16Make = Int16.make

export const Int16Generator = FastCheck.bigInt({
  min: INT16_MIN,
  max: INT16_MAX
}).map(Int16Make)

export const INT32_MIN = -2147483648n
export const INT32_MAX = 2147483647n

export const Int32 = Schema.BigInt.pipe(
  Schema.filter((value) => value >= INT32_MIN && value <= INT32_MAX),
  Schema.annotations({
    identifier: "Int32",
    title: "32-bit Signed Integer",
    description: `A 32-bit signed integer (${INT32_MIN} to ${INT32_MAX})`
  })
)

export type Int32 = typeof Int32.Type

/**
 * Smart constructor for Int32 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Int32Make = Int32.make

export const Int32Generator = FastCheck.bigInt({
  min: INT32_MIN,
  max: INT32_MAX
}).map(Int32Make)

export const INT64_MIN = -9223372036854775808n
export const INT64_MAX = 9223372036854775807n

export const Int64 = Schema.BigInt.pipe(
  Schema.filter((bigint) => bigint >= INT64_MIN && bigint <= INT64_MAX),
  Schema.annotations({
    identifier: "Int64",
    title: "64-bit Signed Integer",
    description: `A 64-bit signed integer (${INT64_MIN} to ${INT64_MAX})`
  })
)

export type Int64 = typeof Int64.Type

/**
 * Smart constructor for Int64 that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const Int64Make = Int64.make

export const Int64Generator = FastCheck.bigInt({
  min: INT64_MIN,
  max: INT64_MAX
}).map(Int64Make)
