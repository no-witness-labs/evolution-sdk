import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { UnknownException } from "effect/Cause"

import * as Address from "../src/Address.js"
import * as AddressDetails from "../src/AddressDetails.js"
import * as AddressTag from "../src/AddressTag.js"
import * as Bech32 from "../src/Bech32.js"
import * as Bytes from "../src/Bytes.js"
import * as Header from "../src/Header.js"
import { PointerAddress } from "../src/index.js"
import * as Positive from "../src/Natural.js"
import * as Network from "../src/Network.js"
import * as PaymentAddress from "../src/PaymentAddress.js"
import * as RewardAddress from "../src/RewardAddress.js"

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
]

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
]

// Combine all addresses for tests that need to check all
const ALL_ADDRESSES = [...MAINNET_ADDRESSES, ...TESTNET_ADDRESSES]

// Other test constants
const INVALID_ADDRESS = "not-an-address"
const VALID_HEX_ADDRESSES = [
  "019493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e337b62cfff6403a06a3acbc34f8c46003c69fe79a3628cefa9c47251",
  "60ba1d6b6283c219a0530e3682c316215d55819cf97bbf26552c6f8530"
]

// Helper function to get specific address types from the arrays
const getAddressByType = (
  type: "base" | "pointer" | "enterprise" | "stake",
  network: "mainnet" | "testnet" = "mainnet",
  index = 0
): string => {
  const addresses = network === "mainnet" ? MAINNET_ADDRESSES : TESTNET_ADDRESSES

  switch (type) {
    case "base":
      // Base addresses are at indexes 0-3
      return addresses[index % 4]
    case "pointer":
      // Pointer addresses are at indexes 4-5
      return addresses[4 + (index % 2)]
    case "enterprise":
      // Enterprise addresses are at indexes 6-7
      return addresses[6 + (index % 2)]
    case "stake":
      // Stake addresses are at indexes 8-9
      return addresses[8 + (index % 2)]
    default:
      return addresses[0]
  }
}

describe("Address Validation", () => {
  it("should validate payment addresses correctly", () => {
    // Valid payment addresses - first 8 addresses in each network array are payment addresses
    ALL_ADDRESSES.slice(0, 8)
      .concat(ALL_ADDRESSES.slice(10, 18))
      .forEach((address) => {
        expect(PaymentAddress.isPaymentAddress(address)).toBe(true)
      })

    // Valid reward addresses (not payment addresses)
    // Addresses at indices 8-9 and 18-19 are stake/reward addresses
    ;[8, 9, 18, 19].forEach((index) => {
      expect(PaymentAddress.isPaymentAddress(ALL_ADDRESSES[index])).toBe(false)
    })

    // Invalid addresses
    expect(PaymentAddress.isPaymentAddress(INVALID_ADDRESS)).toBe(false)
  })

  it("should validate reward addresses correctly", () => {
    // Valid reward addresses - addresses at indices 8-9 and 18-19
    ;[8, 9, 18, 19].forEach((index) => {
      expect(RewardAddress.isRewardAddress(ALL_ADDRESSES[index])).toBe(true)
    })

    // Valid payment addresses (not reward addresses)
    ALL_ADDRESSES.slice(0, 8)
      .concat(ALL_ADDRESSES.slice(10, 18))
      .forEach((address) => {
        expect(RewardAddress.isRewardAddress(address)).toBe(false)
      })

    // Invalid addresses
    expect(RewardAddress.isRewardAddress(INVALID_ADDRESS)).toBe(false)
  })
  it("should encode and decode hex addresses correctly", () => {
    // Test encoding and decoding of valid hex addresses
    VALID_HEX_ADDRESSES.forEach((hex) => {
      const address = Address.Codec.Decode.hex(hex)
      expect(address).toBeDefined()
      expect(Address.Codec.Encode.hex(address)).toBe(hex)
    })
  })
  it("should encode specific hex address to expected bech32 format", () => {
    const hexAddress = "60ba1d6b6283c219a0530e3682c316215d55819cf97bbf26552c6f8530"
    const expectedBech32 = "addr_test1vzap66mzs0ppngznpcmg9scky9w4tqvul9am7fj493hc2vq4ry02m"

    const address = Address.Codec.Decode.hex(hexAddress)
    const actualBech32 = Address.Codec.Encode.bech32(address)

    expect(actualBech32).toBe(expectedBech32)
  })
})

//FIX:
// describe("Address Conversion", () => {
//   it.effect("should convert between bech32 and bytes representation", () =>
//     Effect.gen(function* () {
//       for (const address of ALL_ADDRESSES) {
//         const bytes = yield* Bech32.toBytes(address);
//         expect(bytes).toBeInstanceOf(Uint8Array);
//         expect(bytes.length).toBeGreaterThan(0);
//       }
//     }),
//   );

//   it.effect("should extract header from bech32 address", () =>
//     Effect.gen(function* () {
//       for (const address of ALL_ADDRESSES) {
//         const header = yield* Header.fromBech32(address);
//         expect(typeof header).toBe("number");
//         expect(header).toBeGreaterThanOrEqual(0);
//       }
//     }),
//   );

//   it.effect("should convert address to hex and back", () =>
//     Effect.gen(function* () {
//       for (const address of ALL_ADDRESSES.slice(0, 8)) {
//         // Skip reward addresses for this test
//         const addressInfo = yield* Address.fromBech32(address);
//         const hex = Address.toHex(addressInfo);
//         expect(hex).toMatch(/^[0-9a-f]+$/i);

//         // Convert back from hex
//         const fromHex = yield* Address.fromBytes(Bytes.fromHexOrThrow(hex));
//         const backToBech32 = Address.toBech32(fromHex);
//         expect(backToBech32).toBe(address);
//       }
//     }),
//   );

//   it.effect("should fail with proper error for invalid addresses", () =>
//     Effect.gen(function* () {
//       const result = yield* Effect.flip(Bech32.toBytes(INVALID_ADDRESS));
//       expect(result).toBeInstanceOf(Bech32.Bech32Error);
//     }),
//   );
// });

// describe("Address Information Extraction", () => {
//   it("should extract address tag from header", () => {
//     // Using binary patterns to match the address format specification
//     // Format: First 4 bits determine the address type
//     const testCases = [
//       { header: 0b0000, tag: "Base" },
//       { header: 0b0001, tag: "Base" },
//       { header: 0b0010, tag: "Base" },
//       { header: 0b0011, tag: "Base" },
//       { header: 0b0100, tag: "Pointer" },
//       { header: 0b0101, tag: "Pointer" },
//       { header: 0b0110, tag: "Enterprise" },
//       { header: 0b0111, tag: "Enterprise" },
//       { header: 0b1000, tag: "Byron" },
//       { header: 0b1110, tag: "Reward" },
//       { header: 0b1111, tag: "Reward" },
//     ];

//     // Test each specific header value as defined in the specification
//     testCases.forEach(({ header, tag }) => {
//       // Also test with network bit (5th bit) set to 1
//       // This shouldn't change the address type interpretation
//       const withNetworkBit = (header << 4) | 0b1000;
//       expect(AddressTag.fromHeader(withNetworkBit)).toBe(tag);
//     });
//   });

//   it.effect("should extract address tag from bech32", () =>
//     Effect.gen(function* () {
//       // Base addresses
//       const baseTag = yield* AddressTag.fromBech32(
//         getAddressByType("base", "mainnet"),
//       );
//       expect(baseTag).toBe("Base");

//       // Enterprise addresses
//       const enterpriseTag = yield* AddressTag.fromBech32(
//         getAddressByType("enterprise", "mainnet"),
//       );
//       expect(enterpriseTag).toBe("Enterprise");

//       // Pointer addresses
//       const pointerTag = yield* AddressTag.fromBech32(
//         getAddressByType("pointer", "mainnet"),
//       );
//       expect(pointerTag).toBe("Pointer");

//       // Stake/Reward addresses - both stake and stake_test prefixes are for reward addresses
//       const stakeTag = yield* AddressTag.fromBech32(
//         getAddressByType("stake", "mainnet"),
//       );
//       expect(stakeTag).toBe("Reward");

//       const testnetStakeTag = yield* AddressTag.fromBech32(
//         getAddressByType("stake", "testnet"),
//       );
//       expect(testnetStakeTag).toBe("Reward");
//     }),
//   );

//   it.effect("should extract network ID from bech32", () =>
//     Effect.gen(function* () {
//       // Mainnet addresses should have networkId 1
//       for (const address of MAINNET_ADDRESSES) {
//         const networkId = yield* Network.fromBech32(address);
//         expect(networkId).toBe(1);
//       }

//       // Testnet addresses should have networkId 0
//       for (const address of TESTNET_ADDRESSES) {
//         const networkId = yield* Network.fromBech32(address);
//         expect(networkId).toBe(0);
//       }
//     }),
//   );

//   it.effect("should extract complete address details from bech32", () =>
//     Effect.gen(function* () {
//       const address = getAddressByType("base", "mainnet");
//       const details = yield* AddressDetails.fromBech32(address);

//       // Verify structure
//       expect(details._tag).toBe("BaseAddress");
//       // expect(details.networkId).toBe(1);
//       // expect(details.paymentCredential).toBeDefined();
//       // expect(details.stakeCredential).toBeDefined();
//       expect(details.address.bech32).toBe(address);
//       expect(details.address.hex).toMatch(/^[0-9a-f]+$/i);

//       // For enterprise address
//       const enterpriseAddress = getAddressByType("enterprise", "mainnet");
//       const enterpriseDetails =
//         yield* AddressDetails.fromBech32(enterpriseAddress);
//       expect(enterpriseDetails._tag).toBe("EnterpriseAddress");
//       // expect(enterpriseDetails.paymentCredential).toBeDefined();

//       // For stake/reward address
//       const stakeAddress = getAddressByType("stake", "mainnet");
//       const stakeDetails = yield* AddressDetails.fromBech32(stakeAddress);
//       expect(stakeDetails._tag).toBe("RewardAccount");
//       // expect(stakeDetails.stakeCredential).toBeDefined();
//     }),
//   );

//   it.effect("should handle address details from hex", () =>
//     Effect.gen(function* () {
//       const details = yield* AddressDetails.fromHex(VALID_HEX_ADDRESS);
//       expect(details).toBeDefined();
//       expect(details.address.hex).toBe(VALID_HEX_ADDRESS);
//       expect(details.address.bech32).toMatch(MAINNET_ADDRESSES[0]); // Should be a mainnet address
//     }),
//   );

//   it.effect(
//     "should auto-detect and extract details from either bech32 or hex",
//     () =>
//       Effect.gen(function* () {
//         // From bech32
//         const address = getAddressByType("base", "mainnet");
//         const bech32Details = yield* AddressDetails.fromString(address);
//         expect(bech32Details.address.bech32).toBe(address);

//         // From hex
//         const hexDetails = yield* AddressDetails.fromString(VALID_HEX_ADDRESS);
//         expect(hexDetails.address.hex).toBe(VALID_HEX_ADDRESS);
//       }),
//   );
// });

// describe("Error Handling", () => {
//   it.effect("should properly handle malformed addresses", () =>
//     Effect.gen(function* () {
//       const result = yield* Effect.flip(Address.fromBech32(INVALID_ADDRESS));
//       expect(result).toBeInstanceOf(Bech32.Bech32Error);
//     }),
//   );

//   it.effect(
//     "should properly handle variable length integer encoding errors",
//     () =>
//       Effect.gen(function* () {
//         const result = yield* Effect.try(() =>
//           PointerAddress.encodeVariableLength(Positive.makeOrThrow(-1)),
//         ).pipe(Effect.flip);
//         expect(result).toBeInstanceOf(UnknownException);
//       }),
//   );

//   it.effect("should handle invalid decoding of variable length integers", () =>
//     Effect.gen(function* () {
//       // Create a buffer that's too short
//       const bytes = new Uint8Array([0x80]); // High bit set, but no more bytes
//       const result = yield* Effect.flip(
//         PointerAddress.decodeVariableLength(bytes),
//       );
//       expect(result).toBeInstanceOf(PointerAddress.PointerAddressError);
//     }),
//   );
// });
