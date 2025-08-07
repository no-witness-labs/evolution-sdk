import { describe, expect, it } from "@effect/vitest"
import { FastCheck } from "effect"

import { Address } from "../src/index.js"

// Sample addresses for testing - organized by network and type as arrays with comments
// MAINNET ADDRESSES
const MAINNET_ADDRESSES = [
  // Base addresses (payment key hash + stake key hash) - type 0
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
  // Base addresses (payment script hash + stake key hash) - type 1
  "addr1z8phkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gten0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs9yc0hh",
  // Base addresses (payment key hash + stake script hash) - type 2
  "addr1yx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzerkr0vd4msrxnuwnccdxlhdjar77j6lg0wypcc9uar5d2shs2z78ve",
  // Base addresses (payment script hash + stake script hash) - type 3
  "addr1x8phkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gt7r0vd4msrxnuwnccdxlhdjar77j6lg0wypcc9uar5d2shskhj42g",
  // Pointer addresses (payment key hash + pointer) - type 4
  "addr1gx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer5pnz75xxcrzqf96k",
  // Pointer addresses (payment script hash + pointer) - type 5
  "addr128phkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gtupnz75xxcrtw79hu",
  // Enterprise addresses (payment key hash only) - type 6
  "addr1vx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzers66hrl8",
  // Enterprise addresses (payment script hash only) - type 7
  "addr1w8phkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gtcyjy7wx",
  // Reward addresses (stake key hash) - type 14
  "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw",
  // Reward addresses (stake script hash) - type 15
  "stake178phkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gtcccycj5"
] as const

// TESTNET ADDRESSES
const TESTNET_ADDRESSES = [
  // Base addresses (payment key hash + stake key hash) - type 0
  "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae",
  // Base addresses (payment script hash + stake key hash) - type 1
  "addr_test1zrphkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gten0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgsxj90mg",
  // Base addresses (payment key hash + stake script hash) - type 2
  "addr_test1yz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzerkr0vd4msrxnuwnccdxlhdjar77j6lg0wypcc9uar5d2shsf5r8qx",
  // Base addresses (payment script hash + stake script hash) - type 3
  "addr_test1xrphkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gt7r0vd4msrxnuwnccdxlhdjar77j6lg0wypcc9uar5d2shs4p04xh",
  // Pointer addresses (payment key hash + pointer) - type 4
  "addr_test1gz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer5pnz75xxcrdw5vky",
  // Pointer addresses (payment script hash + pointer) - type 5
  "addr_test12rphkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gtupnz75xxcryqrvmw",
  // Enterprise addresses (payment key hash only) - type 6
  "addr_test1vz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzerspjrlsz",
  // Enterprise addresses (payment script hash only) - type 7
  "addr_test1wrphkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gtcl6szpr",
  // Reward addresses (stake key hash) - type 14
  "stake_test1uqehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gssrtvn",
  // Reward addresses (stake script hash) - type 15
  "stake_test17rphkx6acpnf78fuvxn0mkew3l0fd058hzquvz7w36x4gtcljw6kf"
] as const

// Combine all addresses for tests that need to check all
const ALL_ADDRESSES = [...MAINNET_ADDRESSES, ...TESTNET_ADDRESSES] as const

// Other test constants
const INVALID_ADDRESS = "not-an-address"
const VALID_HEX_ADDRESSES = [
  "019493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e337b62cfff6403a06a3acbc34f8c46003c69fe79a3628cefa9c47251",
  "60ba1d6b6283c219a0530e3682c316215d55819cf97bbf26552c6f8530"
]

// Describe block for Address module tests
describe("Address", () => {
  describe("Validation", () => {
    it("should validate valid bech32 addresses", () => {
      for (const address of ALL_ADDRESSES) {
        try {
          // Direct use of the string without branding
          Address.Codec.Decode.bech32(address)
          // No error means success
        } catch (error) {
          expect.fail(`Failed to decode valid address: ${error}`)
        }
      }
    })

    it("should reject invalid addresses", () => {
      // For invalid addresses, we expect the Decode.bech32 call to throw
      expect(() => {
        Address.Codec.Decode.bech32(INVALID_ADDRESS)
      }).toThrow()

      expect(() => {
        Address.Codec.Decode.bech32("")
      }).toThrow()
    })

    it("should validate valid hex addresses", () => {
      for (const hexAddr of VALID_HEX_ADDRESSES) {
        try {
          // Should not throw for valid hex addresses
          Address.Codec.Decode.hex(hexAddr)
        } catch (error) {
          expect.fail(`Failed to decode valid hex address: ${error}`)
        }
      }
    })

    it("should reject invalid hex addresses", () => {
      expect(() => {
        Address.Codec.Decode.hex("not-a-hex-address")
      }).toThrow()

      expect(() => {
        Address.Codec.Decode.hex("123xyz")
      }).toThrow()

      expect(() => {
        Address.Codec.Decode.hex("")
      }).toThrow()
    })
  })

  describe("Encoding/Decoding", () => {
    it("should encode and decode addresses between bech32 and bytes", () => {
      for (const address of ALL_ADDRESSES) {
        try {
          const addr = Address.Codec.Decode.bech32(address)
          const backToBech32 = Address.Codec.Encode.bech32(addr)
          // Convert to lowercase for comparison since bech32 is case-insensitive
          expect(backToBech32.toLowerCase()).toBe(address.toLowerCase())
        } catch (error) {
          expect.fail(`Failed during bech32 encode/decode cycle: ${error}`)
        }
      }
    })

    it("should encode and decode addresses between hex and bytes", () => {
      for (const hexAddr of VALID_HEX_ADDRESSES) {
        try {
          const addr = Address.Codec.Decode.hex(hexAddr)
          const backToHex = Address.Codec.Encode.hex(addr)
          expect(backToHex.toLowerCase()).toBe(hexAddr.toLowerCase())
        } catch (error) {
          expect.fail(`Failed during hex encode/decode cycle: ${error}`)
        }
      }
    })

    it("should convert between bech32 and hex formats", () => {
      for (const address of ALL_ADDRESSES.slice(0, 2)) {
        // Test a couple of addresses
        try {
          // bech32 -> bytes -> hex
          const addr = Address.Codec.Decode.bech32(address)
          const hex = Address.Codec.Encode.hex(addr)

          // hex -> bytes -> bech32
          const addrFromHex = Address.Codec.Decode.hex(hex)
          const backToBech32 = Address.Codec.Encode.bech32(addrFromHex)

          // Should match the original
          expect(backToBech32.toLowerCase()).toBe(address.toLowerCase())
        } catch (error) {
          expect.fail(`Failed during format conversion cycle: ${error}`)
        }
      }
    })
  })

  describe("Equality", () => {
    it("should consider the same address equal", () => {
      for (const address of ALL_ADDRESSES) {
        try {
          const addr1 = Address.Codec.Decode.bech32(address)
          const addr2 = Address.Codec.Decode.bech32(address)
          expect(Address.equals(addr1, addr2)).toBe(true)
        } catch (error) {
          expect.fail(`Failed to decode address: ${error}`)
        }
      }
    })

    it("should consider different addresses not equal", () => {
      if (ALL_ADDRESSES.length >= 2) {
        try {
          const addr1 = Address.Codec.Decode.bech32(ALL_ADDRESSES[0])
          const addr2 = Address.Codec.Decode.bech32(ALL_ADDRESSES[1])
          expect(Address.equals(addr1, addr2)).toBe(false)
        } catch (error) {
          expect.fail(`Failed to decode addresses: ${error}`)
        }
      }
    })

    it("should consider addresses equal regardless of case", () => {
      // Bech32 addresses are case-insensitive
      const lowerCaseAddr = MAINNET_ADDRESSES[0].toLowerCase()
      const upperCaseAddr = MAINNET_ADDRESSES[0].toUpperCase()

      try {
        const addr1 = Address.Codec.Decode.bech32(lowerCaseAddr)
        const addr2 = Address.Codec.Decode.bech32(upperCaseAddr)
        expect(Address.equals(addr1, addr2)).toBe(true)
      } catch (error) {
        expect.fail(`Failed to decode case-modified addresses: ${error}`)
      }
    })
  })

  describe("Type-specific operations", () => {
    it("should identify address types correctly", () => {
      try {
        // Base address (mainnet)
        const baseAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[0])
        expect(baseAddr._tag).toBe("BaseAddress")

        // Enterprise address (mainnet)
        const enterpriseAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[6])
        expect(enterpriseAddr._tag).toBe("EnterpriseAddress")

        // Reward address (mainnet)
        const rewardAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[8])
        expect(rewardAddr._tag).toBe("RewardAccount")

        // Pointer address (testnet)
        const pointerAddr = Address.Codec.Decode.bech32(TESTNET_ADDRESSES[4])
        expect(pointerAddr._tag).toBe("PointerAddress")
      } catch (error) {
        expect.fail(`Failed to decode address: ${error}`)
      }
    })

    it("should correctly identify network IDs", () => {
      try {
        // Mainnet address
        const mainnetAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[0])
        if (mainnetAddr._tag === "BaseAddress") {
          expect(mainnetAddr.networkId).toBe(1) // Mainnet ID
        } else {
          expect.fail("Failed to decode as BaseAddress")
        }

        // Testnet address
        const testnetAddr = Address.Codec.Decode.bech32(TESTNET_ADDRESSES[0])
        if (testnetAddr._tag === "BaseAddress") {
          expect(testnetAddr.networkId).toBe(0) // Testnet ID
        } else {
          expect.fail("Failed to decode as BaseAddress")
        }
      } catch (error) {
        expect.fail(`Failed to decode address: ${error}`)
      }
    })

    it("should correctly extract payment credential from base address", () => {
      try {
        const baseAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[0])
        if (baseAddr._tag === "BaseAddress") {
          expect(baseAddr.paymentCredential).toBeDefined()
        } else {
          expect.fail("Failed to decode as BaseAddress")
        }
      } catch (error) {
        expect.fail(`Failed to decode address: ${error}`)
      }
    })

    it("should correctly extract stake credential from base address", () => {
      try {
        const baseAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[0])
        if (baseAddr._tag === "BaseAddress") {
          expect(baseAddr.stakeCredential).toBeDefined()
        } else {
          expect.fail("Failed to decode as BaseAddress")
        }
      } catch (error) {
        expect.fail(`Failed to decode address: ${error}`)
      }
    })
  })

  describe("Error handling", () => {
    it("should throw errors for invalid addresses", () => {
      expect(() => {
        Address.Codec.Decode.bech32(INVALID_ADDRESS)
      }).toThrow()
    })

    it("should throw errors for invalid hex addresses", () => {
      expect(() => {
        Address.Codec.Decode.hex("invalid-hex")
      }).toThrow()
    })

    it("should throw errors for empty addresses", () => {
      expect(() => {
        Address.Codec.Decode.bech32("")
      }).toThrow()
    })
  })

  describe("FastCheck generator", () => {
    it("should generate valid addresses", () => {
      // Get a sample address from the generator
      const generatedAddr = FastCheck.sample(Address.generator, 1)[0]

      // Check that we can encode it without errors
      const bytes = Address.Codec.Encode.bytes(generatedAddr)
      expect(bytes).toBeDefined()

      // Verify the address can be encoded to bech32
      const bech32 = Address.Codec.Encode.bech32(generatedAddr)
      expect(bech32).toBeDefined()
      expect(bech32.length).toBeGreaterThan(0)

      // Verify the address can be encoded to hex
      const hex = Address.Codec.Encode.hex(generatedAddr)
      expect(hex).toBeDefined()
      expect(hex.length).toBeGreaterThan(0)
    })
  })

  describe("Address additional features", () => {
    it("should handle direct encoding between formats", () => {
      // First decode a bech32 address to get an Address object
      const addr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[0])

      // Encode to bytes
      const bytes = Address.Codec.Encode.bytes(addr)
      expect(bytes).toBeDefined()

      // Encode to hex
      const hex = Address.Codec.Encode.hex(addr)
      expect(hex).toBeDefined()

      // Encode back to bech32
      const bech32 = Address.Codec.Encode.bech32(addr)
      expect(bech32).toBeDefined()

      // The full conversion cycle should preserve the address
      const addrFromHex = Address.Codec.Decode.hex(hex)
      const bech32FromHex = Address.Codec.Encode.bech32(addrFromHex)
      expect(bech32FromHex.toLowerCase()).toBe(MAINNET_ADDRESSES[0].toLowerCase())
    })

    it("should correctly identify address properties", () => {
      // Process a Base Address (type 0)
      const baseAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[0])
      if (baseAddr._tag === "BaseAddress") {
        expect(baseAddr.networkId).toBe(1) // Mainnet
        expect(baseAddr.paymentCredential).toBeDefined()
        expect(baseAddr.stakeCredential).toBeDefined()
      } else {
        expect.fail(`Expected BaseAddress but got ${baseAddr._tag}`)
      }

      // Process an Enterprise Address (type 6)
      const enterpriseAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[6])
      if (enterpriseAddr._tag === "EnterpriseAddress") {
        expect(enterpriseAddr.networkId).toBe(1) // Mainnet
        expect(enterpriseAddr.paymentCredential).toBeDefined()
      } else {
        expect.fail(`Expected EnterpriseAddress but got ${enterpriseAddr._tag}`)
      }

      // Process a Pointer Address (type 4)
      const pointerAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[4])
      if (pointerAddr._tag === "PointerAddress") {
        expect(pointerAddr.networkId).toBe(1) // Mainnet
        expect(pointerAddr.paymentCredential).toBeDefined()
        expect(pointerAddr.pointer).toBeDefined()
      } else {
        expect.fail(`Expected PointerAddress but got ${pointerAddr._tag}`)
      }

      // Process a Reward Account (type 14)
      const rewardAddr = Address.Codec.Decode.bech32(MAINNET_ADDRESSES[8])
      if (rewardAddr._tag === "RewardAccount") {
        expect(rewardAddr.networkId).toBe(1) // Mainnet
        expect(rewardAddr.stakeCredential).toBeDefined()
      } else {
        expect.fail(`Expected RewardAccount but got ${rewardAddr._tag}`)
      }
    })

    it("should validate address network consistency", () => {
      // Test mainnet addresses
      for (const address of MAINNET_ADDRESSES) {
        const addr = Address.Codec.Decode.bech32(address)
        if ("networkId" in addr) {
          expect(addr.networkId).toBe(1)
        }
      }

      // Test testnet addresses
      for (const address of TESTNET_ADDRESSES) {
        const addr = Address.Codec.Decode.bech32(address)
        if ("networkId" in addr) {
          expect(addr.networkId).toBe(0)
        }
      }
    })
  })
})
