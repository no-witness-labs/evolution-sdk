import { describe, it, expect } from "@effect/vitest"
import * as Address from "@evolution-sdk/evolution/Address"
import * as PaymentAddress from "@evolution-sdk/evolution/PaymentAddress"
import * as RewardAddress from "@evolution-sdk/evolution/RewardAddress"
import * as Data from "@evolution-sdk/evolution/Data"

/**
 * Test suite to verify all examples from documentation work correctly
 */
describe("Documentation Examples Verification", () => {
  describe("Quick Start Examples", () => {
    it("should validate payment and reward addresses correctly", () => {
      // Sample addresses from quick-start.mdx
      const mainnetBaseAddress =
        "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x"
      const mainnetRewardAddress = "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw"
      const testnetBaseAddress =
        "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
      const testnetRewardAddress = "stake_test1uqehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gssrtvn"

      // Validate payment addresses
      expect(PaymentAddress.isPaymentAddress(mainnetBaseAddress)).toBe(true)
      expect(PaymentAddress.isPaymentAddress(testnetBaseAddress)).toBe(true)
      expect(PaymentAddress.isPaymentAddress(mainnetRewardAddress)).toBe(false)
      expect(PaymentAddress.isPaymentAddress(testnetRewardAddress)).toBe(false)

      // Validate reward addresses
      expect(RewardAddress.isRewardAddress(mainnetRewardAddress)).toBe(true)
      expect(RewardAddress.isRewardAddress(testnetRewardAddress)).toBe(true)
      expect(RewardAddress.isRewardAddress(mainnetBaseAddress)).toBe(false)
      expect(RewardAddress.isRewardAddress(testnetBaseAddress)).toBe(false)
    })

    it("should perform address format conversion correctly", () => {
      // Example from quick-start.mdx
      const hexAddress = "60ba1d6b6283c219a0530e3682c316215d55819cf97bbf26552c6f8530"
      const expectedBech32 = "addr_test1vzap66mzs0ppngznpcmg9scky9w4tqvul9am7fj493hc2vq4ry02m"

      // Decode from hex
      const address = Address.Codec.Decode.hex(hexAddress)
      expect(address).toBeDefined()

      // Encode to bech32
      const actualBech32 = Address.Codec.Encode.bech32(address)
      expect(actualBech32).toBe(expectedBech32)

      // Round-trip conversion
      const backToHex = Address.Codec.Encode.hex(address)
      expect(backToHex).toBe(hexAddress)
    })

    it("should validate different address types", () => {
      // Address types from quick-start.mdx
      const baseAddress =
        "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x"
      const enterpriseAddress = "addr1vx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer66hrl8"
      const pointerAddress = "addr1gx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer5pnz75xxcrzqf96k"
      const rewardAddress = "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw"

      // All should be valid addresses for their respective types
      expect(PaymentAddress.isPaymentAddress(baseAddress)).toBe(true)
      expect(PaymentAddress.isPaymentAddress(enterpriseAddress)).toBe(true)
      expect(PaymentAddress.isPaymentAddress(pointerAddress)).toBe(true)
      expect(RewardAddress.isRewardAddress(rewardAddress)).toBe(true)
    })

    it("should validate data types correctly", () => {
      // Examples from quick-start.mdx
      const validHex = "deadbeef"
      const isValidBytes = Data.isBytes(validHex)
      expect(isValidBytes).toBe(true)

      const invalidHex = "not-hex"
      const isInvalidBytes = Data.isBytes(invalidHex)
      expect(isInvalidBytes).toBe(false)
    })
  })

  describe("Examples Page Verification", () => {
    it("should validate all mainnet and testnet addresses", () => {
      const addresses = {
        // Mainnet addresses
        mainnet: {
          base: "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
          enterprise: "addr1vx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer66hrl8",
          pointer: "addr1gx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer5pnz75xxcrzqf96k",
          reward: "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw"
        },
        // Testnet addresses
        testnet: {
          base: "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae",
          enterprise: "addr_test1vz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer5pnz75xxcrdw5vky",
          pointer: "addr_test1gz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer5pnz75xxcrdw5vky",
          reward: "stake_test1uqehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gssrtvn"
        }
      }

      // Test payment addresses
      const paymentAddresses = [
        addresses.mainnet.base,
        addresses.mainnet.enterprise,
        addresses.mainnet.pointer,
        addresses.testnet.base,
        addresses.testnet.enterprise,
        addresses.testnet.pointer
      ]

      paymentAddresses.forEach((address) => {
        expect(PaymentAddress.isPaymentAddress(address)).toBe(true)
      })

      // Test reward addresses
      const rewardAddresses = [addresses.mainnet.reward, addresses.testnet.reward]

      rewardAddresses.forEach((address) => {
        expect(RewardAddress.isRewardAddress(address)).toBe(true)
      })
    })

    it("should validate hex addresses from examples", () => {
      const validHexAddresses = [
        "019493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e337b62cfff6403a06a3acbc34f8c46003c69fe79a3628cefa9c47251",
        "60ba1d6b6283c219a0530e3682c316215d55819cf97bbf26552c6f8530"
      ]

      validHexAddresses.forEach((hex) => {
        // Should decode without error
        const address = Address.Codec.Decode.hex(hex)
        expect(address).toBeDefined()

        // Should encode back to same hex
        const backToHex = Address.Codec.Encode.hex(address)
        expect(backToHex).toBe(hex)

        // Should encode to valid bech32
        const bech32 = Address.Codec.Encode.bech32(address)
        expect(typeof bech32).toBe("string")
        expect(bech32.length).toBeGreaterThan(0)
      })
    })

    it("should validate data type examples", () => {
      // Valid hex examples from documentation
      const validHexCases = ["deadbeef", "cafe0123", "abcdef0123456789", "00", "ff"]

      validHexCases.forEach((hex) => {
        expect(Data.isBytes(hex)).toBe(true)
      })

      // Invalid hex examples from documentation
      const invalidHexCases = [
        "not-hex",
        "xyz",
        "123g",
        "deadbeef ", // trailing space
        " deadbeef", // leading space
        "0x123456" // hex prefix not allowed
      ]

      invalidHexCases.forEach((hex) => {
        expect(Data.isBytes(hex)).toBe(false)
      })
    })

    it("should handle batch validation correctly", () => {
      // Mixed collection from examples
      const testAddresses = [
        "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
        "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw",
        "not-an-address",
        "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse68faae",
        "stake_test1uqehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gssrtvn"
      ]

      const results = testAddresses.map((address) => {
        const isPayment = PaymentAddress.isPaymentAddress(address)
        const isReward = RewardAddress.isRewardAddress(address)

        let type = "invalid"
        if (isPayment) type = "payment"
        else if (isReward) type = "reward"

        return {
          address,
          type,
          valid: isPayment || isReward
        }
      })

      // Verify expected results
      expect(results[0].type).toBe("payment")
      expect(results[1].type).toBe("reward")
      expect(results[2].type).toBe("invalid")
      expect(results[3].type).toBe("payment")
      expect(results[4].type).toBe("reward")
    })
  })
})
