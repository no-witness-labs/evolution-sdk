import { describe, expect, it } from "@effect/vitest"

import * as Data from "../src/Data.js"

const Codec = Data.Codec()
const CodecCanonical = Data.Codec({
  options: {
    mode: "canonical"
  }
})

describe("Data Module Tests", () => {
  describe("Basic Types", () => {
    describe("PlutusBytes", () => {
      const validHexCases = ["deadbeef", "cafe0123", "abcdef0123456789", "00", "ff"]

      it.each(validHexCases)("should create valid Bytes: %s", (input) => {
        expect(Data.isBytes(input)).toBe(true)
      })

      const invalidHexCases = ["not-hex", "xyz", "123g", "deadbeef ", " deadbeef", "0x123456"]

      it.each(invalidHexCases)("should fail schema validation on invalid hex string: %s", (input) => {
        expect(Data.isBytes(input)).toBe(false)
      })

      it("should validate PlutusBytes with schema", () => {
        const bytes = "deadbeef"
        expect(Data.isBytes(bytes)).toBe(true)
      })
    })

    describe("Plutus Int", () => {
      const integerCases = [
        0n,
        1n,
        -1n,
        42n,
        -42n,
        2n ** 63n - 1n,
        -(2n ** 63n),
        2n ** 64n,
        -(2n ** 64n),
        123456789123456789n,
        -123456789123456789n
      ]

      it.each(integerCases)("should create valid Plutus Int: %s", (input) => {
        expect(Data.isInt(input)).toBe(true)
      })

      it("should fail validation with non-bigint value", () => {
        const invalidInt = "not-a-bigint"
        expect(Data.isInt(invalidInt)).toBe(false)
      })

      it("should validate PlutusBigInt with schema", () => {
        const integer = 42n
        expect(Data.isInt(integer)).toBe(true)
      })
    })

    describe("Plutus List", () => {
      it("should create a valid empty list", () => {
        const list: Data.List = []
        expect(list).toEqual([])
        expect(Data.isList(list)).toBe(true)
      })

      it("should create a valid list with elements", () => {
        const list = [42n, "deadbeef"]
        expect(list).toHaveLength(2)
        expect(Data.isList(list)).toBe(true)
      })

      it("should validate Plutus List with schema", () => {
        const list = [42n, "cafe"]
        expect(Data.isList(list)).toBe(true)
      })
    })

    describe("Plutus Map", () => {
      it("should create a valid empty map", () => {
        const map = Data.map([])
        expect((map as Data.Map).size).toBe(0)
        expect(Data.isMap(map)).toBe(true)
      })

      it("should create a valid map with entries", () => {
        const map = Data.map([
          ["cafe", 42n],
          [99n, "deadbeef"]
        ])
        expect((map as Data.Map).size).toBe(2)
        expect(Data.isMap(map)).toBe(true)
      })

      it("should validate Plutus Map with schema", () => {
        const map = Data.map([[1n, 2n]])
        expect(Data.isMap(map)).toBe(true)
      })
    })

    describe("Constr", () => {
      it("should create a valid constructor with no fields", () => {
        const constr = Data.constr(0n, [])
        expect(constr.index).toBe(0n)
        expect(constr.fields).toEqual([])
        expect(Data.isConstr(constr)).toBe(true)
      })

      it("should create a valid constructor with fields", () => {
        const constr = Data.constr(2n, [42n, "deadbeef", [99n]])
        expect(constr.index).toBe(2n)
        expect(constr.fields).toHaveLength(3)
        expect(Data.isConstr(constr)).toBe(true)
      })

      it("should validate Constr with schema", () => {
        const constr = Data.constr(5n, [42n, "cafe"])
        expect(Data.isConstr(constr)).toBe(true)
      })

      it("should handle large constructor indices", () => {
        const largeIndex = 2n ** 32n + 1n // Well beyond the direct tag range
        const constr = Data.constr(largeIndex, [1n])
        expect(constr.index).toBe(largeIndex)
        expect(Data.isConstr(constr)).toBe(true)
      })
    })
  })

  describe("CBOR Encoding/Decoding", () => {
    const testCases = [
      {
        name: "empty constructor",
        value: Data.constr(0n, []),
        expectedHex: "d87980"
      },
      {
        name: "constructor with fields",
        value: Data.constr(1n, [42n, "cafe"]),
        expectedHex: "d87a9f182a42cafeff"
      },
      {
        name: "large constructor index",
        value: Data.constr(999999n, [42n]),
        expectedHex: "d8669f1a000f423f9f182affff"
      },
      {
        name: "empty list",
        value: [],
        expectedHex: "80"
      },
      {
        name: "list with mixed elements",
        value: [1n, "deadbeef", []],
        expectedHex: "9f0144deadbeef80ff"
      },
      {
        name: "empty map",
        value: Data.map([]),
        expectedHex: "a0"
      },
      {
        name: "map with entries",
        value: Data.map([[1n, "cafe"]]),
        expectedHex: "bf0142cafeff"
      },
      {
        name: "small int",
        value: 42n,
        expectedHex: "182a"
      },
      {
        name: "negative int",
        value: -42n,
        expectedHex: "3829"
      },
      {
        name: "large positive int with value",
        value: 11375342928504387279n,
        expectedHex: "1b9ddd561fd3c176cf"
      },
      {
        name: "bytes",
        value: "deadbeef",
        expectedHex: "44deadbeef"
      },
      {
        name: "empty bytes",
        value: "",
        expectedHex: "40"
      }
    ]

    describe("Standard Encoding/Decoding", () => {
      describe("Hex Encoding/Decoding", () => {
        it.each(testCases)("should round-trip $name via hex encoding", ({ expectedHex, value }) => {
          const encoded = Codec.Encode.cborHex(value)
          const decoded = Codec.Decode.cborHex(encoded)
          expect(decoded).toEqual(value)
          expect(encoded).toBe(expectedHex)
        })
      })

      describe("Bytes Encoding/Decoding", () => {
        it.each(testCases)("should round-trip $name via bytes encoding", ({ value }) => {
          const encoded = Codec.Encode.cborBytes(value)
          const decoded = Codec.Decode.cborBytes(encoded)
          expect(decoded).toEqual(value)
        })
      })
    })
  })

  describe("Utility Functions", () => {
    describe("matchConstr", () => {
      it("should match specific constructor indices", () => {
        const constr = Data.constr(1n, [42n])
        const result = Data.matchConstr(constr, {
          1: (fields) => `Found index 1 with ${fields.length} fields`,
          2: (fields) => `Found index 2 with ${fields.length} fields`,
          _: (index, fields) => `Default case: index ${index} with ${fields.length} fields`
        })
        expect(result).toBe("Found index 1 with 1 fields")
      })

      it("should use default case for non-matched indices", () => {
        const constr = Data.constr(99n, [42n])
        const result = Data.matchConstr(constr, {
          1: (fields) => `Found index 1 with ${fields.length} fields`,
          2: (fields) => `Found index 2 with ${fields.length} fields`,
          _: (index, fields) => `Default case: index ${index} with ${fields.length} fields`
        })
        expect(result).toBe("Default case: index 99 with 1 fields")
      })
    })

    describe("matchPlutusData", () => {
      it("should match Plutus Map type", () => {
        const map = Data.map([])
        const result = Data.matchData(map, {
          Map: (entries) => `Map with ${entries.length} entries`,
          List: (items) => `List with ${items.length} items`,
          Int: (value) => `BigInt: ${value}`,
          Bytes: (bytes) => `Bytes: ${bytes}`,
          Constr: (constr) => `Constructor ${constr.index} with ${constr.fields.length} fields`
        })
        expect(result).toBe("Map with 0 entries")
      })

      it("should match Plutus List type", () => {
        const list = [1n]
        const result = Data.matchData(list, {
          Map: (entries) => `Map with ${entries.length} entries`,
          List: (items) => `List with ${items.length} items`,
          Int: (value) => `BigInt: ${value}`,
          Bytes: (bytes) => `Bytes: ${bytes}`,
          Constr: (constr) => `Constructor ${constr.index} with ${constr.fields.length} fields`
        })
        expect(result).toBe("List with 1 items")
      })

      it("should match Plutus Int type", () => {
        const int = 42n
        const result = Data.matchData(int, {
          Map: (entries) => `Map with ${entries.length} entries`,
          List: (items) => `List with ${items.length} items`,
          Int: (value) => `BigInt: ${value}`,
          Bytes: (bytes) => `Bytes: ${bytes}`,
          Constr: (constr) => `Constructor ${constr.index} with ${constr.fields.length} fields`
        })
        expect(result).toBe("BigInt: 42")
      })

      it("should match Plutus Bytes type", () => {
        const bytes = "cafe"
        const result = Data.matchData(bytes, {
          Map: (entries) => `Map with ${entries.length} entries`,
          List: (items) => `List with ${items.length} items`,
          Int: (value) => `BigInt: ${value}`,
          Bytes: (bytes) => `Bytes: ${bytes}`,
          Constr: (constr) => `Constructor ${constr.index} with ${constr.fields.length} fields`
        })
        expect(result).toBe("Bytes: cafe")
      })

      it("should match Constr type", () => {
        const constr = Data.constr(3n, [])
        const result = Data.matchData(constr, {
          Map: (entries) => `Map with ${entries.length} entries`,
          List: (items) => `List with ${items.length} items`,
          Int: (value) => `BigInt: ${value}`,
          Bytes: (bytes) => `Bytes: ${bytes}`,
          Constr: (constr) => `Constructor ${constr.index} with ${constr.fields.length} fields`
        })
        expect(result).toBe("Constructor 3 with 0 fields")
      })
    })
  })

  describe("Complex Structures", () => {
    it("should handle nested structures", () => {
      // Create a complex nested structure
      const complex = Data.constr(0n, [
        [1n, 2n, "cafe"],
        Data.map([
          [42n, ["deadbeef"]],
          ["deadbeef", Data.constr(1n, [-999n])]
        ]),
        Data.constr(7n, [[], Data.map([])])
      ])

      const encoded = Codec.Encode.cborHex(complex)
      const decoded = Codec.Decode.cborHex(encoded)
      expect(decoded).toEqual(complex)
    })
  })

  describe("Integer Boundary Testing", () => {
    const boundaryTestCases = [
      { name: "Zero", value: 0n },
      { name: "Small positive (23)", value: 23n },
      { name: "Small positive (24)", value: 24n },
      { name: "Small positive (255)", value: 255n },
      { name: "Small positive (256)", value: 256n },
      { name: "Medium positive (65535)", value: 65535n },
      { name: "Medium positive (65536)", value: 65536n },
      { name: "Large positive (4294967295)", value: 4294967295n },
      { name: "Large positive (4294967296)", value: 4294967296n },
      { name: "64-bit boundary (2^63 - 1)", value: 9223372036854775807n },
      { name: "64-bit boundary (2^63)", value: 9223372036854775808n },
      { name: "64-bit max (2^64 - 1)", value: 18446744073709551615n },
      { name: "Bignum threshold (2^64)", value: 18446744073709551616n },
      { name: "Large bignum (2^64 + 1)", value: 18446744073709551617n },
      {
        name: "Very large bignum (2^128)",
        value: 340282366920938463463374607431768211456n
      },
      { name: "Small negative (-1)", value: -1n },
      { name: "Small negative (-24)", value: -24n },
      { name: "Small negative (-25)", value: -25n },
      { name: "Medium negative (-256)", value: -256n },
      { name: "Medium negative (-257)", value: -257n },
      { name: "Large negative (-4294967296)", value: -4294967296n },
      {
        name: "64-bit negative boundary (-2^63)",
        value: -9223372036854775808n
      },
      {
        name: "64-bit negative max (-2^64 + 1)",
        value: -18446744073709551615n
      },
      {
        name: "Negative bignum threshold (-2^64)",
        value: -18446744073709551616n
      },
      {
        name: "Large negative bignum (-2^64 - 1)",
        value: -18446744073709551617n
      },
      {
        name: "Very large negative bignum (-2^128)",
        value: -340282366920938463463374607431768211456n
      }
    ]

    it.each(boundaryTestCases)("should handle $name correctly", ({ value }) => {
      const plutusData = value
      const encoded = Codec.Encode.cborBytes(plutusData)
      const decoded = Codec.Decode.cborBytes(encoded)

      expect(decoded).toEqual(plutusData)
      expect(decoded as Data.Int).toBe(value)
    })
  })

  describe("CBOR Encoding Format Validation", () => {
    it("should use correct CBOR major types for different integer ranges", () => {
      const testCases = [
        { value: 23n, expectedMajorType: 0, description: "direct encoding" },
        { value: 255n, expectedMajorType: 0, description: "1-byte unsigned" },
        { value: 65535n, expectedMajorType: 0, description: "2-byte unsigned" },
        {
          value: 4294967295n,
          expectedMajorType: 0,
          description: "4-byte unsigned"
        },
        {
          value: 18446744073709551615n,
          expectedMajorType: 0,
          description: "8-byte unsigned"
        },
        {
          value: 18446744073709551616n,
          expectedMajorType: 6,
          description: "positive bignum tag"
        },
        { value: -1n, expectedMajorType: 1, description: "direct negative" },
        { value: -24n, expectedMajorType: 1, description: "1-byte negative" },
        { value: -256n, expectedMajorType: 1, description: "2-byte negative" },
        {
          value: -18446744073709551615n,
          expectedMajorType: 1,
          description: "8-byte negative"
        },
        {
          value: -18446744073709551617n,
          expectedMajorType: 6,
          description: "negative bignum tag"
        }
      ]

      testCases.forEach(({ expectedMajorType, value }) => {
        const plutusData = value
        const encoded = Codec.Encode.cborBytes(plutusData)
        const firstByte = encoded[0]
        const majorType = firstByte >> 5

        expect(majorType).toBe(expectedMajorType)

        // Additional validation for bignum tags
        if (expectedMajorType === 6) {
          const additionalInfo = firstByte & 0x1f
          if (value > 0n) {
            expect(additionalInfo).toBe(2) // Tag 2 for positive bignum
          } else {
            expect(additionalInfo).toBe(3) // Tag 3 for negative bignum
          }
        }
      })
    })

    it("should handle empty collections correctly", () => {
      const emptyList: Data.List = []
      const emptyMap = Data.map([])
      const emptyConstr = Data.constr(0n, [])

      // Test that empty collections encode/decode correctly
      ;[emptyList, emptyMap, emptyConstr].forEach((data) => {
        const encoded = Codec.Encode.cborBytes(data)
        const decoded = Codec.Decode.cborBytes(encoded)
        expect(decoded).toEqual(data)
      })
    })
  })

  describe("Large Data Structure Edge Cases", () => {
    it("should handle large lists", () => {
      // Create a list with many elements
      const largeList = Array.from({ length: 1000 }, (_, i) => BigInt(i))

      const encoded = Codec.Encode.cborBytes(largeList)
      const decoded = Codec.Decode.cborBytes(encoded)
      expect(decoded).toEqual(largeList)
      expect(decoded as Data.List).toHaveLength(1000)
    })

    it("should handle large maps", () => {
      // Create a map with many entries
      const entries = Array.from(
        { length: 100 },
        (_, i) => [BigInt(i), `${i.toString(16).padStart(4, "0")}`] as [Data.Int, Data.ByteArray]
      )
      const largeMap = Data.map(entries)

      const encoded = Codec.Encode.cborBytes(largeMap)
      const decoded = Codec.Decode.cborBytes(encoded)
      expect(decoded).toEqual(largeMap)
      expect((decoded as Data.Map).size).toBe(100)
    })

    it("should handle constructors with many fields", () => {
      // Create a constructor with many fields
      const manyFields = Array.from({ length: 50 }, (_, i) => BigInt(i))
      const constr = Data.constr(42n, manyFields)

      const encoded = Codec.Encode.cborBytes(constr)
      const decoded = Codec.Decode.cborBytes(encoded)
      expect(decoded).toEqual(constr)
      expect((decoded as Data.Constr).fields).toHaveLength(50)
    })
  })

  describe("Error Handling and Edge Cases", () => {
    describe("Invalid CBOR Input", () => {
      const invalidInputs = [
        { name: "non-hex string", input: "not-valid-cbor", method: "cborHex" },
        { name: "partial hex string", input: "deadbee", method: "cborHex" },
        { name: "truncated CBOR", input: "d8", method: "cborHex" },
        { name: "invalid CBOR tag", input: "d8ff", method: "cborHex" },
        { name: "incomplete tagged value", input: "d87900", method: "cborHex" }
      ]

      it.each(invalidInputs)("should handle $name gracefully", ({ input, method }) => {
        expect(() => {
          if (method === "cborHex") {
            Codec.Decode.cborHex(input)
          }
        }).toThrow()
      })
    })

    describe("Malformed PlutusData Objects", () => {
      it("should handle objects with wrong _tag values", () => {
        const malformedObjects = [
          "test",
          10,
          [1, 2n, 3],
          new Map([["key", "value"]]),
          { index: -1n, fields: [] },
          "invalidhex!"
        ] as const

        malformedObjects.forEach((obj) => {
          expect(Data.isInt(obj)).toBe(false)
          expect(Data.isList(obj)).toBe(false)
          expect(Data.isMap(obj)).toBe(false)
          expect(Data.isConstr(obj)).toBe(false)
          expect(Data.isBytes(obj)).toBe(false)
        })
      })
    })

    describe("Boundary Value Testing", () => {
      it("should handle bytearray edge cases", () => {
        const edgeCases = [
          { name: "empty string", value: "" },
          { name: "single zero byte", value: "00" },
          { name: "single max byte", value: "ff" },
          { name: "lowercase hex", value: "deadbeef" },
          { name: "uppercase hex", value: "DEADBEEF" }
        ]

        edgeCases.forEach(({ value }) => {
          expect(() => {
            const bytes = Data.bytearray(value)
            const encoded = Codec.Encode.cborBytes(bytes)
            const decoded = Codec.Decode.cborBytes(encoded)
            // Note: hex strings are normalized to lowercase during processing
            if (Data.isBytes(decoded)) {
              expect(decoded).toBe(value.toLowerCase())
            }
          }).not.toThrow()
        })
      })

      it("should handle invalid bytearray inputs", () => {
        const invalidCases = [
          "deadbee", // Odd length
          "deadbeeg", // Invalid hex character
          "0x123456", // Hex prefix not allowed
          " deadbeef", // Leading whitespace
          "deadbeef " // Trailing whitespace
        ]

        invalidCases.forEach((invalidHex) => {
          expect(Data.isBytes(invalidHex)).toBe(false)
        })
      })
    })
  })

  describe("Type Safety and Validation", () => {
    describe("Type Guards", () => {
      it("should correctly identify PlutusData types", () => {
        const testCases = [
          { data: 42n, expectedType: "PlutusBigInt" },
          { data: "deadbeef", expectedType: "PlutusBytes" },
          { data: [], expectedType: "PlutusList" },
          { data: Data.map([]), expectedType: "PlutusMap" },
          { data: Data.constr(0n, []), expectedType: "Constr" }
        ]

        testCases.forEach(({ data, expectedType }) => {
          switch (expectedType) {
            case "PlutusBigInt":
              expect(Data.isInt(data)).toBe(true)
              expect(Data.isBytes(data)).toBe(false)
              expect(Data.isList(data)).toBe(false)
              expect(Data.isMap(data)).toBe(false)
              expect(Data.isConstr(data)).toBe(false)
              break
            case "PlutusBytes":
              expect(Data.isInt(data)).toBe(false)
              expect(Data.isBytes(data)).toBe(true)
              expect(Data.isList(data)).toBe(false)
              expect(Data.isMap(data)).toBe(false)
              expect(Data.isConstr(data)).toBe(false)
              break
            case "PlutusList":
              expect(Data.isInt(data)).toBe(false)
              expect(Data.isBytes(data)).toBe(false)
              expect(Data.isList(data)).toBe(true)
              expect(Data.isMap(data)).toBe(false)
              expect(Data.isConstr(data)).toBe(false)
              break
            case "PlutusMap":
              expect(Data.isInt(data)).toBe(false)
              expect(Data.isBytes(data)).toBe(false)
              expect(Data.isList(data)).toBe(false)
              expect(Data.isMap(data)).toBe(true)
              expect(Data.isConstr(data)).toBe(false)
              break
            case "Constr":
              expect(Data.isInt(data)).toBe(false)
              expect(Data.isBytes(data)).toBe(false)
              expect(Data.isList(data)).toBe(false)
              expect(Data.isMap(data)).toBe(false)
              expect(Data.isConstr(data)).toBe(true)
              break
          }
        })
      })
    })

    describe("Schema Validation", () => {
      it("should validate all PlutusData types with their schemas", () => {
        expect(Data.isInt(42n)).toBe(true)
        expect(Data.isBytes("deadbeef")).toBe(true)
        expect(Data.isList([1n])).toBe(true)
        expect(Data.isMap(Data.map([[1n, 2n]]))).toBe(true)
        expect(Data.isConstr(Data.constr(0n, [42n]))).toBe(true)
      })
    })
  })

  describe("Edge Cases and Robustness", () => {
    describe("Deeply Nested Structures", () => {
      it("should handle moderate nesting levels", () => {
        // Create a moderately nested structure (20 levels)
        let nested: any = 42n
        for (let i = 0; i < 20; i++) {
          nested = [nested]
        }

        expect(() => {
          const encoded = Codec.Encode.cborBytes(nested)
          const decoded = Codec.Decode.cborBytes(encoded)
          expect(decoded).toEqual(nested)
        }).not.toThrow()
      })

      it("should handle mixed nested structures", () => {
        // Create a complex mixed structure with valid hex strings
        const complex = Data.constr(0n, [
          [Data.map([[1n, "cafe"]]), Data.constr(1n, [-999n])],
          Data.map([
            [
              "deadbeef", // Valid hex string
              [1n, 2n, 3n]
            ],
            [42n, Data.constr(2n, [])]
          ])
        ])

        const encoded = Codec.Encode.cborBytes(complex)
        const decoded = Codec.Decode.cborBytes(encoded)
        expect(decoded).toEqual(complex)
      })
    })

    describe("Data Structure Consistency", () => {
      it("should maintain referential integrity", () => {
        // Verify that separate instances with same data are equal
        const data1 = Data.constr(42n, [123n, "cafe"])
        const data2 = Data.constr(42n, [123n, "cafe"])

        expect(data1).toEqual(data2)

        const encoded1 = Codec.Encode.cborBytes(data1)
        const encoded2 = Codec.Encode.cborBytes(data2)

        expect(encoded1).toEqual(encoded2)
      })

      it("should detect data differences correctly", () => {
        const similar = [
          {
            data1: Data.constr(42n, [123n]),
            data2: Data.constr(43n, [123n]) // Different index
          },
          {
            data1: Data.constr(42n, [123n]),
            data2: Data.constr(42n, [124n]) // Different field
          },
          {
            data1: "deadbeef",
            data2: "deadbeee" // Different hex
          },
          {
            data1: 42n,
            data2: -42n // Different sign
          }
        ]

        similar.forEach(({ data1, data2 }) => {
          expect(data1).not.toEqual(data2)

          const encoded1 = Codec.Encode.cborBytes(data1)
          const encoded2 = Codec.Encode.cborBytes(data2)

          expect(encoded1).not.toEqual(encoded2)
        })
      })
    })
  })

  describe("Constructor Index Edge Cases", () => {
    it("should handle direct tag constructors (0-6)", () => {
      for (let i = 0; i <= 6; i++) {
        const constr = Data.constr(BigInt(i), [42n])
        const encoded = Codec.Encode.cborBytes(constr)
        const decoded = Codec.Decode.cborBytes(encoded)
        expect(decoded).toEqual(constr)

        // Verify CBOR encoding uses direct tags (121-127) with 1-byte encoding
        const firstByte = encoded[0]
        expect(firstByte).toBe(0xd8) // Tag encoding prefix for 1-byte tags
        const tagByte = encoded[1]
        expect(tagByte).toBe(121 + i)
      }
    })

    it("should handle general constructor tag (index >= 7)", () => {
      const testIndices = [7n, 100n, 999999n, 2n ** 32n, 2n ** 64n - 1n]

      testIndices.forEach((index) => {
        const constr = Data.constr(index, [42n])
        const encoded = Codec.Encode.cborBytes(constr)
        const decoded = Codec.Decode.cborBytes(encoded)
        expect(decoded).toEqual(constr)
        expect((decoded as Data.Constr).index).toBe(index)

        const firstByte = encoded[0]

        if (index >= 7n && index <= 127n) {
          // CML compatibility format: tags 1280+ for indices 7-127
          expect(firstByte).toBe(0xd9) // Tag encoding prefix for 2-byte tags
          const tagBytes = (encoded[1] << 8) | encoded[2]
          expect(tagBytes).toBe(1280 + Number(index - 7n))
        } else {
          // General constructor tag (102) for indices >= 128
          expect(firstByte).toBe(0xd8) // Tag encoding prefix for 1-byte tags
          expect(encoded[1]).toBe(102) // General constructor tag
        }
      })
    })
  })

  it("should handle canonical format roundtrip", () => {
    const firstCanonical =
      "d90503828181436ad232a34277931bd5a95fcb2d914b711b431e8fb0e0c31fe71b70cec8a3bf37064e1b785c7997367a91151b6a63f4cd860738d9"
    const decoded = Codec.Decode.cborHex(firstCanonical)

    const encoded = CodecCanonical.Encode.cborHex(decoded)
    expect(encoded).toBe(firstCanonical)
    expect(Codec.Decode.cborHex(encoded)).toEqual(decoded)

    const secondCanonical =
      "d9050883a4410742b6491b81df71d083fb9aac1b5f7385f841d1edec4a70f3d8f8803183c150334688472079a8ce4b0f7f249c0a9f4f829d2e4f1bc0556aa7b700508606a14365b7f71b4b62f0e2fbb95d6d"
    const secondDecoded = Codec.Decode.cborHex(secondCanonical)
    const secondEncoded = CodecCanonical.Encode.cborHex(secondDecoded)
    expect(secondEncoded).toBe(secondCanonical)
    expect(Codec.Decode.cborHex(secondEncoded)).toEqual(secondDecoded)
  })

  it("should handle unsorted map and return sorted canonical format", () => {
    const unsorted = Data.constr(15n, [
      Data.map([
        [9358323691080620716n, 6877988357227539948n],
        ["70f3d8f8803183c15033", "88472079a8ce"],
        ["0f7f249c0a9f4f829d2e4f", 13859100696864903302n],
        ["07", "b649"]
      ]),
      6n,
      Data.map([["65b7f7", 5432168958238743917n]])
    ])

    const encoded = CodecCanonical.Encode.cborHex(unsorted)
    const expectedCBORHex =
      "d9050883a4410742b6491b81df71d083fb9aac1b5f7385f841d1edec4a70f3d8f8803183c150334688472079a8ce4b0f7f249c0a9f4f829d2e4f1bc0556aa7b700508606a14365b7f71b4b62f0e2fbb95d6d"
    expect(encoded).toBe(expectedCBORHex)
  })
})
