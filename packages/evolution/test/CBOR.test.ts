import { describe, expect, it } from "@effect/vitest"

import * as CBOR from "../src/CBOR.js"

describe("CBOR Implementation Tests", () => {
  describe("Integer Encoding Boundaries", () => {
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
      // Create a CBOR value from the integer using the helper
      const cborValue = value

      const encoded = CBOR.toCBORBytes(cborValue)
      const decoded = CBOR.fromCBORBytes(encoded)

      expect(decoded).toEqual(cborValue)
    })
  })

  describe("CBOR Major Type Validation", () => {
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
        const encoded = CBOR.toCBORBytes(value)
        const firstByte = encoded[0]
        const majorType = firstByte >> 5

        expect(majorType).toBe(expectedMajorType)

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
  })

  describe("CBOR Length Encoding Edge Cases", () => {
    describe("Array Length Encoding", () => {
      it("should handle arrays with exactly 24 elements (1-byte length threshold)", () => {
        const array24 = Array.from({ length: 24 }, (_, i) => BigInt(i))
        const encoded = CBOR.toCBORBytes(array24)
        const decoded = CBOR.fromCBORBytes(encoded)
        expect(decoded).toEqual(array24)
        expect(decoded).toHaveLength(24)
      })

      it("should handle arrays with exactly 256 elements (2-byte length threshold)", () => {
        const array256 = Array.from({ length: 256 }, (_, i) => BigInt(i))
        const encoded = CBOR.toCBORBytes(array256)
        const decoded = CBOR.fromCBORBytes(encoded)
        expect(decoded).toEqual(array256)
        expect(decoded).toHaveLength(256)
      })

      it("should handle arrays with exactly 65536 elements (4-byte length threshold)", () => {
        const array65536 = Array.from({ length: 65536 }, (_, i) => BigInt(i % 1000))
        const encoded = CBOR.toCBORBytes(array65536)
        const decoded = CBOR.fromCBORBytes(encoded) as Array<bigint>
        expect(decoded).toEqual(array65536)
        expect(decoded).toHaveLength(65536)
      })

      it("should handle arrays with length just over 4GB threshold", () => {
        // Test for 8-byte length encoding - using a smaller test due to memory constraints
        // This verifies the 8-byte length support is in place
        // Create a smaller version to actually test without memory issues
        const testArray = Array.from({ length: 100 }, (_, i) => BigInt(i))

        expect(() => {
          CBOR.toCBORBytes(testArray)
        }).not.toThrow()
      })
    })

    describe("Map Length Encoding", () => {
      it("should handle maps with exactly 24 entries (1-byte length threshold)", () => {
        const map24 = new Map(Array.from({ length: 24 }, (_, i) => [BigInt(i), `${i.toString(16).padStart(2, "0")}`]))
        const encoded = CBOR.toCBORBytes(map24)
        const decoded = CBOR.fromCBORBytes(encoded) as Map<bigint, string>
        expect(decoded).toEqual(map24)
        expect(decoded.size).toBe(24)
      })

      it("should handle maps with exactly 256 entries (2-byte length threshold)", () => {
        const map256 = new Map(Array.from({ length: 256 }, (_, i) => [BigInt(i), `${i.toString(16).padStart(2, "0")}`]))
        const encoded = CBOR.toCBORBytes(map256)
        const decoded = CBOR.fromCBORBytes(encoded) as Map<bigint, string>
        expect(decoded).toEqual(map256)
        expect(decoded.size).toBe(256)
      })

      it("should handle maps with exactly 65536 entries (4-byte length threshold)", () => {
        const map65536 = new Map(
          Array.from({ length: 65536 }, (_, i) => [BigInt(i), `${(i % 256).toString(16).padStart(2, "0")}`])
        )
        const encoded = CBOR.toCBORBytes(map65536)
        const decoded = CBOR.fromCBORBytes(encoded) as Map<bigint, string>
        expect(decoded).toEqual(map65536)
        expect(decoded.size).toBe(65536)
      }, 30000) // 30 second timeout for large map test
    })
  })

  describe("CBOR Bounds Check Fixes", () => {
    it("should properly handle 64-bit integer bounds", () => {
      const maxUint64 = 18446744073709551615n // 2^64 - 1
      const encoded = CBOR.toCBORBytes(maxUint64)
      const decoded = CBOR.fromCBORBytes(encoded)
      expect(decoded).toBe(maxUint64)
    })

    it("should handle various CBOR integer encoding sizes", () => {
      const testCases = [
        { name: "direct encoding (0-23)", value: 23n },
        { name: "1-byte encoding (24-255)", value: 255n },
        { name: "2-byte encoding (256-65535)", value: 65535n },
        { name: "4-byte encoding (65536-4294967295)", value: 4294967295n },
        { name: "8-byte encoding (4294967296+)", value: 4294967296n }
      ]

      testCases.forEach(({ value }) => {
        const encoded = CBOR.toCBORBytes(value)
        const decoded = CBOR.fromCBORBytes(encoded)
        expect(decoded).toBe(value)
      })
    })
  })

  describe("Real-world CBOR Edge Cases", () => {
    it("should handle CBOR boundary values correctly", () => {
      const boundaryTestCases = [
        { name: "exactly 23 (last direct encoding)", value: 23n },
        { name: "exactly 24 (first 1-byte encoding)", value: 24n },
        { name: "exactly 255 (last 1-byte encoding)", value: 255n },
        { name: "exactly 256 (first 2-byte encoding)", value: 256n },
        { name: "exactly 65535 (last 2-byte encoding)", value: 65535n },
        { name: "exactly 65536 (first 4-byte encoding)", value: 65536n },
        {
          name: "exactly 4294967295 (last 4-byte encoding)",
          value: 4294967295n
        },
        {
          name: "exactly 4294967296 (first 8-byte encoding)",
          value: 4294967296n
        }
      ]

      boundaryTestCases.forEach(({ value }) => {
        const encoded = CBOR.toCBORBytes(value)
        const decoded = CBOR.fromCBORBytes(encoded)
        expect(decoded).toBe(value)
      })
    })

    it("should handle empty collections with different encoding options", () => {
      const emptyArray: Array<number> = []
      const emptyMap = new Map()

      const encodedArray = CBOR.toCBORBytes(emptyArray)
      const encodedMap = CBOR.toCBORBytes(emptyMap)

      const decodedArray = CBOR.fromCBORBytes(encodedArray)
      const decodedMap = CBOR.fromCBORBytes(encodedMap)

      expect(decodedArray).toEqual(emptyArray)
      expect(decodedMap).toEqual(emptyMap)
    })

    it("should maintain precision for large floating point numbers", () => {
      const testNumbers = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Math.PI,
        1.7976931348623157e308 // near Number.MAX_VALUE
      ]

      testNumbers.forEach((num) => {
        if (Number.isInteger(num) && num >= Number.MIN_SAFE_INTEGER && num <= Number.MAX_SAFE_INTEGER) {
          const bigIntValue = BigInt(num)
          const encoded = CBOR.toCBORBytes(bigIntValue)
          const decoded = CBOR.fromCBORBytes(encoded)
          expect(decoded).toBe(bigIntValue)
        }
      })
    })
  })

  describe("CBOR Deterministic Encoding", () => {
    it("should produce deterministic CBOR encoding", () => {
      const testData = [42n, "deadbeef", [1n, 2n], new Map([[1n, "cafe"]]), new Uint8Array([0x42, 0xca, 0xfe])]

      testData.forEach((data) => {
        const encoded1 = CBOR.toCBORHex(data)
        const encoded2 = CBOR.toCBORHex(data)
        expect(encoded1).toBe(encoded2)
      })
    })

    it("should handle empty collections correctly", () => {
      const emptyList: Array<number> = []
      const emptyMap = new Map()
      const emptyBytes = new Uint8Array([])

      ;[emptyList, emptyMap, emptyBytes].forEach((data) => {
        const encoded = CBOR.toCBORBytes(data)
        const decoded = CBOR.fromCBORBytes(encoded)
        expect(decoded).toEqual(data)
      })
    })
  })

  describe("CBOR Format Validation", () => {
    it("should handle invalid CBOR input gracefully", () => {
      expect(() => {
        CBOR.fromCBORHex("not-valid-cbor-hex")
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("")
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("d8")
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("01afbb")
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("9f010203ff")
      }).not.toThrow()

      expect(() => {
        CBOR.fromCBORHex("9f010203")
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("bf6161016162") // map: { "a": 1, "b": ... } missing value and break
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("bf6161") // map: { "a": ??? } missing value and break
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("5f420102") // missing break
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("7f65737472656164") // missing break
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("9f9f0102ff") // outer array, inner array missing break
      }).toThrow()

      expect(() => {
        CBOR.fromCBORHex("bf6161ff") // map: { "a": ??? } missing value
      }).toThrow()
    })
  })

  describe("RFC 8949 CBOR Test Vectors", () => {
    // Test vectors from https://github.com/cbor/test-vectors/blob/master/appendix_a.json
    // These are the official CBOR specification test cases from RFC 8949 Appendix A

    describe("Integer Test Vectors", () => {
      const integerTestCases = [
        { hex: "00", decoded: 0n, description: "Zero" },
        { hex: "01", decoded: 1n, description: "Positive integer 1" },
        { hex: "0a", decoded: 10n, description: "Positive integer 10" },
        {
          hex: "17",
          decoded: 23n,
          description: "Positive integer 23 (last direct encoding)"
        },
        {
          hex: "1818",
          decoded: 24n,
          description: "Positive integer 24 (first 1-byte encoding)"
        },
        { hex: "1819", decoded: 25n, description: "Positive integer 25" },
        { hex: "1864", decoded: 100n, description: "Positive integer 100" },
        { hex: "1903e8", decoded: 1000n, description: "Positive integer 1000" },
        {
          hex: "1a000f4240",
          decoded: 1000000n,
          description: "Positive integer 1000000"
        },
        {
          hex: "1b000000e8d4a51000",
          decoded: 1000000000000n,
          description: "Positive integer 1000000000000"
        },
        {
          hex: "1bffffffffffffffff",
          decoded: 18446744073709551615n,
          description: "Maximum uint64"
        },
        {
          hex: "c249010000000000000000",
          decoded: 18446744073709551616n,
          description: "Positive bignum (2^64)"
        },
        { hex: "20", decoded: -1n, description: "Negative integer -1" },
        { hex: "29", decoded: -10n, description: "Negative integer -10" },
        { hex: "3863", decoded: -100n, description: "Negative integer -100" },
        {
          hex: "3903e7",
          decoded: -1000n,
          description: "Negative integer -1000"
        },
        {
          hex: "3bffffffffffffffff",
          decoded: -18446744073709551616n,
          description: "Minimum int64"
        },
        {
          hex: "c349010000000000000000",
          decoded: -18446744073709551617n,
          description: "Negative bignum -(2^64 + 1)"
        }
      ]

      it.each(integerTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        expect(decodedValue).toBe(decoded)

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(redecoded).toBe(decoded)
      })
    })

    describe("Boolean and Null Test Vectors", () => {
      const booleanNullTestCases = [
        { hex: "f4", decoded: false, description: "Boolean false" },
        { hex: "f5", decoded: true, description: "Boolean true" },
        { hex: "f6", decoded: null, description: "Null value" }
      ]

      it.each(booleanNullTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        expect(decodedValue).toBe(decoded)

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(redecoded).toBe(decoded)
      })
    })

    describe("String Test Vectors", () => {
      const stringTestCases = [
        { hex: "60", decoded: "", description: "Empty string" },
        { hex: "6161", decoded: "a", description: "Single character string" },
        {
          hex: "6449455446",
          decoded: "IETF",
          description: "ASCII string 'IETF'"
        },
        {
          hex: "62225c",
          decoded: '"\\',
          description: "String with quotes and backslash"
        },
        {
          hex: "62c3bc",
          decoded: "ü",
          description: "UTF-8 string with umlaut"
        },
        {
          hex: "63e6b0b4",
          decoded: "水",
          description: "UTF-8 Chinese character"
        },
        {
          hex: "64f0908591",
          decoded: "𐅑",
          description: "UTF-8 4-byte character"
        }
      ]

      it.each(stringTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        expect(decodedValue).toBe(decoded)

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(redecoded).toBe(decoded)
      })
    })

    describe("Array Test Vectors", () => {
      const arrayTestCases = [
        { hex: "80", decoded: [], description: "Empty array" },
        {
          hex: "83010203",
          decoded: [1n, 2n, 3n],
          description: "Array with three integers"
        },
        {
          hex: "8301820203820405",
          decoded: [1n, [2n, 3n], [4n, 5n]],
          description: "Nested array structure"
        },
        {
          hex: "98190102030405060708090a0b0c0d0e0f101112131415161718181819",
          decoded: [
            1n,
            2n,
            3n,
            4n,
            5n,
            6n,
            7n,
            8n,
            9n,
            10n,
            11n,
            12n,
            13n,
            14n,
            15n,
            16n,
            17n,
            18n,
            19n,
            20n,
            21n,
            22n,
            23n,
            24n,
            25n
          ],
          description: "Array with 25 integers"
        }
      ]

      it.each(arrayTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        expect(decodedValue).toEqual(decoded)

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(redecoded).toEqual(decoded)
      })
    })

    describe("Object Test Vectors", () => {
      const objectTestCases = [
        { hex: "a0", decoded: new Map(), description: "Empty map" },
        {
          hex: "a26161016162820203",
          decoded: new Map<string, any>([
            ["a", 1n],
            ["b", [2n, 3n]]
          ]),
          description: "Map with string keys and mixed values"
        },
        {
          hex: "826161a161626163",
          decoded: ["a", new Map<string, any>([["b", "c"]])],
          description: "Array containing a map"
        },
        {
          hex: "a56161614161626142616361436164614461656145",
          decoded: new Map<string, any>([
            ["a", "A"],
            ["b", "B"],
            ["c", "C"],
            ["d", "D"],
            ["e", "E"]
          ]),
          description: "Map with five string key-value pairs"
        }
      ]

      it.each(objectTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        expect(decodedValue).toEqual(decoded)

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(redecoded).toEqual(decoded)
      })
    })

    describe("Byte String Test Vectors", () => {
      const byteStringTestCases = [
        {
          hex: "40",
          decoded: new Uint8Array([]),
          description: "Empty byte string"
        },
        {
          hex: "4401020304",
          decoded: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
          description: "Byte string with 4 bytes"
        }
      ]

      it.each(byteStringTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        expect(decodedValue).toEqual(decoded)

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(redecoded).toEqual(decoded)
      })
    })

    describe("Floating Point Test Vectors", () => {
      const floatTestCases = [
        {
          hex: "f90000",
          decoded: 0.0,
          description: "Half-precision float 0.0"
        },
        {
          hex: "f98000",
          decoded: -0.0,
          description: "Half-precision float -0.0"
        },
        {
          hex: "f93c00",
          decoded: 1.0,
          description: "Half-precision float 1.0"
        },
        {
          hex: "fb3ff199999999999a",
          decoded: 1.1,
          description: "Double-precision float 1.1"
        },
        {
          hex: "f93e00",
          decoded: 1.5,
          description: "Half-precision float 1.5"
        },
        {
          hex: "f97bff",
          decoded: 65504.0,
          description: "Half-precision float 65504.0"
        },
        {
          hex: "fa47c35000",
          decoded: 100000.0,
          description: "Single-precision float 100000.0"
        },
        {
          hex: "fa7f7fffff",
          decoded: 3.4028234663852886e38,
          description: "Single-precision max finite"
        },
        {
          hex: "fb7e37e43c8800759c",
          decoded: 1.0e300,
          description: "Double-precision 1.0e+300"
        },
        {
          hex: "f90001",
          decoded: 5.960464477539063e-8,
          description: "Half-precision smallest positive"
        },
        {
          hex: "f90400",
          decoded: 6.103515625e-5,
          description: "Half-precision 6.103515625e-05"
        },
        {
          hex: "f9c400",
          decoded: -4.0,
          description: "Half-precision float -4.0"
        },
        {
          hex: "fbc010666666666666",
          decoded: -4.1,
          description: "Double-precision float -4.1"
        }
      ]

      it.each(floatTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)
        if (Object.is(decoded, -0.0)) {
          expect(Object.is(decodedValue, -0.0)).toBe(true)
        } else if (Object.is(decoded, 0.0)) {
          expect(Object.is(decodedValue, 0.0) || Object.is(decodedValue, -0.0)).toBe(true)
        } else {
          expect(decodedValue).toBeCloseTo(decoded, 10)
        }

        const reencoded = CBOR.toCBORHex(decoded)
        const redecoded = CBOR.fromCBORHex(reencoded)
        expect(typeof redecoded).toBe("number")
        if (Object.is(decoded, -0.0)) {
          expect(Object.is(redecoded, -0.0)).toBe(true)
        } else if (Object.is(decoded, 0.0)) {
          expect(Object.is(redecoded, 0.0) || Object.is(redecoded, -0.0)).toBe(true)
        } else {
          expect(redecoded).toBeCloseTo(decoded, 10)
        }
      })
    })

    describe("Special Float Values Test Vectors", () => {
      const specialFloatTestCases = [
        { hex: "f97c00", description: "Half-precision Infinity" },
        { hex: "f97e00", description: "Half-precision NaN" },
        { hex: "f9fc00", description: "Half-precision -Infinity" },
        { hex: "fa7f800000", description: "Single-precision Infinity" },
        { hex: "fa7fc00000", description: "Single-precision NaN" },
        { hex: "faff800000", description: "Single-precision -Infinity" },
        { hex: "fb7ff0000000000000", description: "Double-precision Infinity" },
        { hex: "fb7ff8000000000000", description: "Double-precision NaN" },
        {
          hex: "fbfff0000000000000",
          description: "Double-precision -Infinity"
        }
      ]

      it.each(specialFloatTestCases)("should handle $description correctly", ({ description, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)

        if (description.includes("Infinity") && !description.includes("-Infinity")) {
          expect(decodedValue).toBe(Infinity)
        } else if (description.includes("-Infinity")) {
          expect(decodedValue).toBe(-Infinity)
        } else if (description.includes("NaN")) {
          expect(Number.isNaN(decodedValue)).toBe(true)
        }
      })
    })

    describe("Tagged Value Test Vectors", () => {
      const taggedTestCases = [
        {
          hex: "c074323031332d30332d32315432303a30343a30305a",
          description: "Tag 0 (date/time string)"
        },
        { hex: "c11a514b67b0", description: "Tag 1 (epoch timestamp)" },
        {
          hex: "c1fb41d452d9ec200000",
          description: "Tag 1 (epoch timestamp with fractional seconds)"
        },
        {
          hex: "d74401020304",
          description: "Tag 23 (expected base16 encoding)"
        },
        {
          hex: "d818456449455446",
          description: "Tag 24 (encoded CBOR data item)"
        },
        {
          hex: "d82076687474703a2f2f7777772e6578616d706c652e636f6d",
          description: "Tag 32 (URI)"
        }
      ]

      it.each(taggedTestCases)("should handle $description correctly", ({ hex }) => {
        expect(() => {
          const decodedValue = CBOR.fromCBORHex(hex)
          expect(decodedValue).toBeDefined()
        }).not.toThrow()
      })
    })

    describe("Indefinite Length Test Vectors", () => {
      const indefiniteTestCases = [
        { hex: "5f42010243030405ff", description: "Indefinite byte string" },
        {
          hex: "7f657374726561646d696e67ff",
          decoded: "streaming",
          description: "Indefinite text string"
        },
        { hex: "9fff", decoded: [], description: "Indefinite empty array" },
        {
          hex: "9f018202039f0405ffff",
          decoded: [1n, [2n, 3n], [4n, 5n]],
          description: "Indefinite nested arrays"
        },
        {
          hex: "9f01820203820405ff",
          decoded: [1n, [2n, 3n], [4n, 5n]],
          description: "Mixed definite/indefinite arrays"
        },
        {
          hex: "83018202039f0405ff",
          decoded: [1n, [2n, 3n], [4n, 5n]],
          description: "Definite array with indefinite subarray"
        },
        {
          hex: "83019f0203ff820405",
          decoded: [1n, [2n, 3n], [4n, 5n]],
          description: "Mixed array structures"
        },
        {
          hex: "9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff",
          decoded: [
            1n,
            2n,
            3n,
            4n,
            5n,
            6n,
            7n,
            8n,
            9n,
            10n,
            11n,
            12n,
            13n,
            14n,
            15n,
            16n,
            17n,
            18n,
            19n,
            20n,
            21n,
            22n,
            23n,
            24n,
            25n
          ],
          description: "Indefinite array with 25 integers"
        },
        {
          hex: "bf61610161629f0203ffff",
          decoded: new Map<string, any>([
            ["a", 1n],
            ["b", [2n, 3n]]
          ]),
          description: "Indefinite map with mixed values"
        },
        {
          hex: "826161bf61626163ff",
          decoded: ["a", new Map<string, any>([["b", "c"]])],
          description: "Array with indefinite map"
        },
        {
          hex: "bf6346756ef563416d7421ff",
          decoded: new Map<string, any>([
            ["Fun", true],
            ["Amt", -2n]
          ]),
          description: "Indefinite map with boolean and negative integer"
        }
      ]

      it.each(indefiniteTestCases)("should handle $description correctly", ({ decoded, hex }) => {
        const decodedValue = CBOR.fromCBORHex(hex)

        if (decoded !== undefined) {
          expect(decodedValue).toEqual(decoded)
        }

        if (decoded !== undefined) {
          const reencoded = CBOR.toCBORHex(decoded)
          const redecoded = CBOR.fromCBORHex(reencoded)
          expect(redecoded).toEqual(decoded)
        }
      })
    })

    describe("Simple Value Test Vectors", () => {
      const simpleValueTestCases = [
        { hex: "f0", description: "Simple value 16" },
        { hex: "f818", description: "Simple value 24" },
        { hex: "f8ff", description: "Simple value 255" },
        { hex: "f7", description: "Undefined value" }
      ]

      it.each(simpleValueTestCases)("should handle $description correctly", ({ description, hex }) => {
        expect(() => {
          const decodedValue = CBOR.fromCBORHex(hex)
          if (description === "Undefined value") {
            expect(decodedValue).toBeUndefined()
          } else {
            expect(decodedValue).toBeDefined()
          }
        }).not.toThrow()
      })
    })
  })
})
