import { Data as EffectData, Effect, FastCheck, ParseResult, pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as Numeric from "./Numeric.js"

/**
 * Error class for Data related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class DataError extends EffectData.TaggedError("DataError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * PlutusData type definition based on Conway CDDL specification
 *
 * ```
 * CDDL: plutus_data =
 *   constr<plutus_data>
 *   / {* plutus_data => plutus_data}
 *   / [* plutus_data]
 *   / big_int
 *   / bounded_bytes
 *
 * constr<a0> =
 *   #6.121([* a0])
 *   / #6.122([* a0])
 *   / #6.123([* a0])
 *   / #6.124([* a0])
 *   / #6.125([* a0])
 *   / #6.126([* a0])
 *   / #6.127([* a0])
 *   / #6.102([uint, [* a0]])
 * ```
 *
 * Constructor Index Limits:
 * - Tags 121-127: Direct encoding for constructor indices 0-6
 * - Tag 102: General constructor encoding for any uint value
 * - Maximum constructor index: 2^64 - 1 (18,446,744,073,709,551,615)
 *   as per CBOR RFC 8949 specification for unsigned integers
 *
 * @since 2.0.0
 * @category model
 */
export type Data = Constr | MapList | List | Int | ByteArray

/**
 * Constr type for constructor alternatives based on Conway CDDL specification
 *
 * ```
 * CDDL: constr<a0> =
 *   #6.121([* a0])    // index 0
 *   / #6.122([* a0])  // index 1
 *   / #6.123([* a0])  // index 2
 *   / #6.124([* a0])  // index 3
 *   / #6.125([* a0])  // index 4
 *   / #6.126([* a0])  // index 5
 *   / #6.127([* a0])  // index 6
 *   / #6.102([uint, [* a0]])  // general constructor with custom index
 * ```
 *
 * Constructor Index Range:
 * - Minimum: 0
 * - Maximum: 2^64 - 1 (18,446,744,073,709,551,615)
 *   as per CBOR RFC 8949 specification for unsigned integers
 *
 * @since 2.0.0
 * @category model
 */
// export interface Constr {
//   readonly index: bigint;
//   readonly fields: readonly Data[];
// }

export type MapList = Map<Data, Data>

/**
 * PlutusList type for plutus data lists
 *
 * @since 2.0.0
 * @category model
 */
export type List = ReadonlyArray<Data>

/**
 * Schema for Constr data type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
// export const ConstrSchema: Schema.Schema<Constr> = Schema.Struct({
//   index: Numeric.Uint64Schema,
//   fields: Schema.Array(Schema.suspend((): Schema.Schema<Data> => DataSchema)),
// });
export class Constr extends Schema.Class<Constr>("Constr")({
  index: Numeric.Uint64Schema,
  fields: Schema.Array(Schema.suspend((): Schema.Schema<Data> => DataSchema))
}) {}

/**
 * Schema for PlutusMap data type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const MapSchema = Schema.MapFromSelf({
  key: Schema.suspend((): Schema.Schema<Data> => DataSchema),
  value: Schema.suspend((): Schema.Schema<Data> => DataSchema)
}).annotations({
  identifier: "Data.Map"
})

/**
 * Schema for PlutusList data type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const ListSchema = Schema.Array(Schema.suspend((): Schema.Schema<Data> => DataSchema))

/**
 * Schema for PlutusBigInt data type
 *
 * Matches the CDDL specification for big_int:
 * ```
 * big_int = int / big_uint / big_nint
 * big_uint = #6.2(bounded_bytes)
 * big_nint = #6.3(bounded_bytes)
 * ```
 *
 * Where:
 * - `int` covers integers that fit in CBOR major types 0 and 1 (0 to 2^64-1 for positive, -(2^64-1) to -1 for negative)
 * - `big_uint` (tag 2) covers positive integers larger than 2^64-1
 * - `big_nint` (tag 3) covers negative integers smaller than -(2^64-1)
 *
 * Note: JavaScript's Number.MAX_SAFE_INTEGER (2^53-1) is much smaller than CBOR's 64-bit limit.
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const IntSchema = Schema.BigIntFromSelf.annotations({
  identifier: "Data.Int"
})
export type Int = typeof IntSchema.Type

/**
 * Schema for PlutusBytes data type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const BytesSchema = Bytes.HexLenientSchema.annotations({
  identifier: "Data.Bytes"
})
export type ByteArray = typeof BytesSchema.Type

/**
 * Combined schema for PlutusData type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const DataSchema: Schema.Schema<Data> = Schema.Union(
  Schema.typeSchema(Constr),
  Schema.typeSchema(MapSchema),
  ListSchema,
  Schema.typeSchema(IntSchema),
  BytesSchema
).annotations({
  identifier: "Data"
})

/**
 * Type guard to check if a value is a Constr
 *
 * @category predicates
 *
 * @since 2.0.0
 */
export const isConstr = (data: unknown): data is Constr => {
  // Check if it's a valid Constr using the schema
  return Schema.is(Constr)(data)
}

/**
 * Type guard to check if a value is a PlutusMap
 *
 * @category predicates
 *
 * @since 2.0.0
 */
export const isMap = Schema.is(MapSchema)

/**
 * Type guard to check if a value is a PlutusList
 *
 * @category predicates
 *
 * @since 2.0.0
 */
export const isList = Schema.is(ListSchema)

/**
 * Type guard to check if a value is a PlutusBigInt
 *
 * @category predicates
 *
 * @since 2.0.0
 */
export const isInt = Schema.is(IntSchema)

/**
 * Type guard to check if a value is a PlutusBytes
 *
 * @category predicates
 *
 * @since 2.0.0
 */
export const isBytes = Schema.is(BytesSchema)

/**
 * Creates a constructor with the specified index and data
 *
 * @since 2.0.0
 * @category constructors
 */
export const constr = (index: bigint, data: Array<Data>): Constr =>
  new Constr({
    index,
    fields: data
  })

/**
 * Creates a Plutus map from key-value pairs
 *
 * @since 2.0.0
 * @category constructors
 */
export const map = (entries: Array<{ key: Data; value: Data }>): MapList =>
  new Map(entries.map(({ key, value }) => [key, value]))

/**
 * Creates a Plutus list from items
 *
 * @since 2.0.0
 * @category constructors
 */
export const list = (list: Array<Data>): List => list

/**
 * Creates Plutus big integer
 *
 * @since 2.0.0
 * @category constructors
 */
export const int = (integer: bigint): Int => integer

/**
 * Creates Plutus bounded bytes from hex string
 *
 * @since 2.0.0
 * @category constructors
 */
export const bytearray = (bytes: string): ByteArray => bytes

/**
 * Pattern matching helper for Constr types
 *
 * @since 2.0.0
 * @category utilities
 */
export const matchConstr = <T>(
  constr: Constr,
  cases: {
    [key: number]: (fields: ReadonlyArray<Data>) => T
    _: (index: number, fields: ReadonlyArray<Data>) => T
  }
): T => {
  const specificCase = cases[Number(constr.index)]
  if (specificCase) {
    return specificCase(constr.fields)
  }
  return cases._(Number(constr.index), constr.fields)
}

/**
 * Pattern matching helper for PlutusData types
 *
 * @since 2.0.0
 * @category utilities
 */
export const matchData = <T>(
  data: Data,
  cases: {
    Map: (entries: ReadonlyArray<[Data, Data]>) => T
    List: (items: ReadonlyArray<Data>) => T
    Int: (value: bigint) => T
    Bytes: (bytes: string) => T
    Constr: (constr: Constr) => T
  }
): T => {
  if (isMap(data)) {
    return cases.Map(Array.from(data.entries()))
  }
  if (isList(data)) {
    return cases.List(data)
  }
  if (isInt(data)) {
    return cases.Int(data)
  }
  if (isBytes(data)) {
    return cases.Bytes(data)
  }
  if (isConstr(data)) {
    return cases.Constr(data)
  }
  // If we reach here, it means the data is not a recognized PlutusData type
  throw new DataError({
    message: `Unsupported PlutusData type: ${typeof data === "bigint" ? String(data) : String(data)}`
  })
}

/**
 * Creates an arbitrary that generates PlutusData values with controlled depth
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const genPlutusData = (depth: number = 3): FastCheck.Arbitrary<Data> => {
  if (depth <= 0) {
    // Base cases: PlutusBigInt or PlutusBytes
    return FastCheck.oneof(genPlutusBigInt(), genPlutusBytes())
  }

  // Recursive cases with decreasing depth
  return FastCheck.oneof(
    genPlutusBigInt(),
    genPlutusBytes(),
    genConstr(depth - 1),
    genPlutusList(depth - 1),
    genPlutusMap(depth - 1)
  )
}

/**
 * Creates an arbitrary that generates PlutusBytes values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const genPlutusBytes = (): FastCheck.Arbitrary<ByteArray> =>
  FastCheck.uint8Array({
    minLength: 0, // Allow empty arrays (valid for PlutusBytes)
    maxLength: 32 // Max 32 bytes
  }).map((bytes) => bytearray(Bytes.Codec.Decode.bytesLenient(bytes)))

/**
 * Creates an arbitrary that generates PlutusBigInt values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const genPlutusBigInt = (): FastCheck.Arbitrary<Int> => FastCheck.bigInt().map((value) => int(value))

/**
 * Creates an arbitrary that generates PlutusList values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const genPlutusList = (depth: number): FastCheck.Arbitrary<List> =>
  FastCheck.array(genPlutusData(depth), {
    minLength: 0,
    maxLength: 5
  }).map((value) => list(value))

/**
 * Creates an arbitrary that generates Constr values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const genConstr = (depth: number): FastCheck.Arbitrary<Constr> =>
  FastCheck.tuple(
    FastCheck.bigInt({ min: 0n, max: 2n ** 64n - 1n }),
    FastCheck.array(genPlutusData(depth), {
      minLength: 0,
      maxLength: 5
    })
  ).map(([index, data]) => constr(index, data))

/**
 * Creates an arbitrary that generates PlutusMap values with unique keys
 * Following a similar distribution pattern:
 * - 60% PlutusBigInt keys
 * - 30% PlutusBytes keys
 * - 10% Complex keys
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const genPlutusMap = (depth: number): FastCheck.Arbitrary<MapList> => {
  // Helper to create key-value pairs with unique keys
  const uniqueKeyValuePairs = <T extends Data>(keyGen: FastCheck.Arbitrary<T>, maxSize: number) =>
    FastCheck.uniqueArray(FastCheck.tuple(keyGen, genPlutusData(depth > 0 ? depth - 1 : 0)), {
      minLength: 0,
      maxLength: maxSize * 2, // Generate more than needed to increase chance of unique keys
      selector: (pair) => {
        // Use a simple string representation for unique key identification
        // Handle BigInt safely by converting to string first
        const keyStr = typeof pair[0] === "bigint" ? String(pair[0]) : JSON.stringify(pair[0])
        return keyStr
      }
    }).map((pairs) => pairs.map(([key, value]) => ({ key, value })))

  // PlutusBigInt keys (more frequent)
  const bigIntPairs = uniqueKeyValuePairs(genPlutusBigInt(), 3)

  // PlutusBytes keys (medium frequency)
  const bytesPairs = uniqueKeyValuePairs(genPlutusBytes(), 3)

  // Complex keys (less frequent)
  const complexPairs = uniqueKeyValuePairs(genPlutusData(depth > 1 ? depth - 2 : 0), 2)

  return FastCheck.oneof(bigIntPairs, bytesPairs, complexPairs).map((pairs) => map(pairs))
}

/**
 * FastCheck generators for PlutusData types
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = genPlutusData(3)

/**
 * CBOR value representation for PlutusData
 * This represents the intermediate CBOR structure that corresponds to PlutusData
 *
 * @since 2.0.0
 * @category model
 */

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.transformOrFail(Schema.Uint8ArrayFromSelf, DataSchema, {
    strict: true,
    encode: (toI) =>
      pipe(plutusDataToCBORValue(toI), (cborValue) => ParseResult.encode(CBOR.FromBytes(options))(cborValue)),
    decode: (fromI) => pipe(ParseResult.decode(CBOR.FromBytes(options))(fromI), Effect.map(cborValueToPlutusData))
  }).annotations({
    identifier: "Data.FromCBORBytes"
  })

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(Bytes.FromHex, FromCBORBytes(options)).annotations({
    identifier: "Data.FromCBORHex"
  })

/**
 * Convert PlutusData to CBORValue
 *
 * @since 2.0.0
 * @category transformation
 */
export const plutusDataToCBORValue = (data: Data): CBOR.CBOR => {
  return matchData(data, {
    Map: (entries): CBOR.CBOR => {
      // PlutusData Map -> CBOR map directly (no extra tag needed for top-level maps)
      const cborEntries = entries.map(
        ([key, value]) => [plutusDataToCBORValue(key), plutusDataToCBORValue(value)] as const
      )
      return new Map(cborEntries)
    },
    List: (items): CBOR.CBOR => {
      // PlutusData List -> CBOR array directly (no extra tag needed for top-level arrays)
      const cborItems = items.map(plutusDataToCBORValue)
      return cborItems
    },
    Int: (value): CBOR.CBOR => {
      // PlutusData Int -> CBOR uint or nint
      return value
    },
    Bytes: (bytes): CBOR.CBOR => {
      return Bytes.Codec.Encode.bytesLenient(bytes)
    },
    Constr: (constr): CBOR.CBOR => {
      // PlutusData Constr -> CBOR tags based on index
      const cborFields = constr.fields.map(plutusDataToCBORValue)
      const fieldsArray = cborFields // Now just a raw array

      if (constr.index >= 0n && constr.index <= 6n) {
        // Direct encoding for constructor indices 0-6 (tags 121-127)
        return new CBOR.Tag({
          tag: Number(121n + constr.index),
          value: fieldsArray
        })
      } else if (constr.index >= 7n && constr.index <= 127n) {
        // Alternative encoding for constructor indices 7-127 (tag 1280+index-7)
        return new CBOR.Tag({
          tag: Number(1280n + constr.index - 7n),
          value: fieldsArray
        })
      } else {
        // General constructor encoding for any uint value (tag 102)
        return new CBOR.Tag({
          tag: 102,
          value: [constr.index, fieldsArray]
        })
      }
    }
  })
}

/**
 * Convert CBORValue to PlutusData
 *
 * @since 2.0.0
 * @category transformation
 */
export const cborValueToPlutusData = (cborValue: CBOR.CBOR): Data => {
  // Handle bigint (uint/nint)
  if (CBOR.isInteger(cborValue)) {
    return cborValue
  }

  // Handle Uint8Array (bytes)
  if (CBOR.isByteArray(cborValue)) {
    // Handle empty bytes case
    if (cborValue.length === 0) {
      return ""
    }
    return Bytes.Codec.Decode.bytes(cborValue)
  }

  // Handle tagged values
  if (CBOR.isTag(cborValue)) {
    const tag = cborValue.tag
    const value = cborValue.value

    // Handle constructor tags (121-127 for indices 0-6)
    if (tag >= 121 && tag <= 127) {
      if (!Array.isArray(value)) {
        throw new DataError({
          message: `Expected array for constructor tag ${tag}, got ${typeof value}`
        })
      }
      const fields = value.map(cborValueToPlutusData)
      return new Constr({ index: BigInt(tag - 121), fields })
    }

    // Handle alternative constructor tags (1280-1400 for indices 7-127)
    if (tag >= 1280 && tag <= 1400) {
      if (!Array.isArray(value)) {
        throw new DataError({
          message: `Expected array for constructor tag ${tag}, got ${typeof value}`
        })
      }
      const fields = value.map(cborValueToPlutusData)
      return new Constr({ index: BigInt(tag - 1280 + 7), fields })
    }

    // Handle general constructor tag (102)
    if (tag === 102) {
      if (!Array.isArray(value)) {
        throw new DataError({
          message: `Expected array for general constructor tag, got ${typeof value}`
        })
      }

      const array = value
      if (array.length === 2) {
        // Two element arrays are general constructors [index, fields]
        const indexValue = array[0]
        const fieldsValue = array[1]

        if (typeof indexValue !== "bigint") {
          throw new DataError({
            message: `Expected bigint for constructor index, got ${typeof indexValue}`
          })
        }
        if (!Array.isArray(fieldsValue)) {
          throw new DataError({
            message: `Expected array for constructor fields, got ${typeof fieldsValue}`
          })
        }

        const fields = fieldsValue.map(cborValueToPlutusData)
        return new Constr({ index: indexValue, fields })
      }
    }

    // Handle big_uint tag (2) for large positive integers
    if (tag === 2) {
      if (!(value instanceof Uint8Array)) {
        throw new DataError({
          message: `Expected bytes for big_uint tag, got ${typeof value}`
        })
      }
      // Convert bytes to bigint (big-endian)
      return bytesToBigint(value)
    }

    // Handle big_nint tag (3) for large negative integers
    if (tag === 3) {
      if (!(value instanceof Uint8Array)) {
        throw new DataError({
          message: `Expected bytes for big_nint tag, got ${typeof value}`
        })
      }
      // Convert bytes to bigint and negate (add 1) per RFC 8949
      const positiveValue = bytesToBigint(value)
      return -(positiveValue + 1n)
    }

    throw new DataError({ message: `Unsupported CBOR tag: ${tag}` })
  }

  // Handle arrays
  if (CBOR.isArray(cborValue)) {
    // Arrays are Lists
    const items = cborValue.map(cborValueToPlutusData)
    return items
  }

  // Handle Maps
  if (CBOR.isMap(cborValue)) {
    // Maps are Maps
    const entries = Array.from(cborValue.entries()).map(
      ([k, v]) => [cborValueToPlutusData(k), cborValueToPlutusData(v)] as const
    )
    return new Map(entries)
  }

  // Handle unsupported types
  throw new DataError({
    message: `Unknown CBOR value type: ${JSON.stringify(cborValue)}`
  })
}

/**
 * Convert a big-endian byte array to a positive bigint
 * Used for CBOR tag 2/3 decoding
 */
const bytesToBigint = (bytes: Uint8Array): bigint => {
  if (bytes.length === 0) {
    return 0n
  }

  let result = 0n
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8n) | BigInt(bytes[i])
  }

  return result
}

// Function overloads for better type inference
export function Codec<A, B extends Data>(params: {
  schema: Schema.Schema<A, B>
  options?: CBOR.CodecOptions
}): ReturnType<
  typeof _Codec.createEncoders<
    {
      toData: Schema.Schema<A, B>
      cborHex: Schema.Schema<A, string>
      cborBytes: Schema.Schema<A, Uint8Array>
    },
    typeof DataError
  >
>

export function Codec(params?: { options?: CBOR.CodecOptions }): ReturnType<
  typeof _Codec.createEncoders<
    {
      cborHex: Schema.Schema<Data, string>
      cborBytes: Schema.Schema<Data, Uint8Array>
    },
    typeof DataError
  >
>

export function Codec<A, B extends Data>(params?: { schema?: Schema.Schema<A, B>; options?: CBOR.CodecOptions }) {
  const schema = params?.schema
  const codecOptions = params?.options || CBOR.DEFAULT_OPTIONS

  const FromHex = FromCBORHex(codecOptions)
  const FromBytes = FromCBORBytes(codecOptions)

  if (schema) {
    // With schema: type A -> Data B -> CBOR
    const schemaToHex = Schema.compose(FromHex, schema)
    const schemaToBytes = Schema.compose(FromBytes, schema)

    return _Codec.createEncoders(
      {
        toData: schema,
        cborHex: schemaToHex,
        cborBytes: schemaToBytes
      },
      DataError
    )
  }

  // Without schema: Data -> CBOR directly
  return _Codec.createEncoders(
    {
      cborHex: FromHex,
      cborBytes: FromBytes
    },
    DataError
  )
}
