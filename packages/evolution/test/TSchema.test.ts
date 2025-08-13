import { describe, expect, it } from "vitest"

import * as Data from "../src/Data.js"
import * as TSchema from "../src/TSchema.js"

/**
 * Tests for TypeTaggedSchema module functionality -
 * focusing on schema definition, encoding, and decoding
 */
describe("TypeTaggedSchema Tests", () => {
  describe("Basic Types", () => {
    describe("ByteArray Schema", () => {
      it("should encode/decode ByteArray", () => {
        const input = "deadbeef"
        const encoded = Data.withSchema(TSchema.ByteArray).toCBORHex(input)
        const decoded = Data.withSchema(TSchema.ByteArray).fromCBORHex(encoded)

        expect(encoded).toEqual("44deadbeef")
        expect(decoded).toEqual("deadbeef")
      })

      it("should fail on invalid hex string", () => {
        expect(() => Data.withSchema(TSchema.ByteArray).toCBORHex("not-hex")).toThrow()
      })
    })

    describe("Integer Schema", () => {
      it("should encode/decode Integer", () => {
        const input = 42n
        const encoded = Data.withSchema(TSchema.Integer).toCBORHex(input)
        const decoded = Data.withSchema(TSchema.Integer).fromCBORHex(encoded)

        expect(encoded).toEqual("182a")
        expect(decoded).toEqual(42n)
      })

      it("should fail on non-bigint", () => {
        expect(() =>
          // @ts-ignore intentional misuse
          Data.encodeDataOrThrow(42, TSchema.Integer)
        ).toThrow()
      })
    })

    describe("Boolean Schema", () => {
      it("should encode/decode true", () => {
        const input = true
        const encoded = Data.withSchema(TSchema.Boolean).toCBORHex(input)
        const decoded = Data.withSchema(TSchema.Boolean).fromCBORHex(encoded)

        expect(encoded).toEqual("d87a80")
        expect(decoded).toEqual(true)
      })

      it("should encode/decode false", () => {
        const input = false
        const encoded = Data.withSchema(TSchema.Boolean).toCBORHex(input)
        const decoded = Data.withSchema(TSchema.Boolean).fromCBORHex(encoded)

        expect(encoded).toEqual("d87980")
        expect(decoded).toEqual(false)
      })

      it("should fail on invalid format", () => {
        const invalidInput = "d87a01" // Invalid boolean
        expect(() => Data.withSchema(TSchema.Boolean).fromCBORHex(invalidInput)).toThrow()
      })
    })
  })

  describe("Complex Types", () => {
    describe("Array Schema", () => {
      it("should encode/decode arrays", () => {
        const IntArray = TSchema.Array(TSchema.Integer)

        const input = [1n, 2n, 3n]
        const encoded = Data.withSchema(IntArray).toCBORHex(input)
        const decoded = Data.withSchema(IntArray).fromCBORHex(encoded)

        expect(encoded).toEqual("9f010203ff")
        expect(decoded).toEqual([1n, 2n, 3n])
      })

      it("should handle empty arrays", () => {
        const IntArray = TSchema.Array(TSchema.Integer)

        const input: Array<bigint> = []
        const encoded = Data.withSchema(IntArray).toCBORHex(input)
        const decoded = Data.withSchema(IntArray).fromCBORHex(encoded)

        expect(encoded).toEqual("80")
        expect(decoded).toEqual([])
      })
    })

    describe("Map Schema", () => {
      it("should encode/decode maps", () => {
        const TokenMap = TSchema.Map(TSchema.ByteArray, TSchema.Integer)

        const input = new Map<string, bigint>([
          ["deadbeef", 1n],
          ["cafe", 2n]
        ])

        const encoded = Data.withSchema(TokenMap).toCBORHex(input)
        const decoded = Data.withSchema(TokenMap).fromCBORHex(encoded)

        expect(decoded).toEqual(input)
      })

      it("should handle empty maps", () => {
        const TokenMap = TSchema.Map(TSchema.ByteArray, TSchema.Integer)

        const input = new Map<string, bigint>()
        const encoded = Data.withSchema(TokenMap).toCBORHex(input)
        const decoded = Data.withSchema(TokenMap).fromCBORHex(encoded)

        expect(decoded).toEqual(input)
      })

      it("should deterministically encode Maps regardless of insertion order", () => {
        const TokenMap = TSchema.Map(TSchema.ByteArray, TSchema.Integer)

        // Create two maps with same entries but different insertion order
        const map1 = new Map<string, bigint>([
          ["deadbeef", 1n],
          ["cafe", 2n],
          ["babe", 3n]
        ])

        const map2 = new Map<string, bigint>([
          ["cafe", 2n],
          ["babe", 3n],
          ["deadbeef", 1n]
        ])

        const encoded1 = Data.withSchema(TokenMap, { mode: "canonical" }).toCBORHex(map1)
        const encoded2 = Data.withSchema(TokenMap, { mode: "canonical" }).toCBORHex(map2)

        // The CBOR outputs should be identical if sorting is working correctly
        expect(encoded1).toEqual(encoded2)
      })

      it("should handle key integer and value bytearray", () => {
        const IntegerByteArrayMap = TSchema.Map(TSchema.Integer, TSchema.ByteArray)
        const input = new Map<bigint, string>([
          [3209n, "3131"],
          [249218490182n, "32323232"]
        ])
        const encoded = Data.withSchema(IntegerByteArrayMap).toCBORHex(input)
        const decoded = Data.withSchema(IntegerByteArrayMap).fromCBORHex(encoded)

        expect(encoded).toEqual("bf190c894231311b0000003a06945f464432323232ff")
        expect(decoded).toEqual(input)
      })

      it("should handle complex map with mixed types", () => {
        const ComplexMap = TSchema.Map(
          TSchema.ByteArray,
          TSchema.Union(TSchema.Integer, TSchema.ByteArray, TSchema.Boolean)
        )
        type ComplexMap = typeof ComplexMap.Type

        const input = new Map<string, bigint | string | boolean>([
          ["deadbeef01", 42n],
          ["deadbeef02", "cafe"],
          ["deadbeef03", true]
        ])

        const encoded = Data.withSchema(ComplexMap).toCBORHex(input)
        const decoded = Data.withSchema(ComplexMap).fromCBORHex(encoded)

        expect(decoded).toEqual(input)
        expect(decoded instanceof Map).toBe(true)
        expect(decoded.size).toBe(3)
        expect(decoded.get("deadbeef01")).toBe(42n)
        expect(decoded.get("deadbeef02")).toBe("cafe")
        expect(decoded.get("deadbeef03")).toBe(true)
      })
    })

    describe("Struct Schema", () => {
      it("should encode/decode structs", () => {
        const Token = TSchema.Struct({
          policyId: TSchema.ByteArray,
          assetName: TSchema.ByteArray,
          amount: TSchema.Integer
        })

        const input = { policyId: "deadbeef", assetName: "cafe", amount: 1000n }

        const encoded = Data.withSchema(Token).toCBORHex(input)
        const decoded = Data.withSchema(Token).fromCBORHex(encoded)

        expect(encoded).toEqual("d8799f44deadbeef42cafe1903e8ff")
        expect(decoded).toEqual(input)
      })

      it("should handle nested structs", () => {
        const Asset = TSchema.Struct({ policyId: TSchema.ByteArray, assetName: TSchema.ByteArray })
        const Token = TSchema.Struct({ asset: Asset, amount: TSchema.Integer })
        type Token = typeof Token.Type

        const input: Token = { asset: { policyId: "deadbeef", assetName: "cafe" }, amount: 1000n }

        const encoded = Data.withSchema(Token).toCBORHex(input)
        const decoded = Data.withSchema(Token).fromCBORHex(encoded)

        expect(decoded).toEqual(input)
      })
    })

    describe("Tuple Schema", () => {
      it("should encode/decode tuples", () => {
        const AssetPair = TSchema.Tuple([TSchema.ByteArray, TSchema.Integer])

        const input = ["deadbeef", 1000n] as const
        const encoded = Data.withSchema(AssetPair).toCBORHex(input)
        const decoded = Data.withSchema(AssetPair).fromCBORHex(encoded)

        expect(encoded).toEqual("9f44deadbeef1903e8ff")
        expect(decoded).toEqual(input)
      })

      it("should handle heterogeneous tuples", () => {
        const Mixed = TSchema.Tuple([TSchema.ByteArray, TSchema.Integer, TSchema.Boolean])

        const input = ["deadbeef", 1000n, true] as const
        const encoded = Data.withSchema(Mixed).toCBORHex(input)
        const decoded = Data.withSchema(Mixed).fromCBORHex(encoded)

        expect(decoded).toEqual(input)
      })
    })

    describe("Nullable Schema", () => {
      it("should encode/decode non-null values", () => {
        const MaybeInt = TSchema.NullOr(TSchema.Integer)

        const input = 42n
        const encoded = Data.withSchema(MaybeInt).toCBORHex(input)
        const decoded = Data.withSchema(MaybeInt).fromCBORHex(encoded)

        expect(encoded).toEqual("d8799f182aff")
        expect(decoded).toEqual(42n)
      })

      it("should encode/decode null values", () => {
        const MaybeInt = TSchema.NullOr(TSchema.Integer)

        const input = null
        const encoded = Data.withSchema(MaybeInt).toCBORHex(input)
        const decoded = Data.withSchema(MaybeInt).fromCBORHex(encoded)

        expect(encoded).toEqual("d87a80")
        expect(decoded).toBeNull()
      })
    })

    describe("Literal Schema", () => {
      it("should encode/decode literals", () => {
        const Action = TSchema.Literal("mint", "burn", "transfer")

        const input = "mint"
        const encoded = Data.withSchema(Action).toCBORHex(input)
        const decoded = Data.withSchema(Action).fromCBORHex(encoded)

        expect(encoded).toEqual("d87980")
        expect(decoded).toEqual("mint")

        const input2 = "burn"
        const encoded2 = Data.withSchema(Action).toCBORHex(input2)
        const decoded2 = Data.withSchema(Action).fromCBORHex(encoded2)

        expect(encoded2).toEqual("d87a80")
        expect(decoded2).toEqual("burn")
      })

      it("should fail on invalid literal", () => {
        const Action = TSchema.Literal("mint", "burn")
        expect(() =>
          // @ts-ignore intentional misuse
          Data.withSchema(Action).toCBORHex("invalid")
        ).toThrow()
      })
    })

    describe("Union Schema", () => {
      it("should encode/decode union types", () => {
        const MintRedeem = TSchema.Struct({
          policyId: TSchema.ByteArray,
          assetName: TSchema.ByteArray,
          amount: TSchema.Integer
        })

        const SpendRedeem = TSchema.Struct({ address: TSchema.ByteArray, amount: TSchema.Integer })

        const RedeemAction = TSchema.Union(MintRedeem, SpendRedeem, TSchema.Integer)

        // Test MintRedeem
        const mintInput = { policyId: "deadbeef", assetName: "cafe", amount: 1000n }
        const mintEncoded = Data.withSchema(RedeemAction).toCBORHex(mintInput)
        const mintDecoded = Data.withSchema(RedeemAction).fromCBORHex(mintEncoded)

        expect(mintEncoded).toEqual("d8799fd8799f44deadbeef42cafe1903e8ffff")
        expect(mintDecoded).toEqual(mintInput)

        // Test SpendRedeem
        const spendInput = { address: "deadbeef", amount: 500n }
        const spendEncoded = Data.withSchema(RedeemAction).toCBORHex(spendInput)
        const spendDecoded = Data.withSchema(RedeemAction).fromCBORHex(spendEncoded)

        expect(spendEncoded).toEqual("d87a9fd8799f44deadbeef1901f4ffff")
        expect(spendDecoded).toEqual(spendInput)

        // Test Integer
        const intInput = 42n
        const intEncoded = Data.withSchema(RedeemAction).toCBORHex(intInput)
        const intDecoded = Data.withSchema(RedeemAction).fromCBORHex(intEncoded)

        expect(intEncoded).toEqual("d87b9f182aff")
        expect(intDecoded).toEqual(intInput)
      })
    })
  })

  describe("Complex Combinations", () => {
    it("should handle complex nested schemas", () => {
      const Asset = TSchema.Struct({ policyId: TSchema.ByteArray, assetName: TSchema.ByteArray })
      const TokenList = TSchema.Array(Asset)
      const Wallet = TSchema.Struct({
        owner: TSchema.ByteArray,
        tokens: TokenList,
        active: TSchema.Boolean,
        metadata: TSchema.NullOr(TSchema.Map(TSchema.ByteArray, TSchema.ByteArray))
      })

      const input = {
        owner: "deadbeef",
        tokens: [
          { policyId: "cafe01", assetName: "deadbeef01" },
          { policyId: "cafe02", assetName: "deadbeef02" }
        ],
        active: true,
        metadata: new Map([
          ["cafe01", "deadbeef01"],
          ["cafe02", "deadbeef02"]
        ])
      }

      const encoded = Data.withSchema(Wallet).toCBORHex(input)
      const decoded = Data.withSchema(Wallet).fromCBORHex(encoded)

      expect(decoded).toEqual(input)
    })
  })

  describe("Error Handling", () => {
    it("should provide helpful error messages for decoding failures", () => {
      const TestStruct = TSchema.Struct({ field1: TSchema.Integer, field2: TSchema.ByteArray })

      const invalidData = "d87a9f010203d87a9f010203" // Invalid ByteArray

      expect(() => Data.withSchema(TestStruct).fromCBORHex(invalidData)).toThrow(Data.DataError)
    })

    it("should throw comprehensible errors for schema mismatches", () => {
      const StringSchema = TSchema.ByteArray
      const IntegerData = "d87a9f010203" // Invalid Integer

      expect(() => Data.withSchema(StringSchema).fromCBORHex(IntegerData)).toThrow()

      const BooleanData = "d87a80" // Invalid Boolean
      expect(() => Data.withSchema(TSchema.Integer).fromCBORHex(BooleanData)).toThrow()
    })
  })
})
