/**
 * Golden Tests for Data Module
 *
 * This module provides comprehensive golden testing for the Data module's CBOR
 * encoding and decoding functionality. Golden tests validate that the current
 * implementation maintains compatibility with previously generated test data,
 * ensuring that CBOR serialization behavior remains consistent across versions.
 *
 * The tests cover all major PlutusData types:
 * - Integer: BigInt values with various ranges
 * - ByteArray: Hex-encoded byte arrays of different lengths
 * - List: Arrays containing nested PlutusData structures
 * - Map: Key-value pairs with PlutusData keys and values
 * - Constr: Constructor data with index and field arrays
 * - Data: Complex nested structures combining all types
 *
 * Each type is tested for:
 * - CBOR hex encoding consistency
 * - CBOR bytes encoding consistency
 * - CBOR hex decoding consistency
 * - CBOR bytes decoding consistency
 * - Round-trip encoding/decoding consistency
 *
 */

import { describe, expect, it } from "@effect/vitest"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

import * as Data from "../src/Data.js"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Test configuration defining the number of samples to test for each category
 *
 */
const TEST_CONFIG = {
  integer: {
    encoding: 4000,
    decoding: 4000,
    roundTrip: 1000
  },
  byteArray: {
    encoding: 4000,
    decoding: 4000,
    roundTrip: 1000
  },
  list: {
    encoding: 4000,
    decoding: 4000,
    roundTrip: 250
  },
  map: {
    encoding: 4000,
    decoding: 4000,
    roundTrip: 250
  },
  constr: {
    encoding: 4000,
    decoding: 4000,
    roundTrip: 250
  },
  data: {
    encoding: 4000,
    decoding: 4000,
    roundTrip: 100
  }
} as const

/**
 * Sample data types for different Plutus data structures
 *
 */
type IntegerSample = {
  readonly integer: bigint
}

type ByteArraySample = {
  readonly bytearray: string
}

type ListSample = {
  readonly list: ReadonlyArray<unknown>
}

type MapSample = {
  readonly entries: ReadonlyArray<{
    readonly key: unknown
    readonly value: unknown
  }>
}

type ConstrSample = {
  readonly index: number
  readonly fields: ReadonlyArray<unknown>
}

/**
 * Represents a single test entry in golden files
 *
 */
interface GoldenEntry {
  readonly index: number
  readonly sample: IntegerSample | ByteArraySample | ListSample | MapSample | ConstrSample | unknown
  readonly cborHex: string
  readonly cborBytes: ReadonlyArray<number>
  readonly roundTripSuccess: boolean
  readonly metadata: {
    readonly type: string
    readonly seed: number
  }
}

/**
 * Reviver function for parsing JSON with BigInt support
 *
 */
const bigintReviver = (_key: string, value: unknown): unknown => {
  if (
    typeof value === "object" &&
    value !== null &&
    "__type" in value &&
    value.__type === "bigint" &&
    "value" in value &&
    typeof value.value === "string"
  ) {
    return BigInt(value.value)
  }
  return value
}

/**
 * Type guards for different sample types
 *
 */
const isIntegerSample = (sample: unknown): sample is IntegerSample => {
  return typeof sample === "object" && sample !== null && "integer" in sample
}

const isByteArraySample = (sample: unknown): sample is ByteArraySample => {
  return typeof sample === "object" && sample !== null && "bytearray" in sample
}

const isListSample = (sample: unknown): sample is ListSample => {
  return typeof sample === "object" && sample !== null && "list" in sample && Array.isArray((sample as any).list)
}

const isMapSample = (sample: unknown): sample is MapSample => {
  return typeof sample === "object" && sample !== null && "entries" in sample && Array.isArray((sample as any).entries)
}

const isConstrSample = (sample: unknown): sample is ConstrSample => {
  return typeof sample === "object" && sample !== null && "index" in sample && "fields" in sample
}

/**
 * Load golden files from the test/golden directory
 *
 */
const loadGoldenFile = (filename: string): Array<GoldenEntry> => {
  const filePath = path.join(__dirname, "golden", filename)
  const content = fs.readFileSync(filePath, "utf8")
  return JSON.parse(content, bigintReviver)
}

/**
 * Cache for loaded golden files to avoid repeated I/O operations
 *
 */
const goldenCache = {
  integer: null as Array<GoldenEntry> | null,
  byteArray: null as Array<GoldenEntry> | null,
  list: null as Array<GoldenEntry> | null,
  map: null as Array<GoldenEntry> | null,
  constr: null as Array<GoldenEntry> | null,
  data: null as Array<GoldenEntry> | null
}

/**
 * Get golden entries with caching for performance
 *
 */
const getGoldenEntries = (type: keyof typeof goldenCache): Array<GoldenEntry> => {
  if (!goldenCache[type]) {
    goldenCache[type] = loadGoldenFile(`${type}.golden.json`)
  }
  return goldenCache[type]!
}

/**
 * Get test cases for a specific type and test category with sample limiting
 *
 */
const getTestCases = (
  type: keyof typeof TEST_CONFIG,
  category: keyof (typeof TEST_CONFIG)[typeof type]
): Array<GoldenEntry> => {
  const entries = getGoldenEntries(type)
  const count = TEST_CONFIG[type][category]
  return entries.slice(0, count)
}

/**
 * Golden Tests for Data module
 */
describe("Data Golden Tests", () => {
  describe("Integer Golden Tests", () => {
    it("should encode integers to CBOR hex consistently", () => {
      const testCases = getTestCases("integer", "encoding")

      testCases.forEach((entry) => {
        if (!isIntegerSample(entry.sample)) {
          throw new Error(`Invalid integer sample at index ${entry.index}`)
        }
        const plutusData = Data.int(entry.sample.integer)
        const encoded = Data.toCBORHex(plutusData)
        expect(encoded, `Failed at sample index ${entry.index}`).toBe(entry.cborHex)
      })
    })

    it("should encode integers to CBOR bytes consistently", () => {
      const testCases = getTestCases("integer", "encoding")

      testCases.forEach((entry) => {
        if (!isIntegerSample(entry.sample)) {
          throw new Error(`Invalid integer sample at index ${entry.index}`)
        }
        const plutusData = Data.int(entry.sample.integer)
        const encoded = Data.toCBORBytes(plutusData)
        expect(Array.from(encoded), `Failed at sample index ${entry.index}`).toEqual(entry.cborBytes)
      })
    })

    it("should decode CBOR hex to integers consistently", () => {
      const testCases = getTestCases("integer", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORHex(entry.cborHex)
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should decode CBOR bytes to integers consistently", () => {
      const testCases = getTestCases("integer", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORBytes(new Uint8Array(entry.cborBytes))
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should maintain round-trip consistency", () => {
      const testCases = getTestCases("integer", "roundTrip")

      testCases.forEach((entry) => {
        if (!isIntegerSample(entry.sample)) {
          throw new Error(`Invalid integer sample at index ${entry.index}`)
        }
        const plutusData = Data.int(entry.sample.integer)
        const encoded = Data.toCBORHex(plutusData)
        const decoded = Data.fromCBORHex(encoded)

        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })
  })

  describe("ByteArray Golden Tests", () => {
    it("should encode byte arrays to CBOR hex consistently", () => {
      const testCases = getTestCases("byteArray", "encoding")

      testCases.forEach((entry) => {
        if (!isByteArraySample(entry.sample)) {
          throw new Error(`Invalid byte array sample at index ${entry.index}`)
        }
        const plutusData = Data.bytearray(entry.sample.bytearray)
        const encoded = Data.toCBORHex(plutusData)
        expect(encoded, `Failed at sample index ${entry.index}`).toBe(entry.cborHex)
      })
    })

    it("should encode byte arrays to CBOR bytes consistently", () => {
      const testCases = getTestCases("byteArray", "encoding")

      testCases.forEach((entry) => {
        if (!isByteArraySample(entry.sample)) {
          throw new Error(`Invalid byte array sample at index ${entry.index}`)
        }
        const plutusData = Data.bytearray(entry.sample.bytearray)
        const encoded = Data.toCBORBytes(plutusData)
        expect(Array.from(encoded), `Failed at sample index ${entry.index}`).toEqual(entry.cborBytes)
      })
    })

    it("should decode CBOR hex to byte arrays consistently", () => {
      const testCases = getTestCases("byteArray", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORHex(entry.cborHex)
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should decode CBOR bytes to byte arrays consistently", () => {
      const testCases = getTestCases("byteArray", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORBytes(new Uint8Array(entry.cborBytes))
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should maintain round-trip consistency", () => {
      const testCases = getTestCases("byteArray", "roundTrip")

      testCases.forEach((entry) => {
        if (!isByteArraySample(entry.sample)) {
          throw new Error(`Invalid byte array sample at index ${entry.index}`)
        }
        const plutusData = Data.bytearray(entry.sample.bytearray)
        const encoded = Data.toCBORHex(plutusData)
        const decoded = Data.fromCBORHex(encoded)

        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })
  })

  describe("List Golden Tests", () => {
    it("should encode lists to CBOR hex consistently", () => {
      const testCases = getTestCases("list", "encoding")

      testCases.forEach((entry) => {
        if (!isListSample(entry.sample)) {
          throw new Error(`Invalid list sample at index ${entry.index}`)
        }
        const plutusDataList = entry.sample.list.map(reconstructPlutusData)
        const plutusData = Data.list(plutusDataList)
        const encoded = Data.toCBORHex(plutusData)
        expect(encoded, `Failed at sample index ${entry.index}`).toBe(entry.cborHex)
      })
    }, 30000) // 30 second timeout for large test cases

    it("should encode lists to CBOR bytes consistently", () => {
      const testCases = getTestCases("list", "encoding")

      testCases.forEach((entry) => {
        if (!isListSample(entry.sample)) {
          throw new Error(`Invalid list sample at index ${entry.index}`)
        }
        const plutusDataList = entry.sample.list.map(reconstructPlutusData)
        const plutusData = Data.list(plutusDataList)
        const encoded = Data.toCBORBytes(plutusData)
        expect(Array.from(encoded), `Failed at sample index ${entry.index}`).toEqual(entry.cborBytes)
      })
    })

    it("should decode CBOR hex to lists consistently", () => {
      const testCases = getTestCases("list", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORHex(entry.cborHex)
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should decode CBOR bytes to lists consistently", () => {
      const testCases = getTestCases("list", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORBytes(new Uint8Array(entry.cborBytes))
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should maintain round-trip consistency", () => {
      const testCases = getTestCases("list", "roundTrip")

      testCases.forEach((entry) => {
        if (!isListSample(entry.sample)) {
          throw new Error(`Invalid list sample at index ${entry.index}`)
        }
        const plutusDataList = entry.sample.list.map(reconstructPlutusData)
        const plutusData = Data.list(plutusDataList)
        const encoded = Data.toCBORHex(plutusData)
        const decoded = Data.fromCBORHex(encoded)

        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })
  })

  describe("Map Golden Tests", () => {
    it("should encode maps to CBOR hex consistently", () => {
      const testCases = getTestCases("map", "encoding")

      testCases.forEach((entry) => {
        if (!isMapSample(entry.sample)) {
          throw new Error(`Invalid map sample at index ${entry.index}`)
        }
        const plutusDataEntries = entry.sample.entries.map(
          (entryObj: { key: unknown; value: unknown }) =>
            [reconstructPlutusData(entryObj.key), reconstructPlutusData(entryObj.value)] as [Data.Data, Data.Data]
        )
        const plutusData = Data.map(plutusDataEntries)
        const encoded = Data.toCBORHex(plutusData)
        expect(encoded, `Failed at sample index ${entry.index}`).toBe(entry.cborHex)
      })
    })

    it("should encode maps to CBOR bytes consistently", () => {
      const testCases = getTestCases("map", "encoding")

      testCases.forEach((entry) => {
        if (!isMapSample(entry.sample)) {
          throw new Error(`Invalid map sample at index ${entry.index}`)
        }
        const plutusDataEntries = entry.sample.entries.map(
          (entryObj: { key: unknown; value: unknown }) =>
            [reconstructPlutusData(entryObj.key), reconstructPlutusData(entryObj.value)] as [Data.Data, Data.Data]
        )
        const plutusData = Data.map(plutusDataEntries)
        const encoded = Data.toCBORBytes(plutusData)
        expect(Array.from(encoded), `Failed at sample index ${entry.index}`).toEqual(entry.cborBytes)
      })
    })

    it("should decode CBOR hex to maps consistently", () => {
      const testCases = getTestCases("map", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORHex(entry.cborHex)
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should decode CBOR bytes to maps consistently", () => {
      const testCases = getTestCases("map", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORBytes(new Uint8Array(entry.cborBytes))
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should maintain round-trip consistency", () => {
      const testCases = getTestCases("map", "roundTrip")

      testCases.forEach((entry) => {
        if (!isMapSample(entry.sample)) {
          throw new Error(`Invalid map sample at index ${entry.index}`)
        }
        const plutusDataEntries = entry.sample.entries.map(
          (entryObj: { key: unknown; value: unknown }) =>
            [reconstructPlutusData(entryObj.key), reconstructPlutusData(entryObj.value)] as [Data.Data, Data.Data]
        )
        const plutusData = Data.map(plutusDataEntries)
        const encoded = Data.toCBORHex(plutusData)
        const decoded = Data.fromCBORHex(encoded)

        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })
  })

  describe("Constr Golden Tests", () => {
    it("should encode constructors to CBOR hex consistently", () => {
      const testCases = getTestCases("constr", "encoding")

      testCases.forEach((entry) => {
        if (!isConstrSample(entry.sample)) {
          throw new Error(`Invalid constructor sample at index ${entry.index}`)
        }
        const plutusDataFields = entry.sample.fields.map(reconstructPlutusData)
        const plutusData = Data.constr(BigInt(entry.sample.index), plutusDataFields)
        const encoded = Data.toCBORHex(plutusData)
        expect(encoded, `Failed at sample index ${entry.index}`).toBe(entry.cborHex)
      })
    })

    it("should encode constructors to CBOR bytes consistently", () => {
      const testCases = getTestCases("constr", "encoding")

      testCases.forEach((entry) => {
        if (!isConstrSample(entry.sample)) {
          throw new Error(`Invalid constructor sample at index ${entry.index}`)
        }
        const plutusDataFields = entry.sample.fields.map(reconstructPlutusData)
        const plutusData = Data.constr(BigInt(entry.sample.index), plutusDataFields)
        const encoded = Data.toCBORBytes(plutusData)
        expect(Array.from(encoded), `Failed at sample index ${entry.index}`).toEqual(entry.cborBytes)
      })
    })

    it("should decode CBOR hex to constructors consistently", () => {
      const testCases = getTestCases("constr", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORHex(entry.cborHex)
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should decode CBOR bytes to constructors consistently", () => {
      const testCases = getTestCases("constr", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORBytes(new Uint8Array(entry.cborBytes))
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should maintain round-trip consistency", () => {
      const testCases = getTestCases("constr", "roundTrip")

      testCases.forEach((entry) => {
        if (!isConstrSample(entry.sample)) {
          throw new Error(`Invalid constructor sample at index ${entry.index}`)
        }
        const plutusDataFields = entry.sample.fields.map(reconstructPlutusData)
        const plutusData = Data.constr(BigInt(entry.sample.index), plutusDataFields)
        const encoded = Data.toCBORHex(plutusData)
        const decoded = Data.fromCBORHex(encoded)

        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })
  })

  describe("Data Golden Tests", () => {
    it("should encode complex data structures to CBOR hex consistently", () => {
      const testCases = getTestCases("data", "encoding")

      testCases.forEach((entry) => {
        const plutusData = reconstructPlutusData(entry.sample)
        const encoded = Data.toCBORHex(plutusData)
        expect(encoded, `Failed at sample index ${entry.index}`).toBe(entry.cborHex)
      })
    })

    it("should encode complex data structures to CBOR bytes consistently", () => {
      const testCases = getTestCases("data", "encoding")

      testCases.forEach((entry) => {
        const plutusData = reconstructPlutusData(entry.sample)
        const encoded = Data.toCBORBytes(plutusData)
        expect(Array.from(encoded), `Failed at sample index ${entry.index}`).toEqual(entry.cborBytes)
      })
    })

    it("should decode CBOR hex to complex data structures consistently", () => {
      const testCases = getTestCases("data", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORHex(entry.cborHex)
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should decode CBOR bytes to complex data structures consistently", () => {
      const testCases = getTestCases("data", "decoding")

      testCases.forEach((entry) => {
        const decoded = Data.fromCBORBytes(new Uint8Array(entry.cborBytes))
        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })

    it("should maintain round-trip consistency", () => {
      const testCases = getTestCases("data", "roundTrip")

      testCases.forEach((entry) => {
        const plutusData = reconstructPlutusData(entry.sample)
        const encoded = Data.toCBORHex(plutusData)
        const decoded = Data.fromCBORHex(encoded)

        expect(normalizeDecodedData(decoded), `Failed at sample index ${entry.index}`).toEqual(entry.sample)
      })
    })
  })
})

/**
 * Reconstruct PlutusData from JSON representation stored in golden files
 */
const reconstructPlutusData = (sample: unknown): Data.Data => {
  const typedSample = sample as { _tag: string; [key: string]: unknown }

  switch (typedSample._tag) {
    case "Integer": {
      // Handle BigInt structure: { __type: "bigint", value: "123..." }
      const integerValue =
        typeof typedSample.integer === "bigint"
          ? typedSample.integer
          : BigInt((typedSample.integer as { value: string }).value)
      return Data.int(integerValue)
    }
    case "ByteArray": // Golden files use "ByteArray"
      return Data.bytearray(typedSample.bytearray as string)
    case "List":
      return Data.list((typedSample.list as Array<unknown>).map(reconstructPlutusData))
    case "Map":
      return Data.map(
        (typedSample.entries as Array<{ key: unknown; value: unknown }>).map((entry) => [
          reconstructPlutusData(entry.key),
          reconstructPlutusData(entry.value)
        ])
      )
    case "Constr":
      return Data.constr(
        BigInt(typedSample.index as number),
        (typedSample.fields as Array<unknown>).map(reconstructPlutusData)
      )
    default:
      throw new Error(`Unknown PlutusData type: ${typedSample._tag}`)
  }
}

/**
 * Normalize decoded PlutusData to match golden file format for comparison
 */
const normalizeDecodedData = (data: unknown): unknown => {
  // Handle primitives
  if (typeof data === "bigint") {
    return {
      _tag: "Integer",
      integer: data
    }
  }

  if (typeof data === "string") {
    return {
      _tag: "ByteArray",
      bytearray: data
    }
  }

  if (data === null || data === undefined) {
    return data
  }

  // Handle arrays (Lists in new Data.ts)
  if (Array.isArray(data)) {
    return {
      _tag: "List",
      list: data.map(normalizeDecodedData)
    }
  }

  // Handle Maps
  if (data instanceof Map) {
    const entries: Array<{ key: unknown; value: unknown }> = []
    for (const [key, value] of data.entries()) {
      entries.push({
        key: normalizeDecodedData(key),
        value: normalizeDecodedData(value)
      })
    }
    return {
      _tag: "Map",
      entries
    }
  }

  // Handle Constr objects (plain objects with index and fields)
  if (typeof data === "object" && data !== null && "index" in data && "fields" in data) {
    const constrData = data as { index: unknown; fields: Array<unknown> }
    return {
      _tag: "Constr",
      index: constrData.index,
      fields: constrData.fields.map(normalizeDecodedData)
    }
  }

  // Handle already normalized objects (legacy format)
  if (typeof data === "object" && data !== null && "_tag" in data) {
    const taggedData = data as { _tag: string; [key: string]: unknown }
    const normalized = { ...taggedData }

    // Normalize tag names to match golden files
    if (normalized._tag === "BytesArray") {
      normalized._tag = "ByteArray"
    }

    // Recursively normalize nested structures
    if (normalized.list && Array.isArray(normalized.list)) {
      normalized.list = normalized.list.map(normalizeDecodedData)
    }

    if (normalized.entries && Array.isArray(normalized.entries)) {
      normalized.entries = normalized.entries.map((entry: unknown) => {
        // Handle both array format [key, value] and object format {key, value}
        if (Array.isArray(entry) && entry.length === 2) {
          return {
            key: normalizeDecodedData(entry[0]),
            value: normalizeDecodedData(entry[1])
          }
        } else if (entry && typeof entry === "object" && "key" in entry && "value" in entry) {
          const entryObj = entry as { key: unknown; value: unknown }
          return {
            key: normalizeDecodedData(entryObj.key),
            value: normalizeDecodedData(entryObj.value)
          }
        }
        return entry
      })
    }

    if (normalized.fields && Array.isArray(normalized.fields)) {
      normalized.fields = normalized.fields.map(normalizeDecodedData)
    }

    return normalized
  }

  // Fallback for other objects
  return data
}
