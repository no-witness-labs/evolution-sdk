import { FastCheck, Schema } from "effect"

export const UINT8_MIN = 0
export const UINT8_MAX = 255

export const Uint8Schema = Schema.Number.pipe(
  Schema.filter((number) => Number.isInteger(number) && number >= UINT8_MIN && number <= UINT8_MAX),
  Schema.annotations({
    identifier: "Uint8",
    description: `An 8-bit unsigned integer (${UINT8_MIN} to ${UINT8_MAX})`
  })
)

export type Uint8 = typeof Uint8Schema.Type

export const Uint8Generator = FastCheck.integer({
  min: UINT8_MIN,
  max: UINT8_MAX
}).map((number) => Uint8Schema.make(number))

export const UINT16_MIN = 0
export const UINT16_MAX = 65535

export const Uint16Schema = Schema.Number.pipe(
  Schema.filter((number) => Number.isInteger(number) && number >= UINT16_MIN && number <= UINT16_MAX),
  Schema.annotations({
    identifier: "Uint16",
    description: `A 16-bit unsigned integer (${UINT16_MIN} to ${UINT16_MAX})`
  })
)

export type Uint16 = typeof Uint16Schema.Type

export const Uint16Generator = FastCheck.integer({
  min: UINT16_MIN,
  max: UINT16_MAX
}).map((number) => Uint16Schema.make(number))

export const UINT32_MIN = 0
export const UINT32_MAX = 4294967295

export const Uint32Schema = Schema.Number.pipe(
  Schema.filter((number) => Number.isInteger(number) && number >= UINT32_MIN && number <= UINT32_MAX),
  Schema.annotations({
    identifier: "Uint32",
    description: `A 32-bit unsigned integer (${UINT32_MIN} to ${UINT32_MAX})`
  })
)

export type Uint32 = typeof Uint32Schema.Type

export const Uint32Generator = FastCheck.integer({
  min: UINT32_MIN,
  max: UINT32_MAX
}).map((number) => Uint32Schema.make(number))

export const UINT64_MIN = 0n
export const UINT64_MAX = 18446744073709551615n
export const Uint64Schema = Schema.BigIntFromSelf.pipe(
  Schema.filter((bigint) => bigint >= UINT64_MIN && bigint <= UINT64_MAX),
  Schema.annotations({
    identifier: "Uint64",
    description: `A 64-bit unsigned integer (${UINT64_MIN} to ${UINT64_MAX})`
  })
)
export type Uint64 = typeof Uint64Schema.Type
export const Uint64Generator = FastCheck.bigInt({
  min: UINT64_MIN,
  max: UINT64_MAX
}).map((bigint) => Uint64Schema.make(bigint))

export const INT8_MIN = -128
export const INT8_MAX = 127

export const Int8 = Schema.Number.pipe(
  Schema.filter((number) => Number.isInteger(number) && number >= INT8_MIN && number <= INT8_MAX),
  Schema.annotations({
    identifier: "Int8",
    description: `An 8-bit signed integer (${INT8_MIN} to ${INT8_MAX})`
  })
)

export type Int8 = typeof Int8.Type

export const Int8Generator = FastCheck.integer({
  min: INT8_MIN,
  max: INT8_MAX
}).map((number) => Int8.make(number))

export const INT16_MIN = -32768
export const INT16_MAX = 32767

export const Int16 = Schema.Number.pipe(
  Schema.filter((number) => Number.isInteger(number) && number >= INT16_MIN && number <= INT16_MAX),
  Schema.annotations({
    identifier: "Int16",
    description: `A 16-bit signed integer (${INT16_MIN} to ${INT16_MAX})`
  })
)

export type Int16 = typeof Int16.Type

export const Int16Generator = FastCheck.integer({
  min: INT16_MIN,
  max: INT16_MAX
}).map((number) => Int16.make(number))

export const INT32_MIN = -2147483648
export const INT32_MAX = 2147483647

export const Int32 = Schema.Number.pipe(
  Schema.filter((number) => Number.isInteger(number) && number >= INT32_MIN && number <= INT32_MAX),
  Schema.annotations({
    identifier: "Int32",
    description: `A 32-bit signed integer (${INT32_MIN} to ${INT32_MAX})`
  })
)

export type Int32 = typeof Int32.Type

export const Int32Generator = FastCheck.integer({
  min: INT32_MIN,
  max: INT32_MAX
}).map((number) => Int32.make(number))

export const INT64_MIN = -9223372036854775808n
export const INT64_MAX = 9223372036854775807n

export const Int64 = Schema.BigIntFromSelf.pipe(
  Schema.filter((bigint) => bigint >= INT64_MIN && bigint <= INT64_MAX),
  Schema.annotations({
    identifier: "Int64",
    description: `A 64-bit signed integer (${INT64_MIN} to ${INT64_MAX})`
  })
)

export type Int64 = typeof Int64.Type

export const Int64Generator = FastCheck.bigInt({
  min: INT64_MIN,
  max: INT64_MAX
}).map((bigint) => Int64.make(bigint))
