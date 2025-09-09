import { Data as EffectData, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
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

// Working recursive schema example with BigInt transformation
type TestRecursiveEncoded = ReadonlyArray<TestRecursiveEncoded> | string

type TestRecursiveType = ReadonlyArray<TestRecursiveType> | bigint

const TestRecursive: Schema.Schema<TestRecursiveType, TestRecursiveEncoded> = Schema.Union(
  Schema.Array(Schema.suspend((): Schema.Schema<TestRecursiveType, TestRecursiveEncoded> => TestRecursive)),
  Schema.BigInt
)

/**
 * PlutusData encoded type definition (wire format)
 * Used for serialization/deserialization from JSON/CBOR
 *
 * @since 2.0.0
 * @category model
 */
export type DataEncoded =
  // Constr (encoded with string index)
  | { readonly index: string; readonly fields: ReadonlyArray<DataEncoded> }
  // Map (encoded as array of [key, value] pairs)
  | ReadonlyArray<readonly [DataEncoded, DataEncoded]>
  // List
  | ReadonlyArray<DataEncoded>
  // Int (encoded as string)
  | string
  // ByteArray (encoded as hex string)
  | string

/**
 * PlutusData type definition (runtime type)
 * Based on Conway CDDL specification
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
export type Data =
  // Constr (runtime with bigint index)
  | Constr
  // { readonly index: bigint; readonly fields: ReadonlyArray<Data> } |
  // Map (using standard Map since Schema.Map produces Map<K,V>)
  | globalThis.Map<Data, Data>
  // List
  | ReadonlyArray<Data>
  // Int (runtime as bigint)
  | bigint
  // ByteArray (runtime as Uint8Array)
  | Uint8Array

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

export type Map = globalThis.Map<Data, Data>

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
  index: Numeric.Uint64Schema.annotations({
    identifier: "Data.Constr.Index",
    title: "Constructor Index",
    description: "The index of the constructor, must be a non-negative integer"
  }),
  fields: Schema.Array(Schema.suspend((): Schema.Schema<Data, DataEncoded> => DataSchema)).annotations({
    identifier: "Data.Constr.Fields",
    title: "Fields of Constr",
    description: "A list of PlutusData fields for the constructor"
  })
}) {}

/**
 * Schema for PlutusMap data type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const MapSchema = Schema.Map({
  key: Schema.suspend((): Schema.Schema<Data, DataEncoded> => DataSchema).annotations({
    identifier: "Data.Map.Key",
    title: "Map Key",
    description: "The key of the PlutusMap, must be a PlutusData type"
  }),
  value: Schema.suspend((): Schema.Schema<Data, DataEncoded> => DataSchema).annotations({
    identifier: "Data.Map.Value",
    title: "Map Value",
    description: "The value of the PlutusMap, must be a PlutusData type"
  })
}).annotations({
  identifier: "Data.Map",
  title: "PlutusMap",
  description: "A map of PlutusData key-value pairs"
}) /**
 * Schema for PlutusList data type
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const ListSchema = Schema.Array(Schema.suspend((): Schema.Schema<Data, DataEncoded> => DataSchema)).annotations({
  identifier: "Data.List"
})

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
export const IntSchema = Schema.BigInt.annotations({
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
export const ByteArray = Schema.Uint8ArrayFromHex.annotations({
  identifier: "Data.ByteArray"
})
export type ByteArray = typeof ByteArray.Type

/**
 * Combined schema for PlutusData type with proper recursion
 *
 * @category schemas
 *
 * @since 2.0.0
 */
export const DataSchema: Schema.Schema<Data, DataEncoded> = Schema.Union(
  // Map: ReadonlyArray<[DataEncoded, DataEncoded]> <-> ReadonlyMap<Data, Data>
  MapSchema,

  // List: ReadonlyArray<DataEncoded> <-> ReadonlyArray<Data>
  ListSchema,

  // Int: string <-> bigint
  IntSchema,

  // ByteArray: hex string <-> Uint8Array
  ByteArray,

  // Constr: { index: string, fields: DataEncoded[] } <-> { index: bigint, fields: Data[] }
  Constr
  // Schema.Struct({
  //   fields: Schema.Array(Schema.suspend((): Schema.Schema<Data, DataEncoded> => DataSchema)),
  //   index: Schema.BigInt
  // })
).annotations({
  identifier: "DataSchema"
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
export const isBytes = Schema.is(ByteArray)

/**
 * Creates a constructor with the specified index and data
 *
 * @since 2.0.0
 * @category constructors
 */
export const constr = (index: bigint, fields: Array<Data>): Constr => Constr.make({ index, fields })

// new Constr({
//   index: Numeric.Uint64Make(index),
//   fields: data
// })

/**
 * Creates a Plutus map from key-value pairs
 *
 * @since 2.0.0
 * @category constructors
 */
export const map = (entries: Array<[key: Data, value: Data]>): Map => new globalThis.Map(entries)

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
export const int = (integer: bigint): Int => Schema.decodeSync(Schema.typeSchema(IntSchema))(integer)

/**
 * Creates Plutus bounded bytes from hex string
 *
 * @since 2.0.0
 * @category constructors
 */
export const bytearray = (bytes: string): ByteArray => Schema.decodeSync(ByteArray)(bytes)

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
    Bytes: (bytes: Uint8Array) => T
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
export const arbitraryPlutusData = (depth: number = 3): FastCheck.Arbitrary<Data> => {
  if (depth <= 0) {
    // Base cases: PlutusBigInt or PlutusBytes
    return FastCheck.oneof(arbitraryPlutusBigInt(), arbitraryPlutusBytes())
  }

  // Recursive cases with decreasing depth
  return FastCheck.oneof(
    arbitraryPlutusBigInt(),
    arbitraryPlutusBytes(),
    arbitraryConstr(depth - 1),
    arbitraryPlutusList(depth - 1),
    arbitraryPlutusMap(depth - 1)
  )
}

/**
 * Creates an arbitrary that generates PlutusBytes values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const arbitraryPlutusBytes = (): FastCheck.Arbitrary<ByteArray> =>
  FastCheck.uint8Array({
    minLength: 0, // Allow empty arrays (valid for PlutusBytes)
    maxLength: 32 // Max 32 bytes
  }).map((bytes) => bytearray(Bytes.toHexLenient(bytes)))

/**
 * Creates an arbitrary that generates PlutusBigInt values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const arbitraryPlutusBigInt = (): FastCheck.Arbitrary<Int> => FastCheck.bigInt().map((value) => int(value))

/**
 * Creates an arbitrary that generates PlutusList values
 *
 * @category generators
 *
 * @since 2.0.0
 */
export const arbitraryPlutusList = (depth: number): FastCheck.Arbitrary<List> =>
  FastCheck.array(arbitraryPlutusData(depth), {
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
export const arbitraryConstr = (depth: number): FastCheck.Arbitrary<Constr> =>
  FastCheck.tuple(
    FastCheck.bigInt({ min: 0n, max: 2n ** 64n - 1n }),
    FastCheck.array(arbitraryPlutusData(depth), {
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
export const arbitraryPlutusMap = (depth: number): FastCheck.Arbitrary<Map> => {
  // Helper to create key-value pairs with unique keys
  const uniqueKeyValuePairs = <T extends Data>(keyGen: FastCheck.Arbitrary<T>, maxSize: number) =>
    FastCheck.uniqueArray(FastCheck.tuple(keyGen, arbitraryPlutusData(depth > 0 ? depth - 1 : 0)), {
      minLength: 0,
      maxLength: maxSize * 2, // Generate more than needed to increase chance of unique keys
      selector: (pair) => {
        // Use a simple string representation for unique key identification
        // Handle BigInt safely by converting to string first
        const keyStr = typeof pair[0] === "bigint" ? String(pair[0]) : JSON.stringify(pair[0])
        return keyStr
      }
    })

  // PlutusBigInt keys (more frequent)
  const bigIntPairs = uniqueKeyValuePairs(arbitraryPlutusBigInt(), 3)

  // PlutusBytes keys (medium frequency)
  const bytesPairs = uniqueKeyValuePairs(arbitraryPlutusBytes(), 3)

  // Complex keys (less frequent)
  const complexPairs = uniqueKeyValuePairs(arbitraryPlutusData(depth > 1 ? depth - 2 : 0), 2)

  return FastCheck.oneof(bigIntPairs, bytesPairs, complexPairs).map((pairs) => map(pairs))
}

/**
 * FastCheck arbitrary for PlutusData types
 *
 * @since 2.0.0
 * @category generators
 */
export const arbitrary = arbitraryPlutusData(3)

// ============================================================================
// Transformations
// ============================================================================

/**
 * Default CBOR options for Data encoding/decoding
 *
 * @since 2.0.0
 * @category constants
 */
export const DEFAULT_CBOR_OPTIONS = CBOR.CML_DATA_DEFAULT_OPTIONS

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

// ============================================================================
// Combinators
// ============================================================================

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
      return bytes
    },
    Constr: (constr): CBOR.CBOR => {
      // PlutusData Constr -> CBOR tags based on index
      const cborFields = constr.fields.map(plutusDataToCBORValue)
      const fieldsArray = cborFields // Now just a raw array

      if (constr.index >= 0n && constr.index <= 6n) {
        // Direct encoding for constructor indices 0-6 (tags 121-127)
        return CBOR.Tag.make({
          tag: Number(121n + constr.index),
          value: fieldsArray
        })
      } else if (constr.index >= 7n && constr.index <= 127n) {
        // Alternative encoding for constructor indices 7-127 (tag 1280+index-7)
        return CBOR.Tag.make({
          tag: Number(1280n + constr.index - 7n),
          value: fieldsArray
        })
      } else {
        // General constructor encoding for any uint value (tag 102)
        return CBOR.Tag.make({
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
    return cborValue
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
      return new Constr({ index: Numeric.Uint64Make(BigInt(tag - 121)), fields })
    }

    // Handle alternative constructor tags (1280-1400 for indices 7-127)
    if (tag >= 1280 && tag <= 1400) {
      if (!Array.isArray(value)) {
        throw new DataError({
          message: `Expected array for constructor tag ${tag}, got ${typeof value}`
        })
      }
      const fields = value.map(cborValueToPlutusData)
      return new Constr({ index: Numeric.Uint64Make(BigInt(tag - 1280 + 7)), fields })
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
        return new Constr({ index: Numeric.Uint64Make(indexValue), fields })
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
 * Deep structural equality for Plutus Data values.
 * Handles maps, lists, ints, bytes, and constrs.
 */
export const equals = (a: Data, b: Data): boolean => {
  if (typeof a === "bigint" || typeof b === "bigint") return a === b

  if (typeof a === "string" || typeof b === "string") return a === b

  // Uint8Array (ByteArray)
  if (a instanceof Uint8Array && b instanceof Uint8Array) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  // Arrays (Lists)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!equals(a[i] as Data, b[i] as Data)) return false
    return true
  }

  // Constr
  if (a instanceof Constr && b instanceof Constr) {
    if (a.index !== b.index) return false
    if (a.fields.length !== b.fields.length) return false
    for (let i = 0; i < a.fields.length; i++) if (!equals(a.fields[i] as Data, b.fields[i] as Data)) return false
    return true
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    const aEntries = Array.from(a.entries())
    for (const [ak, av] of aEntries) {
      // find equivalent key in b
      const match = Array.from(b.entries()).find(([bk]) => equals(ak as Data, bk as Data))
      if (!match) return false
      if (!equals(av as Data, match[1] as Data)) return false
    }
    return true
  }

  return false
}

export const CDDLSchema = CBOR.CBORSchema

/**
 * CDDL schema for PlutusData following the Conway specification.
 *
 * ```
 * plutus_data =
 *   constr<plutus_data>
 *   / {* plutus_data => plutus_data}
 *   / [* plutus_data]
 *   / big_int
 *   / bounded_bytes
 *
 * constr<a0> =
 *   #6.121([* a0])    // index 0
 *   / #6.122([* a0])  // index 1
 *   / #6.123([* a0])  // index 2
 *   / #6.124([* a0])  // index 3
 *   / #6.125([* a0])  // index 4
 *   / #6.126([* a0])  // index 5
 *   / #6.127([* a0])  // index 6
 *   / #6.102([uint, [* a0]])  // general constructor
 *
 * big_int = int / big_uint / big_nint
 * big_uint = #6.2(bounded_bytes)
 * big_nint = #6.3(bounded_bytes)
 * ```
 *
 * This transforms between CBOR values and PlutusData using the existing
 * plutusDataToCBORValue and cborValueToPlutusData functions.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(DataSchema), {
  strict: true,
  encode: (_, __, ___, data) => Effect.succeed(plutusDataToCBORValue(data)),
  decode: (_, __, ___, cborValue) =>
    Effect.try({
      try: () => cborValueToPlutusData(cborValue),
      catch: (error) => new ParseResult.Type(DataSchema.ast, cborValue, String(error))
    })
})

/**
 * CBOR bytes transformation schema for PlutusData using CDDL.
 * Transforms between CBOR bytes and Data using CDDL encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DATA_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Data
  ).annotations({
    identifier: "Data.FromCBORBytes",
    title: "Data from CBOR Bytes using CDDL",
    description: "Transforms CBOR bytes to Data using CDDL encoding"
  })

/**
 * CBOR hex transformation schema for PlutusData using CDDL.
 * Transforms between CBOR hex string and Data using CDDL encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DATA_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Data
  ).annotations({
    identifier: "Data.FromCBORHex",
    title: "Data from CBOR Hex using CDDL",
    description: "Transforms CBOR hex string to Data using CDDL encoding"
  })

// ============================================================================
// Either Namespace
// ============================================================================

/**
 * Either-based variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Encode PlutusData to CBOR bytes with Either error handling
   *
   * @since 2.0.0
   * @category transformation
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, DataError, CBOR.CML_DATA_DEFAULT_OPTIONS)

  /**
   * Encode PlutusData to CBOR hex string with Either error handling
   *
   * @since 2.0.0
   * @category transformation
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, DataError, CBOR.CML_DATA_DEFAULT_OPTIONS)

  /**
   * Decode PlutusData from CBOR bytes with Either error handling
   *
   * @since 2.0.0
   * @category transformation
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, DataError, CBOR.CML_DATA_DEFAULT_OPTIONS)

  /**
   * Decode PlutusData from CBOR hex string with Effect error handling
   *
   * @since 2.0.0
   * @category transformation
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, DataError, CBOR.CML_DATA_DEFAULT_OPTIONS)

  /**
   * Create a schema that transforms from a custom type to Data and provides CBOR encoding
   *
   * @since 2.0.0
   * @category combinators
   */
  export const withSchema = <A, I extends Data>(
    schema: Schema.Schema<A, I>,
    options: CBOR.CodecOptions = CBOR.CML_DATA_DEFAULT_OPTIONS
  ) => {
    return {
      toData: Function.makeEncodeEither(schema, DataError),
      fromData: Function.makeDecodeEither(schema, DataError),
      toCBORHex: Function.makeCBOREncodeHexEither(FromCDDL, DataError, options),
      toCBORBytes: Function.makeCBOREncodeEither(FromCDDL, DataError, options),
      fromCBORHex: Function.makeCBORDecodeHexEither(FromCDDL, DataError, options),
      fromCBORBytes: Function.makeCBORDecodeEither(FromCDDL, DataError, options)
    }
  }
}

/**
 * Encode PlutusData to CBOR bytes
 *
 * @since 2.0.0
 * @category transformation
 */
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  DataError,
  "Data.toCBORBytes",
  CBOR.CML_DATA_DEFAULT_OPTIONS
)

/**
 * Encode PlutusData to CBOR hex string
 *
 * @since 2.0.0
 * @category transformation
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  DataError,
  "Data.toCBORHex",
  CBOR.CML_DATA_DEFAULT_OPTIONS
)

/**
 * Decode PlutusData from CBOR bytes
 *
 * @since 2.0.0
 * @category transformation
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  DataError,
  "Data.fromCBORBytes",
  CBOR.CML_DATA_DEFAULT_OPTIONS
)

/**
 * Decode PlutusData from CBOR hex string
 *
 * @since 2.0.0
 * @category transformation
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  DataError,
  "Data.fromCBORHex",
  CBOR.CML_DATA_DEFAULT_OPTIONS
)

/**
 * Transform data to Data using a schema
 *
 * @since 2.0.0
 * @category transformation
 */
/**
 * Create a schema that transforms from a custom type to Data and provides CBOR encoding
 *
 * @since 2.0.0
 * @category combinators
 */
export const withSchema = <A, I extends Data>(
  schema: Schema.Schema<A, I>,
  options: CBOR.CodecOptions = DEFAULT_CBOR_OPTIONS
) => {
  return {
    toData: Function.makeEncodeSync(schema, DataError, "withSchema.toData"),
    fromData: Function.makeDecodeSync(schema, DataError, "withSchema.fromData"),
    toCBORHex: Function.makeCBOREncodeHexSync(
      Schema.compose(FromCDDL, schema),
      DataError,
      "withSchema.toCBORHex",
      options
    ),
    toCBORBytes: Function.makeCBOREncodeSync(
      Schema.compose(FromCDDL, schema),
      DataError,
      "withSchema.toCBORBytes",
      options
    ),
    fromCBORHex: Function.makeCBORDecodeHexSync(
      Schema.compose(FromCDDL, schema),
      DataError,
      "withSchema.fromCBORHex",
      options
    ),
    fromCBORBytes: Function.makeCBORDecodeSync(
      Schema.compose(FromCDDL, schema),
      DataError,
      "withSchema.fromCBORBytes",
      options
    )
  }
}
