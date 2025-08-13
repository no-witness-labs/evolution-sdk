import { Data, Effect as Eff, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"

/**
 * Error class for CBOR value operations
 *
 * @since 1.0.0
 * @category errors
 */
export class CBORError extends Data.TaggedError("CBORError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * CBOR major types as constants
 *
 * @since 1.0.0
 * @category constants
 */
export const CBOR_MAJOR_TYPE = {
  UNSIGNED_INTEGER: 0,
  NEGATIVE_INTEGER: 1,
  BYTE_STRING: 2,
  TEXT_STRING: 3,
  ARRAY: 4,
  MAP: 5,
  TAG: 6,
  SIMPLE_FLOAT: 7
} as const

/**
 * CBOR additional information constants
 *
 * @since 1.0.0
 * @category constants
 */
export const CBOR_ADDITIONAL_INFO = {
  DIRECT: 24,
  UINT16: 25,
  UINT32: 26,
  UINT64: 27,
  INDEFINITE: 31
} as const

/**
 * Simple value constants for CBOR
 *
 * @since 1.0.0
 * @category constants
 */
export const CBOR_SIMPLE = {
  FALSE: 20,
  TRUE: 21,
  NULL: 22,
  UNDEFINED: 23
} as const

/**
 * CBOR codec configuration options
 *
 * @since 1.0.0
 * @category model
 */
export type CodecOptions =
  | {
      readonly mode: "canonical"
      readonly mapsAsObjects?: boolean
    }
  | {
      readonly mode: "custom"
      readonly useIndefiniteArrays: boolean
      readonly useIndefiniteMaps: boolean
      readonly useDefiniteForEmpty: boolean
      readonly sortMapKeys: boolean
      readonly useMinimalEncoding: boolean
      readonly mapsAsObjects?: boolean
    }

/**
 * Canonical CBOR encoding options (RFC 8949 Section 4.2.1)
 *
 * @since 1.0.0
 * @category constants
 */
export const CANONICAL_OPTIONS: CodecOptions = {
  mode: "canonical"
} as const

/**
 * Default CBOR encoding options
 *
 * @since 1.0.0
 * @category constants
 */
export const CML_DEFAULT_OPTIONS: CodecOptions = {
  mode: "custom",
  useIndefiniteArrays: false,
  useIndefiniteMaps: false,
  useDefiniteForEmpty: true,
  sortMapKeys: false,
  useMinimalEncoding: true,
  mapsAsObjects: false
} as const

/**
 * Default CBOR encoding option for Data
 *
 * @since 1.0.0
 * @category constants
 */
export const CML_DATA_DEFAULT_OPTIONS: CodecOptions = {
  mode: "custom",
  useIndefiniteArrays: true,
  useIndefiniteMaps: true,
  useDefiniteForEmpty: true,
  sortMapKeys: false,
  useMinimalEncoding: true,
  mapsAsObjects: false
} as const

/**
 * CBOR encoding options that return objects instead of Maps for Schema.Struct compatibility
 *
 * @since 2.0.0
 * @category constants
 */
export const STRUCT_FRIENDLY_OPTIONS: CodecOptions = {
  mode: "custom",
  useIndefiniteArrays: false,
  useIndefiniteMaps: false,
  useDefiniteForEmpty: true,
  sortMapKeys: false,
  useMinimalEncoding: true,
  mapsAsObjects: true
} as const

const DEFAULT_OPTIONS: CodecOptions = {
  mode: "custom",
  useIndefiniteArrays: false,
  useIndefiniteMaps: false,
  useDefiniteForEmpty: true,
  sortMapKeys: false,
  useMinimalEncoding: true,
  mapsAsObjects: false
} as const

/**
 * Type representing a CBOR value with simplified, non-tagged structure
 *
 * @since 1.0.0
 * @category model
 */
export type CBOR =
  | bigint // integers (both positive and negative)
  | Uint8Array // byte strings
  | string // text strings
  | ReadonlyArray<CBOR> // arrays
  | ReadonlyMap<CBOR, CBOR> // maps
  | { readonly [key: string | number]: CBOR } // record alternative to maps
  | { _tag: "Tag"; tag: number; value: CBOR } // tagged values
  | boolean // boolean values
  | null // null value
  | undefined // undefined value
  | number // floating point numbers

/**
 * **Record vs Map Key Ordering**
 *
 * Records `{ readonly [key: string | number]: CBOR }` follow JavaScript object property enumeration rules:
 * 1. **Integer-like strings in ascending numeric order** (e.g., "0", "1", "42", "999")
 * 2. **Other strings in insertion order** (e.g., "text", "key1", "key2")
 *
 * Maps `ReadonlyMap<CBOR, CBOR>` preserve insertion order for all key types.
 *
 * **Example:**
 * ```typescript
 * // Map preserves insertion order: ["text", 42n, 999n]
 * const map = new Map([["text", "a"], [42n, "b"], [999n, "c"]])
 *
 * // Record follows JS enumeration: [42, 999, "text"]
 * const record = { text: "a", 42: "b", 999: "c" }
 * ```
 *
 * **Recommendation:** Use Maps for consistent insertion order with mixed key types,
 * or use canonical encoding to eliminate ordering differences.
 *
 * @since 1.0.0
 * @category model
 */

/**
 * CBOR Value schema definitions for each major type
 *
 * @since 1.0.0
 * @category schemas
 */

// Integer (Major Type 0 and 1 combined)
export const Integer = Schema.BigIntFromSelf
export const isInteger = Schema.is(Integer)

// Byte String (Major Type 2)
export const ByteArray = Schema.Uint8ArrayFromSelf
export const isByteArray = Schema.is(ByteArray)

// Text String (Major Type 3)
export const Text = Schema.String

// Array (Major Type 4)
export const ArraySchema = Schema.Array(Schema.suspend(() => CBORSchema))
export const isArray = Schema.is(ArraySchema)

// Map (Major Type 5)
export const MapSchema = Schema.ReadonlyMapFromSelf({
  key: Schema.suspend((): Schema.Schema<CBOR> => CBORSchema),
  value: Schema.suspend((): Schema.Schema<CBOR> => CBORSchema)
})

export const isMap = Schema.is(MapSchema)

// Record (Alternative to Major Type 5 - Map)
// Provides a Record<string, CBOR> alternative to ReadonlyMap<CBOR, CBOR>
// for applications that prefer object-based map representations
export const RecordSchema = Schema.Record({
  key: Schema.String, // Keep only string keys for Schema compatibility
  value: Schema.suspend((): Schema.Schema<CBOR> => CBORSchema)
})

export const isRecord = Schema.is(RecordSchema)

// Tag (Major Type 6)
export const Tag = Schema.TaggedStruct("Tag", {
  tag: Schema.Number,
  value: Schema.suspend((): Schema.Schema<CBOR> => CBORSchema)
})

export const tag = <T extends number, C extends Schema.Schema<any, any>>(tag: T, value: C) =>
  Schema.TaggedStruct("Tag", {
    tag: Schema.Literal(tag),
    value
  })

// Map function to create a schema for CBOR maps with specific key and value types
export const map = <K extends CBOR, V extends CBOR>(key: Schema.Schema<K>, value: Schema.Schema<V>) =>
  Schema.ReadonlyMapFromSelf({ key, value })

export const isTag = Schema.is(Tag)

// Simple values (Major Type 7)
export const Simple = Schema.Union(Schema.Boolean, Schema.Null, Schema.Undefined)

// Float (Major Type 7)
export const Float = Schema.Number

/**
 * CBOR Value discriminated union schema representing all possible CBOR data types
 * Inspired by OCaml and Rust CBOR implementations
 *
 * @since 1.0.0
 * @category schemas
 */
export const CBORSchema: Schema.Schema<CBOR> = Schema.Union(
  Integer,
  ByteArray,
  Text,
  ArraySchema,
  MapSchema,
  RecordSchema,
  Tag,
  Simple,
  Float
)

/**
 * Schema for encoding/decoding CBOR bytes using internal functions
 * This bypasses Effect's schema encoding for Tags to use proper CBOR tag encoding
 *
 * @since 1.0.0
 * @category schemas
 */
const CBORValueSchema = Schema.declare((input: unknown): input is CBOR => {
  // Basic runtime type checking for CBOR values
  if (typeof input === "bigint") return true
  if (input instanceof Uint8Array) return true
  if (typeof input === "string") return true
  if (Array.isArray(input)) return true
  if (input instanceof Map) return true
  if (input instanceof Tag) return true
  if (typeof input === "boolean") return true
  if (input === null || input === undefined) return true
  if (typeof input === "number") return true
  if (typeof input === "object" && input !== null) return true
  return false
})

/**
 * Pattern matching utility for CBOR values
 *
 * @since 1.0.0
 * @category transformation
 */
export const match = <R>(
  value: CBOR,
  patterns: {
    integer: (value: bigint) => R
    bytes: (value: Uint8Array) => R
    text: (value: string) => R
    array: (value: ReadonlyArray<CBOR>) => R
    map: (value: ReadonlyMap<CBOR, CBOR>) => R
    record: (value: { readonly [key: string]: CBOR }) => R
    tag: (tag: number, value: CBOR) => R
    boolean: (value: boolean) => R
    null: () => R
    undefined: () => R
    float: (value: number) => R
  }
): R => {
  if (typeof value === "bigint") {
    return patterns.integer(value)
  }
  if (value instanceof Uint8Array) {
    return patterns.bytes(value)
  }
  if (typeof value === "string") {
    return patterns.text(value)
  }
  if (Array.isArray(value)) {
    return patterns.array(value)
  }
  if (value instanceof Map) {
    return patterns.map(value)
  }
  if (isTag(value)) {
    return patterns.tag(value.tag, value.value)
  }
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Map) &&
    !(value instanceof Uint8Array) &&
    !(value instanceof Tag)
  ) {
    return patterns.record(value as { readonly [key: string]: CBOR })
  }
  if (typeof value === "boolean") {
    return patterns.boolean(value)
  }
  if (value === null) {
    return patterns.null()
  }
  if (value === undefined) {
    return patterns.undefined()
  }
  if (typeof value === "number") {
    return patterns.float(value)
  }

  // This should never happen with proper typing
  throw new Error(`Unhandled CBOR value type: ${typeof value}`)
}

// Internal encoding function used by Schema.transformOrFail
const internalEncode = (value: CBOR, options: CodecOptions = CML_DEFAULT_OPTIONS): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    if (typeof value === "bigint") {
      if (value >= 0n) {
        return yield* encodeUint(value, options)
      } else {
        return yield* encodeNint(value, options)
      }
    }
    if (value instanceof Uint8Array) {
      return yield* encodeBytes(value, options)
    }
    if (typeof value === "string") {
      return yield* encodeText(value, options)
    }
    if (Array.isArray(value)) {
      return yield* encodeArray(value, options)
    }
    if (value instanceof Map) {
      return yield* encodeMap(value, options)
    }
    if (isTag(value)) {
      return yield* encodeTag(value.tag, value.value, options)
    }
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Map) &&
      !(value instanceof Uint8Array) &&
      !(value instanceof Tag)
    ) {
      return yield* encodeRecord(value as { readonly [key: string | number]: CBOR }, options)
    }
    if (typeof value === "boolean" || value === null || value === undefined) {
      return yield* encodeSimple(value)
    }
    if (typeof value === "number") {
      return yield* encodeFloat(value, options)
    }

    return yield* new CBORError({
      message: `Unsupported CBOR value type: ${typeof value}`
    })
  })

// Internal decoding function used by Schema.transformOrFail
export const internalDecode = (
  data: Uint8Array,
  options: CodecOptions = DEFAULT_OPTIONS
): Eff.Effect<CBOR, CBORError> =>
  Eff.gen(function* () {
    if (data.length === 0) {
      return yield* new CBORError({ message: "Empty CBOR data" })
    }

    const { bytesConsumed, item } = yield* decodeItemWithLength(data, options)

    // Verify that all input bytes were consumed
    if (bytesConsumed !== data.length) {
      return yield* new CBORError({
        message: `Invalid CBOR: expected to consume ${data.length} bytes, but consumed ${bytesConsumed}`
      })
    }

    return item
  })

// Internal encoding functions

const encodeUint = (value: bigint, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    if (value < 0n) {
      return yield* new CBORError({
        message: `Cannot encode negative value ${value} as unsigned integer`
      })
    }

    // Check if value exceeds 64-bit limit and requires big_uint tag (2)
    const maxUint64 = 18446744073709551615n // 2^64 - 1
    if (value > maxUint64) {
      // Use CBOR tag 2 (big_uint) for large positive integers
      const bytes = bigintToBytes(value)
      const bytesValue = bytes
      return yield* encodeTag(2, bytesValue, options)
    }

    // Canonical encoding always uses minimal representation
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)

    if (value < 24n) {
      return new Uint8Array([Number(value)])
    } else if (value < 256n && useMinimal) {
      return new Uint8Array([24, Number(value)])
    } else if (value < 65536n && useMinimal) {
      return new Uint8Array([25, Number(value >> 8n), Number(value & 0xffn)])
    } else if (value < 4294967296n && useMinimal) {
      return new Uint8Array([
        26,
        Number((value >> 24n) & 0xffn),
        Number((value >> 16n) & 0xffn),
        Number((value >> 8n) & 0xffn),
        Number(value & 0xffn)
      ])
    } else {
      // 8-byte encoding for values <= 2^64-1
      return new Uint8Array([
        27,
        Number((value >> 56n) & 0xffn),
        Number((value >> 48n) & 0xffn),
        Number((value >> 40n) & 0xffn),
        Number((value >> 32n) & 0xffn),
        Number((value >> 24n) & 0xffn),
        Number((value >> 16n) & 0xffn),
        Number((value >> 8n) & 0xffn),
        Number(value & 0xffn)
      ])
    }
  })

const encodeNint = (value: bigint, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    if (value >= 0n) {
      return yield* new CBORError({
        message: `Cannot encode non-negative value ${value} as negative integer`
      })
    }

    // Check if value exceeds 64-bit limit and requires big_nint tag (3)
    const minInt64 = -18446744073709551615n // -(2^64 - 1)
    if (value < minInt64) {
      // Use CBOR tag 3 (big_nint) for large negative integers
      // For tag 3, we encode the positive value (-(n+1))
      const positiveValue = -(value + 1n)
      const bytes = bigintToBytes(positiveValue)
      const bytesValue = bytes
      return yield* encodeTag(3, bytesValue, options)
    }

    // RFC 8949: negative integers are encoded as -1 - n
    const positiveValue = -value - 1n
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)

    if (positiveValue < 24n) {
      return new Uint8Array([0x20 + Number(positiveValue)])
    } else if (positiveValue < 256n && useMinimal) {
      return new Uint8Array([0x38, Number(positiveValue)])
    } else if (positiveValue < 65536n && useMinimal) {
      return new Uint8Array([0x39, Number(positiveValue >> 8n), Number(positiveValue & 0xffn)])
    } else if (positiveValue < 4294967296n && useMinimal) {
      return new Uint8Array([
        0x3a,
        Number((positiveValue >> 24n) & 0xffn),
        Number((positiveValue >> 16n) & 0xffn),
        Number((positiveValue >> 8n) & 0xffn),
        Number(positiveValue & 0xffn)
      ])
    } else {
      // 8-byte encoding for values >= -(2^64-1)
      return new Uint8Array([
        0x3b,
        Number((positiveValue >> 56n) & 0xffn),
        Number((positiveValue >> 48n) & 0xffn),
        Number((positiveValue >> 40n) & 0xffn),
        Number((positiveValue >> 32n) & 0xffn),
        Number((positiveValue >> 24n) & 0xffn),
        Number((positiveValue >> 16n) & 0xffn),
        Number((positiveValue >> 8n) & 0xffn),
        Number(positiveValue & 0xffn)
      ])
    }
  })

const encodeBytes = (value: Uint8Array, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    const length = value.length
    let headerBytes: Uint8Array
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)

    if (length < 24) {
      headerBytes = new Uint8Array([0x40 + length])
    } else if (length < 256 && useMinimal) {
      headerBytes = new Uint8Array([0x58, length])
    } else if (length < 65536 && useMinimal) {
      headerBytes = new Uint8Array([0x59, length >> 8, length & 0xff])
    } else if (length < 4294967296 && useMinimal) {
      headerBytes = new Uint8Array([
        0x5a,
        (length >> 24) & 0xff,
        (length >> 16) & 0xff,
        (length >> 8) & 0xff,
        length & 0xff
      ])
    } else {
      return yield* new CBORError({
        message: `Byte string too long: ${length} bytes`
      })
    }

    const result = new Uint8Array(headerBytes.length + length)
    result.set(headerBytes, 0)
    result.set(value, headerBytes.length)
    return result
  })

const encodeText = (value: string, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    const utf8Bytes = new TextEncoder().encode(value)
    const length = utf8Bytes.length
    let headerBytes: Uint8Array
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)

    if (length < 24) {
      headerBytes = new Uint8Array([0x60 + length])
    } else if (length < 256 && useMinimal) {
      headerBytes = new Uint8Array([0x78, length])
    } else if (length < 65536 && useMinimal) {
      headerBytes = new Uint8Array([0x79, length >> 8, length & 0xff])
    } else if (length < 4294967296 && useMinimal) {
      headerBytes = new Uint8Array([
        0x7a,
        (length >> 24) & 0xff,
        (length >> 16) & 0xff,
        (length >> 8) & 0xff,
        length & 0xff
      ])
    } else {
      return yield* new CBORError({
        message: `Text string too long: ${length} bytes`
      })
    }

    const result = new Uint8Array(headerBytes.length + length)
    result.set(headerBytes, 0)
    result.set(utf8Bytes, headerBytes.length)
    return result
  })

const encodeArray = (value: ReadonlyArray<CBOR>, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    const length = value.length
    const chunks: Array<Uint8Array> = []
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)
    const useIndefinite = options.mode === "custom" && options.useIndefiniteArrays && length > 0

    if (useIndefinite) {
      // Indefinite-length array
      chunks.push(new Uint8Array([0x9f])) // Start indefinite array

      // Encode each item
      for (const item of value) {
        const encodedItem = yield* internalEncode(item, options)
        chunks.push(encodedItem)
      }

      // Add break marker
      chunks.push(new Uint8Array([0xff]))
    } else {
      // Definite-length array
      if (length < 24) {
        chunks.push(new Uint8Array([0x80 + length]))
      } else if (length < 256 && useMinimal) {
        chunks.push(new Uint8Array([0x98, length]))
      } else if (length < 65536 && useMinimal) {
        chunks.push(new Uint8Array([0x99, length >> 8, length & 0xff]))
      } else if (length < 4294967296 && useMinimal) {
        chunks.push(
          new Uint8Array([0x9a, (length >> 24) & 0xff, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff])
        )
      } else {
        return yield* new CBORError({
          message: `Array too long: ${length} elements`
        })
      }

      // Encode each item
      for (const item of value) {
        const encodedItem = yield* internalEncode(item, options)
        chunks.push(encodedItem)
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result
  })

const encodeMap = (value: ReadonlyMap<CBOR, CBOR>, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    // Convert Map to array of pairs for processing
    const pairs = Array.from(value.entries())
    const length = pairs.length
    const chunks: Array<Uint8Array> = []
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)
    const sortKeys = options.mode === "canonical" || (options.mode === "custom" && options.sortMapKeys)
    const useIndefinite = options.mode === "custom" && options.useIndefiniteMaps && length > 0

    // Sort keys if required (canonical CBOR requires sorted keys)
    let encodedPairs: Array<{ encodedKey: Uint8Array; encodedValue: Uint8Array }> | undefined

    if (sortKeys) {
      // Sort by encoded key length only (matches old CBOR.ts behavior)
      const tempEncodedPairs = yield* Eff.all(
        pairs.map(([key, val]) =>
          Eff.gen(function* () {
            const encodedKey = yield* internalEncode(key, options)
            const encodedValue = yield* internalEncode(val, options)
            return { encodedKey, encodedValue }
          })
        )
      )

      // Sort by encoded key length only (not full lexicographic order)
      tempEncodedPairs.sort((a, b) => {
        return a.encodedKey.length - b.encodedKey.length
      })

      encodedPairs = tempEncodedPairs
    }

    if (useIndefinite) {
      // Indefinite-length map
      chunks.push(new Uint8Array([0xbf])) // Start indefinite map

      // Encode each key-value pair
      if (encodedPairs) {
        // Use pre-encoded pairs for sorted output
        for (const { encodedKey, encodedValue } of encodedPairs) {
          chunks.push(encodedKey)
          chunks.push(encodedValue)
        }
      } else {
        // Encode pairs on-the-fly for unsorted output
        for (const [key, val] of pairs) {
          const encodedKey = yield* internalEncode(key, options)
          const encodedValue = yield* internalEncode(val, options)
          chunks.push(encodedKey)
          chunks.push(encodedValue)
        }
      }

      // Add break marker
      chunks.push(new Uint8Array([0xff]))
    } else {
      // Definite-length map
      if (length < 24) {
        chunks.push(new Uint8Array([0xa0 + length]))
      } else if (length < 256 && useMinimal) {
        chunks.push(new Uint8Array([0xb8, length]))
      } else if (length < 65536 && useMinimal) {
        chunks.push(new Uint8Array([0xb9, length >> 8, length & 0xff]))
      } else if (length < 4294967296 && useMinimal) {
        chunks.push(
          new Uint8Array([0xba, (length >> 24) & 0xff, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff])
        )
      } else {
        return yield* new CBORError({
          message: `Map too long: ${length} entries`
        })
      }

      // Encode each key-value pair
      if (encodedPairs) {
        // Use pre-encoded pairs for sorted output
        for (const { encodedKey, encodedValue } of encodedPairs) {
          chunks.push(encodedKey)
          chunks.push(encodedValue)
        }
      } else {
        // Encode pairs on-the-fly for unsorted output
        for (const [key, val] of pairs) {
          const encodedKey = yield* internalEncode(key, options)
          const encodedValue = yield* internalEncode(val, options)
          chunks.push(encodedKey)
          chunks.push(encodedValue)
        }
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result
  })

/**
 * Encode a Record (JavaScript object) as a CBOR Map.
 *
 * **Number Key Support:** Number keys (e.g., `42`) are automatically converted to
 * bigint and encoded as CBOR integers, not text strings.
 *
 * **Key Ordering:** Records follow JavaScript object property enumeration:
 * - Integer-like strings in ascending numeric order
 * - Other strings in insertion order
 * This may differ from Map insertion order with mixed key types.
 *
 * @param value - The record to encode
 * @param options - CBOR encoding options
 * @returns Effect that yields the encoded CBOR bytes
 *
 * @since 1.0.0
 * @category encoding
 */
const encodeRecord = (
  value: { readonly [key: string | number]: CBOR },
  options: CodecOptions
): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    // Convert Record to Map to preserve insertion order and reuse Map encoding logic
    // Handle the case where number keys get converted to strings by Object.entries
    const rawPairs = Object.entries(value)
    const mapEntries = rawPairs.map(([key, val]) => {
      // Check if the string key represents a number that should be encoded as bigint
      const numKey = Number(key)
      if (Number.isInteger(numKey) && !Number.isNaN(numKey) && key === String(numKey)) {
        // Convert back to bigint for proper CBOR encoding
        return [BigInt(numKey), val] as [CBOR, CBOR]
      }
      return [key, val] as [CBOR, CBOR]
    })

    // Create a Map from the processed entries and encode it
    const map = new Map(mapEntries)
    return yield* encodeMap(map, options)
  })

const encodeTag = (tag: number, value: CBOR, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    const chunks: Array<Uint8Array> = []
    const useMinimal = options.mode === "canonical" || (options.mode === "custom" && options.useMinimalEncoding)

    // Encode tag
    if (tag < 24) {
      chunks.push(new Uint8Array([0xc0 + tag]))
    } else if (tag < 256 && useMinimal) {
      chunks.push(new Uint8Array([0xd8, tag]))
    } else if (tag < 65536 && useMinimal) {
      chunks.push(new Uint8Array([0xd9, tag >> 8, tag & 0xff]))
    } else {
      return yield* new CBORError({ message: `Tag ${tag} too large` })
    }

    // Encode tagged value
    const encodedValue = yield* internalEncode(value, options)
    chunks.push(encodedValue)

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result
  })

const encodeSimple = (value: boolean | null | undefined): Eff.Effect<Uint8Array, CBORError> =>
  Eff.gen(function* () {
    if (value === false) return new Uint8Array([0xf4])
    if (value === true) return new Uint8Array([0xf5])
    if (value === null) return new Uint8Array([0xf6])
    if (value === undefined) return new Uint8Array([0xf7])

    return yield* new CBORError({
      message: `Invalid simple value: ${value}`
    })
  })

const encodeFloat = (value: number, options: CodecOptions): Eff.Effect<Uint8Array, CBORError> =>
  Eff.succeed(
    (() => {
      if (Number.isNaN(value)) {
        return new Uint8Array([0xf9, 0x7e, 0x00]) // Half-precision NaN
      } else if (value === Infinity) {
        return new Uint8Array([0xf9, 0x7c, 0x00]) // Half-precision Infinity
      } else if (value === -Infinity) {
        return new Uint8Array([0xf9, 0xfc, 0x00]) // Half-precision -Infinity
      } else {
        // For canonical CBOR, use smallest representation that preserves the value
        if (options.mode === "canonical") {
          // Try half precision first
          const half = encodeFloat16(value)
          if (decodeFloat16(half) === value) {
            return new Uint8Array([0xf9, (half >> 8) & 0xff, half & 0xff])
          }

          // Try single precision
          const buffer32 = new ArrayBuffer(4)
          const view32 = new DataView(buffer32)
          view32.setFloat32(0, value, false)
          if (view32.getFloat32(0, false) === value) {
            return new Uint8Array([0xfa, ...new Uint8Array(buffer32)])
          }
        }

        // Encode as double-precision float
        const buffer = new ArrayBuffer(8)
        const view = new DataView(buffer)
        view.setFloat64(0, value, false) // big-endian
        return new Uint8Array([0xfb, ...new Uint8Array(buffer)])
      }
    })()
  )

// Internal decoding functions

const decodeUint = (data: Uint8Array): Eff.Effect<CBOR, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo < 24) {
      return BigInt(additionalInfo)
    } else if (additionalInfo === 24) {
      if (data.length < 2) {
        return yield* new CBORError({
          message: "Insufficient data for 1-byte unsigned integer"
        })
      }
      return BigInt(data[1])
    } else if (additionalInfo === 25) {
      if (data.length < 3) {
        return yield* new CBORError({
          message: "Insufficient data for 2-byte unsigned integer"
        })
      }
      return BigInt(data[1]) * 256n + BigInt(data[2])
    } else if (additionalInfo === 26) {
      if (data.length < 5) {
        return yield* new CBORError({
          message: "Insufficient data for 4-byte unsigned integer"
        })
      }
      return BigInt(data[1]) * 16777216n + BigInt(data[2]) * 65536n + BigInt(data[3]) * 256n + BigInt(data[4])
    } else if (additionalInfo === 27) {
      if (data.length < 9) {
        return yield* new CBORError({
          message: "Insufficient data for 8-byte unsigned integer"
        })
      }
      let result = 0n
      for (let i = 1; i <= 8; i++) {
        result = result * 256n + BigInt(data[i])
      }
      return result
    } else {
      return yield* new CBORError({
        message: `Unsupported additional info for unsigned integer: ${additionalInfo}`
      })
    }
  })

const decodeNint = (data: Uint8Array): Eff.Effect<CBOR, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo < 24) {
      return -1n - BigInt(additionalInfo)
    } else if (additionalInfo === 24) {
      if (data.length < 2) {
        return yield* new CBORError({
          message: "Insufficient data for 1-byte negative integer"
        })
      }
      return -1n - BigInt(data[1])
    } else if (additionalInfo === 25) {
      if (data.length < 3) {
        return yield* new CBORError({
          message: "Insufficient data for 2-byte negative integer"
        })
      }
      return -1n - (BigInt(data[1]) * 256n + BigInt(data[2]))
    } else if (additionalInfo === 26) {
      if (data.length < 5) {
        return yield* new CBORError({
          message: "Insufficient data for 4-byte negative integer"
        })
      }
      return -1n - (BigInt(data[1]) * 16777216n + BigInt(data[2]) * 65536n + BigInt(data[3]) * 256n + BigInt(data[4]))
    } else if (additionalInfo === 27) {
      if (data.length < 9) {
        return yield* new CBORError({
          message: "Insufficient data for 8-byte negative integer"
        })
      }
      let result = 0n
      for (let i = 1; i <= 8; i++) {
        result = result * 256n + BigInt(data[i])
      }
      return -1n - result
    } else {
      return yield* new CBORError({
        message: `Unsupported additional info for negative integer: ${additionalInfo}`
      })
    }
  })

const decodeBytesWithLength = (data: Uint8Array): Eff.Effect<{ item: CBOR; bytesConsumed: number }, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo === CBOR_ADDITIONAL_INFO.INDEFINITE) {
      // Indefinite-length byte string - concatenate chunks until break
      let offset = 1
      const chunks: Array<Uint8Array> = []
      let foundBreak = false

      while (offset < data.length) {
        if (data[offset] === 0xff) {
          offset++
          foundBreak = true
          break
        }

        // Decode a definite-length byte string chunk
        const chunkFirstByte = data[offset]
        const chunkMajorType = (chunkFirstByte >> 5) & 0x07

        if (chunkMajorType !== CBOR_MAJOR_TYPE.BYTE_STRING) {
          return yield* new CBORError({
            message: "Expected byte string chunk in indefinite byte string"
          })
        }

        const chunkAdditionalInfo = chunkFirstByte & 0x1f
        if (chunkAdditionalInfo === CBOR_ADDITIONAL_INFO.INDEFINITE) {
          return yield* new CBORError({
            message: "Nested indefinite byte strings not allowed"
          })
        }

        const { bytesRead, length: chunkLength } = yield* decodeLength(data, offset)
        const chunkData = data.slice(offset + bytesRead, offset + bytesRead + chunkLength)
        chunks.push(chunkData)
        offset += bytesRead + chunkLength
      }

      if (!foundBreak) {
        return yield* new CBORError({
          message: "Missing break marker for indefinite byte string"
        })
      }

      // Concatenate all chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let resultOffset = 0
      for (const chunk of chunks) {
        result.set(chunk, resultOffset)
        resultOffset += chunk.length
      }

      return { item: result, bytesConsumed: offset }
    } else {
      // Definite-length byte string
      const { bytesRead, length } = yield* decodeLength(data, 0)

      if (data.length < bytesRead + length) {
        return yield* new CBORError({
          message: `Insufficient data for byte string: expected ${bytesRead + length} bytes, got ${data.length}`
        })
      }

      const result = data.slice(bytesRead, bytesRead + length)
      return { item: result, bytesConsumed: bytesRead + length }
    }
  })

const decodeTextWithLength = (data: Uint8Array): Eff.Effect<{ item: CBOR; bytesConsumed: number }, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo === CBOR_ADDITIONAL_INFO.INDEFINITE) {
      // Indefinite-length text string - concatenate chunks until break
      let offset = 1
      const chunks: Array<string> = []
      let foundBreak = false

      while (offset < data.length) {
        if (data[offset] === 0xff) {
          offset++
          foundBreak = true
          break
        }

        // Decode a definite-length text string chunk
        const chunkFirstByte = data[offset]
        const chunkMajorType = (chunkFirstByte >> 5) & 0x07

        if (chunkMajorType !== CBOR_MAJOR_TYPE.TEXT_STRING) {
          return yield* new CBORError({
            message: "Expected text string chunk in indefinite text string"
          })
        }

        const chunkAdditionalInfo = chunkFirstByte & 0x1f
        if (chunkAdditionalInfo === CBOR_ADDITIONAL_INFO.INDEFINITE) {
          return yield* new CBORError({
            message: "Nested indefinite text strings not allowed"
          })
        }

        const { bytesRead, length: chunkLength } = yield* decodeLength(data, offset)
        const chunkBytes = data.slice(offset + bytesRead, offset + bytesRead + chunkLength)

        try {
          const chunkText = new TextDecoder("utf-8", { fatal: true }).decode(chunkBytes)
          chunks.push(chunkText)
        } catch (error) {
          return yield* new CBORError({
            message: "Invalid UTF-8 in text string chunk",
            cause: error
          })
        }

        offset += bytesRead + chunkLength
      }

      if (!foundBreak) {
        return yield* new CBORError({
          message: "Missing break marker for indefinite text string"
        })
      }

      // Concatenate all chunks
      return { item: chunks.join(""), bytesConsumed: offset }
    } else {
      // Definite-length text string
      const { bytesRead, length } = yield* decodeLength(data, 0)

      if (data.length < bytesRead + length) {
        return yield* new CBORError({
          message: `Insufficient data for text string: expected ${bytesRead + length} bytes, got ${data.length}`
        })
      }

      const textBytes = data.slice(bytesRead, bytesRead + length)
      try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(textBytes)
        return { item: text, bytesConsumed: bytesRead + length }
      } catch (error) {
        return yield* new CBORError({
          message: "Invalid UTF-8 in text string",
          cause: error
        })
      }
    }
  })

// Helper function to decode an item and return both the item and bytes consumed
const decodeItemWithLength = (
  data: Uint8Array,
  options: CodecOptions = CML_DEFAULT_OPTIONS
): Eff.Effect<{ item: CBOR; bytesConsumed: number }, CBORError> =>
  Eff.gen(function* () {
    if (data.length === 0) {
      return yield* new CBORError({ message: "Empty CBOR data" })
    }

    const firstByte = data[0]
    const majorType = (firstByte >> 5) & 0x07
    const additionalInfo = firstByte & 0x1f

    let bytesConsumed = 0
    let item: CBOR

    switch (majorType) {
      case CBOR_MAJOR_TYPE.UNSIGNED_INTEGER: {
        item = yield* decodeUint(data)
        if (additionalInfo < 24) {
          bytesConsumed = 1
        } else if (additionalInfo === 24) {
          bytesConsumed = 2
        } else if (additionalInfo === 25) {
          bytesConsumed = 3
        } else if (additionalInfo === 26) {
          bytesConsumed = 5
        } else if (additionalInfo === 27) {
          bytesConsumed = 9
        } else {
          return yield* new CBORError({
            message: `Unsupported additional info for unsigned integer: ${additionalInfo}`
          })
        }
        break
      }
      case CBOR_MAJOR_TYPE.NEGATIVE_INTEGER: {
        item = yield* decodeNint(data)
        if (additionalInfo < 24) {
          bytesConsumed = 1
        } else if (additionalInfo === 24) {
          bytesConsumed = 2
        } else if (additionalInfo === 25) {
          bytesConsumed = 3
        } else if (additionalInfo === 26) {
          bytesConsumed = 5
        } else if (additionalInfo === 27) {
          bytesConsumed = 9
        } else {
          return yield* new CBORError({
            message: `Unsupported additional info for negative integer: ${additionalInfo}`
          })
        }
        break
      }
      case CBOR_MAJOR_TYPE.BYTE_STRING: {
        const { bytesConsumed: bytesBytes, item: bytesItem } = yield* decodeBytesWithLength(data)
        item = bytesItem
        bytesConsumed = bytesBytes
        break
      }
      case CBOR_MAJOR_TYPE.TEXT_STRING: {
        const { bytesConsumed: textBytes, item: textItem } = yield* decodeTextWithLength(data)
        item = textItem
        bytesConsumed = textBytes
        break
      }
      case CBOR_MAJOR_TYPE.ARRAY: {
        const { bytesConsumed: arrayBytes, item: arrayItem } = yield* decodeArrayWithLength(data, options)
        item = arrayItem
        bytesConsumed = arrayBytes
        break
      }
      case CBOR_MAJOR_TYPE.MAP: {
        const { bytesConsumed: mapBytes, item: mapItem } = yield* decodeMapWithLength(data, options)
        item = mapItem
        bytesConsumed = mapBytes
        break
      }
      case CBOR_MAJOR_TYPE.TAG: {
        const { bytesConsumed: tagBytes, item: tagItem } = yield* decodeTagWithLength(data, options)
        item = tagItem
        bytesConsumed = tagBytes
        break
      }
      case CBOR_MAJOR_TYPE.SIMPLE_FLOAT: {
        item = yield* decodeSimpleOrFloat(data)
        if (additionalInfo < 24) {
          bytesConsumed = 1
        } else if (additionalInfo === 24) {
          bytesConsumed = 2
        } else if (additionalInfo === 25) {
          bytesConsumed = 3
        } else if (additionalInfo === 26) {
          bytesConsumed = 5
        } else if (additionalInfo === 27) {
          bytesConsumed = 9
        } else {
          return yield* new CBORError({
            message: `Unsupported simple/float encoding: ${additionalInfo}`
          })
        }
        break
      }
      default:
        return yield* new CBORError({
          message: `Unknown CBOR major type: ${majorType}`
        })
    }

    return { item, bytesConsumed }
  })

const decodeArrayWithLength = (
  data: Uint8Array,
  options: CodecOptions = CML_DEFAULT_OPTIONS
): Eff.Effect<{ item: CBOR; bytesConsumed: number }, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo === CBOR_ADDITIONAL_INFO.INDEFINITE) {
      // Indefinite-length array
      let offset = 1
      const result: Array<CBOR> = []
      let foundBreak = false

      while (offset < data.length) {
        if (data[offset] === 0xff) {
          offset++
          foundBreak = true
          break
        }

        const { bytesConsumed, item } = yield* decodeItemWithLength(data.slice(offset), options)
        result.push(item)
        offset += bytesConsumed
      }

      if (!foundBreak) {
        return yield* new CBORError({
          message: "Missing break marker for indefinite array"
        })
      }

      return {
        item: result,
        bytesConsumed: offset
      }
    } else {
      // Definite-length array
      const { bytesRead, length } = yield* decodeLength(data, 0)
      let offset = bytesRead
      const result: Array<CBOR> = []

      for (let i = 0; i < length; i++) {
        if (offset >= data.length) {
          return yield* new CBORError({
            message: `Insufficient data for array element ${i}`
          })
        }

        const { bytesConsumed, item } = yield* decodeItemWithLength(data.slice(offset), options)
        result.push(item)
        offset += bytesConsumed
      }

      return {
        item: result,
        bytesConsumed: offset
      }
    }
  })

/**
 * Helper function to convert Map entries to a plain object.
 * Used when mapsAsObjects option is enabled.
 */
const convertEntriesToObject = (entries: Array<[CBOR, CBOR]>): Record<string | number, CBOR> => {
  const obj: Record<string | number, CBOR> = {}
  for (const [key, value] of entries) {
    if (typeof key === "string" || typeof key === "number") {
      obj[key] = value
    } else if (typeof key === "bigint") {
      obj[Number(key)] = value
    } else {
      // For non-primitive keys, convert to string
      obj[String(key)] = value
    }
  }
  return obj
}

const decodeMapWithLength = (
  data: Uint8Array,
  options: CodecOptions = CML_DEFAULT_OPTIONS
): Eff.Effect<{ item: CBOR; bytesConsumed: number }, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo === CBOR_ADDITIONAL_INFO.INDEFINITE) {
      // Indefinite-length map
      let offset = 1
      const entries: Array<[CBOR, CBOR]> = []
      let foundBreak = false

      while (offset < data.length) {
        if (data[offset] === 0xff) {
          offset++
          foundBreak = true
          break
        }

        // Decode key
        const { bytesConsumed: keyBytes, item: key } = yield* decodeItemWithLength(data.slice(offset), options)
        offset += keyBytes

        // Decode value
        if (offset >= data.length) {
          return yield* new CBORError({
            message: "Missing value in indefinite map"
          })
        }

        const { bytesConsumed: valueBytes, item: value } = yield* decodeItemWithLength(data.slice(offset), options)
        offset += valueBytes

        entries.push([key, value])
      }

      if (!foundBreak) {
        return yield* new CBORError({
          message: "Missing break marker for indefinite map"
        })
      }

      // Convert to Map or Object based on option
      const result = options.mapsAsObjects ? convertEntriesToObject(entries) : new Map(entries)

      return { item: result, bytesConsumed: offset }
    } else {
      // Definite-length map
      const { bytesRead, length } = yield* decodeLength(data, 0)
      let offset = bytesRead
      const entries: Array<[CBOR, CBOR]> = []

      for (let i = 0; i < length; i++) {
        // Decode key
        if (offset >= data.length) {
          return yield* new CBORError({
            message: `Insufficient data for map key ${i}`
          })
        }

        const { bytesConsumed: keyBytes, item: key } = yield* decodeItemWithLength(data.slice(offset), options)
        offset += keyBytes

        // Decode value
        if (offset >= data.length) {
          return yield* new CBORError({
            message: `Insufficient data for map value ${i}`
          })
        }

        const { bytesConsumed: valueBytes, item: value } = yield* decodeItemWithLength(data.slice(offset), options)
        offset += valueBytes

        entries.push([key, value])
      }

      // Convert to Map or Object based on option
      const result = options.mapsAsObjects ? convertEntriesToObject(entries) : new Map(entries)

      return { item: result, bytesConsumed: offset }
    }
  })

const decodeTagWithLength = (
  data: Uint8Array,
  options: CodecOptions = DEFAULT_OPTIONS
): Eff.Effect<{ item: CBOR; bytesConsumed: number }, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f
    let tagValue: number
    let dataOffset: number

    if (additionalInfo < 24) {
      tagValue = additionalInfo
      dataOffset = 1
    } else if (additionalInfo === 24) {
      if (data.length < 2) {
        return yield* new CBORError({
          message: "Insufficient data for 1-byte tag"
        })
      }
      tagValue = data[1]
      dataOffset = 2
    } else if (additionalInfo === 25) {
      if (data.length < 3) {
        return yield* new CBORError({
          message: "Insufficient data for 2-byte tag"
        })
      }
      tagValue = (data[1] << 8) | data[2]
      dataOffset = 3
    } else {
      return yield* new CBORError({
        message: `Unsupported tag encoding: ${additionalInfo}`
      })
    }

    const { bytesConsumed, item: innerValue } = yield* decodeItemWithLength(data.slice(dataOffset), options)

    // Handle special tags that should be converted to plain values
    if (tagValue === 2) {
      // Tag 2: positive big integer
      if (innerValue instanceof Uint8Array) {
        return {
          item: bytesToBigint(innerValue),
          bytesConsumed: dataOffset + bytesConsumed
        }
      } else {
        return yield* new CBORError({
          message: `Expected bytes for tag 2 (big_uint), got ${typeof innerValue}`
        })
      }
    } else if (tagValue === 3) {
      // Tag 3: negative big integer
      if (innerValue instanceof Uint8Array) {
        const positiveValue = bytesToBigint(innerValue)
        return {
          item: -(positiveValue + 1n),
          bytesConsumed: dataOffset + bytesConsumed
        }
      } else {
        return yield* new CBORError({
          message: `Expected bytes for tag 3 (big_nint), got ${typeof innerValue}`
        })
      }
    }

    // For all other tags, return as tagged object
    return {
      item: Tag.make({
        tag: tagValue,
        value: innerValue
      }),
      bytesConsumed: dataOffset + bytesConsumed
    }
  })

const decodeSimpleOrFloat = (data: Uint8Array): Eff.Effect<CBOR, CBORError> =>
  Eff.gen(function* () {
    const firstByte = data[0]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo === CBOR_SIMPLE.FALSE) {
      return false
    } else if (additionalInfo === CBOR_SIMPLE.TRUE) {
      return true
    } else if (additionalInfo === CBOR_SIMPLE.NULL) {
      return null
    } else if (additionalInfo === CBOR_SIMPLE.UNDEFINED) {
      return undefined
    } else if (additionalInfo < 24) {
      // Unassigned simple values 0-19 (not 20-23 which are assigned above)
      // Return them as numbers for compatibility with test vectors
      return additionalInfo
    } else if (additionalInfo === 24) {
      // Simple value with 1-byte payload
      if (data.length < 2) {
        return yield* new CBORError({
          message: "Insufficient data for 1-byte simple value"
        })
      }
      const simpleValue = data[1]
      // Return the simple value as a number
      // RFC 8949 allows unassigned simple values to be decoded
      return simpleValue
    } else if (additionalInfo === 25) {
      // Half-precision float
      if (data.length < 3) {
        return yield* new CBORError({
          message: "Insufficient data for half-precision float"
        })
      }
      const value = (data[1] << 8) | data[2]
      const float = decodeFloat16(value)
      return float
    } else if (additionalInfo === 26) {
      // Single-precision float
      if (data.length < 5) {
        return yield* new CBORError({
          message: "Insufficient data for single-precision float"
        })
      }
      const view = new DataView(data.buffer, data.byteOffset + 1, 4)
      return view.getFloat32(0, false) // big-endian
    } else if (additionalInfo === 27) {
      // Double-precision float
      if (data.length < 9) {
        return yield* new CBORError({
          message: "Insufficient data for double-precision float"
        })
      }
      const view = new DataView(data.buffer, data.byteOffset + 1, 8)
      return view.getFloat64(0, false) // big-endian
    } else {
      return yield* new CBORError({
        message: `Unsupported simple/float encoding: ${additionalInfo}`
      })
    }
  })

// Helper functions for bigint conversion

/**
 * Convert a positive bigint to a big-endian byte array
 * Used for CBOR tag 2 (big_uint) encoding
 */
const bigintToBytes = (value: bigint): Uint8Array => {
  if (value === 0n) {
    return new Uint8Array([0])
  }

  const bytes: Array<number> = []
  let temp = value

  while (temp > 0n) {
    bytes.unshift(Number(temp & 0xffn))
    temp = temp >> 8n
  }

  return new Uint8Array(bytes)
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

// Helper function for length decoding

const decodeLength = (data: Uint8Array, offset: number): Eff.Effect<{ length: number; bytesRead: number }, CBORError> =>
  Eff.gen(function* () {
    if (offset >= data.length) {
      return yield* new CBORError({
        message: "Insufficient data for length decoding"
      })
    }

    const firstByte = data[offset]
    const additionalInfo = firstByte & 0x1f

    if (additionalInfo < 24) {
      return { length: additionalInfo, bytesRead: 1 }
    } else if (additionalInfo === 24) {
      if (data.length < offset + 2) {
        return yield* new CBORError({
          message: "Insufficient data for 1-byte length"
        })
      }
      return { length: data[offset + 1], bytesRead: 2 }
    } else if (additionalInfo === 25) {
      if (data.length < offset + 3) {
        return yield* new CBORError({
          message: "Insufficient data for 2-byte length"
        })
      }
      return {
        length: (data[offset + 1] << 8) | data[offset + 2],
        bytesRead: 3
      }
    } else if (additionalInfo === 26) {
      if (data.length < offset + 5) {
        return yield* new CBORError({
          message: "Insufficient data for 4-byte length"
        })
      }
      return {
        length: (data[offset + 1] << 24) | (data[offset + 2] << 16) | (data[offset + 3] << 8) | data[offset + 4],
        bytesRead: 5
      }
    } else {
      return yield* new CBORError({
        message: `Unsupported length encoding: ${additionalInfo}`
      })
    }
  })

const decodeFloat16 = (value: number): number => {
  const sign = (value & 0x8000) >> 15
  const exponent = (value & 0x7c00) >> 10
  const fraction = value & 0x03ff

  if (exponent === 0) {
    return (sign ? -1 : 1) * Math.pow(2, -14) * (fraction / 1024)
  } else if (exponent === 0x1f) {
    return fraction ? NaN : sign ? -Infinity : Infinity
  } else {
    return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + fraction / 1024)
  }
}

const encodeFloat16 = (value: number): number => {
  if (Number.isNaN(value)) return 0x7e00
  if (value === Infinity) return 0x7c00
  if (value === -Infinity) return 0xfc00
  if (value === 0) return value === 0 && 1 / value === Infinity ? 0x0000 : 0x8000

  const sign = value < 0 ? 1 : 0
  const absValue = Math.abs(value)

  if (absValue >= Math.pow(2, 16)) return sign ? 0xfc00 : 0x7c00 // Infinity
  if (absValue < Math.pow(2, -24)) return sign ? 0x8000 : 0x0000 // Zero

  let exponent = Math.floor(Math.log2(absValue))
  let mantissa = absValue / Math.pow(2, exponent)

  if (exponent < -14) {
    // Subnormal
    mantissa = absValue / Math.pow(2, -14)
    exponent = 0
  } else {
    // Normal
    mantissa = (mantissa - 1) * 1024
    exponent += 15
  }

  return (sign << 15) | (exponent << 10) | Math.round(mantissa)
}

/**
 * Create a CBOR bytes schema with custom codec options
 *
 * @since 1.0.0
 * @category schemas
 */
export const FromBytes = (options: CodecOptions) =>
  Schema.transformOrFail(Schema.Uint8ArrayFromSelf, CBORValueSchema, {
    strict: true,
    decode: (fromA, _, ast) =>
      Eff.mapError(
        internalDecode(fromA, options),
        (error) =>
          new ParseResult.Type(
            ast,
            fromA,
            `Failed to decode CBOR value: ${error instanceof CBORError ? error.message : String(error)}`
          )
      ),
    encode: (toA, _, ast) =>
      Eff.mapError(
        internalEncode(toA, options),
        (error) =>
          new ParseResult.Type(
            ast,
            toA,
            `Failed to encode CBOR value: ${error instanceof CBORError ? error.message : String(error)}`
          )
      )
  })

export const FromHex = (options: CodecOptions) => Schema.compose(Bytes.FromHex, FromBytes(options))

export namespace Effect {
  /**
   * Decode CBOR bytes to a CBOR value using Effect error handling.
   *
   * @since 1.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CodecOptions = CML_DEFAULT_OPTIONS
  ): Eff.Effect<CBOR, CBORError> =>
    Eff.mapError(
      Schema.decode(FromBytes(options))(bytes),
      (cause) =>
        new CBORError({
          message: "Failed to parse CBOR from bytes",
          cause
        })
    )

  /**
   * Decode CBOR hex string to a CBOR value using Effect error handling.
   *
   * @since 1.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options: CodecOptions = CML_DEFAULT_OPTIONS): Eff.Effect<CBOR, CBORError> =>
    Eff.mapError(
      Schema.decode(FromHex(options))(hex),
      (cause) =>
        new CBORError({
          message: "Failed to parse CBOR from hex",
          cause
        })
    )

  /**
   * Encode a CBOR value to bytes using Effect error handling.
   *
   * @since 1.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    value: CBOR,
    options: CodecOptions = CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, CBORError> =>
    Eff.mapError(
      Schema.encode(FromBytes(options))(value),
      (cause) =>
        new CBORError({
          message: "Failed to encode CBOR to bytes",
          cause
        })
    )

  /**
   * Encode a CBOR value to hex string using Effect error handling.
   *
   * @since 1.0.0
   * @category encoding
   */
  export const toCBORHex = (value: CBOR, options: CodecOptions = CML_DEFAULT_OPTIONS): Eff.Effect<string, CBORError> =>
    Eff.mapError(
      Schema.encode(FromHex(options))(value),
      (cause) =>
        new CBORError({
          message: "Failed to encode CBOR to hex",
          cause
        })
    )
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a CBOR value from CBOR bytes.
 *
 * @since 1.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CodecOptions): CBOR =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse a CBOR value from CBOR hex string.
 *
 * @since 1.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CodecOptions): CBOR => Eff.runSync(Effect.fromCBORHex(hex, options))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a CBOR value to CBOR bytes.
 *
 * @since 1.0.0
 * @category encoding
 */
export const toCBORBytes = (value: CBOR, options?: CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(value, options))

/**
 * Convert a CBOR value to CBOR hex string.
 *
 * @since 1.0.0
 * @category encoding
 */
export const toCBORHex = (value: CBOR, options?: CodecOptions): string => Eff.runSync(Effect.toCBORHex(value, options))
