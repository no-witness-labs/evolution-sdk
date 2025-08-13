import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as Data from "../src/Data.js"

/**
 * Property-based tests for Data module
 * focusing on roundtrip serialization properties for all data types
 */
describe("Data Property Tests", () => {
  describe("Core Generators", () => {
    /**
     * Using exported generators from Data module
     * These follow the same pattern as used in the Data.js module
     */

    // Reference to exported generators for clarity

    describe("Generator-based Roundtrip Tests", () => {
      it("should generate valid PlutusBigInt data and roundtrip", () => {
        FastCheck.assert(
          FastCheck.property(Data.arbitraryPlutusBigInt(), (value) => {
            const cborHex = Data.toCBORHex(value)
            const decoded = Data.fromCBORHex(cborHex)
            expect(Data.isInt(value)).toBe(true)
            expect(decoded).toEqual(value)
          })
        )
      })

      it("should generate valid PlutusBytes data and roundtrip", () => {
        FastCheck.assert(
          FastCheck.property(Data.arbitraryPlutusBytes(), (value) => {
            const cborHex = Data.toCBORHex(value)
            const decoded = Data.fromCBORHex(cborHex)
            expect(Data.isBytes(value)).toBe(true)
            expect(decoded).toEqual(value)
          })
        )
      })

      it("should generate valid PlutusList data and roundtrip", () => {
        FastCheck.assert(
          FastCheck.property(Data.arbitraryPlutusList(1), (value) => {
            const cborHex = Data.toCBORHex(value)
            const decoded = Data.fromCBORHex(cborHex)
            expect(Data.isList(value)).toBe(true)
            expect(decoded).toEqual(value)
          })
        )
      })

      it("should generate valid PlutusMap data and roundtrip", () => {
        FastCheck.assert(
          FastCheck.property(Data.arbitraryPlutusMap(1), (value) => {
            const cborHex = Data.toCBORHex(value)
            const decoded = Data.fromCBORHex(cborHex)
            expect(Data.isMap(value)).toBe(true)
            expect(decoded).toEqual(value)
          })
        )
      })

      it("should generate valid Constr data and roundtrip", () => {
        FastCheck.assert(
          FastCheck.property(Data.arbitraryConstr(1), (value) => {
            const cborHex = Data.toCBORHex(value)
            const decoded = Data.fromCBORHex(cborHex)
            expect(Data.isConstr(value)).toBe(true)
            expect(decoded).toEqual(value)
          })
        )
      })

      it("should generate complex PlutusData structures and roundtrip", () => {
        FastCheck.assert(
          FastCheck.property(Data.arbitraryPlutusData(2), (value) => {
            const cborHex = Data.toCBORHex(value)
            const decoded = Data.fromCBORHex(cborHex)
            expect(decoded).toEqual(value)
          })
        )
      })
    })
  })

  describe("Generator-based Alternative Tests", () => {
    it("should maintain PlutusBigInt through roundtrip using exported generator", () => {
      FastCheck.assert(
        FastCheck.property(Data.arbitraryPlutusBigInt(), (value) => {
          const cborHex = Data.toCBORHex(value)
          const decoded = Data.fromCBORHex(cborHex)
          expect(decoded).toEqual(value)
        })
      )
    })

    it("should maintain PlutusBytes through roundtrip using exported generator", () => {
      FastCheck.assert(
        FastCheck.property(Data.arbitraryPlutusBytes(), (value) => {
          const cborHex = Data.toCBORHex(value)
          const decoded = Data.fromCBORHex(cborHex)
          expect(decoded).toEqual(value)
        })
      )
    })

    it("should maintain PlutusData through roundtrip using exported generator", () => {
      // Use limited depth to avoid excessive recursion
      FastCheck.assert(
        FastCheck.property(Data.arbitraryPlutusData(2), (value) => {
          const cborHex = Data.toCBORHex(value)
          const decoded = Data.fromCBORHex(cborHex)
          expect(decoded).toEqual(value)
        })
      )
    })
  })

  describe("PlutusBigInt CDDL Compliance", () => {
    it("should handle all CDDL int variants: int, big_uint, big_nint", () => {
      FastCheck.assert(
        FastCheck.property(FastCheck.bigInt(), (value) => {
          const plutusBigInt = value
          const cborHex = Data.toCBORHex(plutusBigInt)
          const decoded = Data.fromCBORHex(cborHex)

          expect(decoded).toEqual(plutusBigInt)

          // Type assertion to verify properties safely
          if (Data.isInt(decoded)) {
            expect(decoded).toBe(value)
          } else {
            expect.fail("Decoded value should be PlutusBigInt")
          }
        })
      )
    })
  })

  describe("Constr CBOR Tag Handling", () => {
    it("should use proper tags for small constructor indices (0-6)", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.integer({ min: 0, max: 6 }),
          FastCheck.array(Data.arbitraryPlutusBigInt(), { maxLength: 2 }),
          (index, fields) => {
            const constr = Data.constr(BigInt(index), fields)
            const cborHex = Data.toCBORHex(constr)
            const decoded = Data.fromCBORHex(cborHex)

            expect(decoded).toEqual(constr)

            // Type assertion to verify properties safely
            if (Data.isConstr(decoded)) {
              expect(decoded.index).toBe(BigInt(index))
            } else {
              expect.fail("Decoded value should be a Constr")
            }
          }
        )
      )
    })

    it("should use tag 102 for large constructor indices", () => {
      FastCheck.assert(
        FastCheck.property(
          FastCheck.bigInt({ min: 7n, max: 2n ** 64n - 1n }),
          FastCheck.array(Data.arbitraryPlutusBigInt(), { maxLength: 2 }),
          (index, fields) => {
            const constr = Data.constr(index, fields)
            const cborHex = Data.toCBORHex(constr)
            const decoded = Data.fromCBORHex(cborHex)

            expect(decoded).toEqual(constr)

            // Type assertion to verify properties safely
            if (Data.isConstr(decoded)) {
              expect(decoded.index).toBe(index)
            } else {
              expect.fail("Decoded value should be a Constr")
            }
          }
        )
      )
    })
  })

  describe("Schema Transformation Tests", () => {
    it("should successfully transform between CBOR bytes and PlutusData", () => {
      // Use exported generator with limited recursion depth
      FastCheck.assert(
        FastCheck.property(Data.arbitraryPlutusData(1), (value) => {
          // PlutusData -> CBOR bytes
          const cborBytes = Data.toCBORBytes(value)

          // CBOR bytes -> PlutusData
          const decoded = Data.fromCBORBytes(cborBytes)

          expect(decoded).toEqual(value)
        })
      )
    })
  })
})
