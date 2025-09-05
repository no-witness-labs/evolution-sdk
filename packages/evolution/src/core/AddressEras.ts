import { bech32 } from "@scure/base"
import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as BaseAddress from "./BaseAddress.js"
import * as ByronAddress from "./ByronAddress.js"
import * as Bytes from "./Bytes.js"
import * as EnterpriseAddress from "./EnterpriseAddress.js"
import * as Function from "./Function.js"
import * as PointerAddress from "./PointerAddress.js"
import * as RewardAccount from "./RewardAccount.js"

/**
 * CDDL specs
 * ```
 * ; address format:
 * ;   [ 8 bit header | payload ];
 * ;
 * ; shelley payment addresses:
 * ;      bit 7: 0
 * ;      bit 6: base/other
 * ;      bit 5: pointer/enterprise [for base: stake cred is keyhash/scripthash]
 * ;      bit 4: payment cred is keyhash/scripthash
 * ;   bits 3-0: network id
 * ;
 * ; reward addresses:
 * ;   bits 7-5: 111
 * ;      bit 4: credential is keyhash/scripthash
 * ;   bits 3-0: network id
 * ;
 * ; byron addresses:
 * ;   bits 7-4: 1000
 * ;
 * ;      0000: base address: keyhash28,keyhash28
 * ;      0001: base address: scripthash28,keyhash28
 * ;      0010: base address: keyhash28,scripthash28
 * ;      0011: base address: scripthash28,scripthash28
 * ;      0100: pointer address: keyhash28, 3 variable length uint
 * ;      0101: pointer address: scripthash28, 3 variable length uint
 * ;      0110: enterprise address: keyhash28
 * ;      0111: enterprise address: scripthash28
 * ;      1000: byron address
 * ;      1110: reward account: keyhash28
 * ;      1111: reward account: scripthash28
 * ;      1001-1101: future formats
 * ```
 */

/**
 * Error thrown when address operations fail
 *
 * @since 2.0.0
 * @category model
 */
export class AddressError extends Data.TaggedError("AddressError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Union type representing all possible address types.
 *
 * @since 2.0.0
 * @category model
 */
export const AddressEras = Schema.Union(
  BaseAddress.BaseAddress,
  EnterpriseAddress.EnterpriseAddress,
  PointerAddress.PointerAddress,
  RewardAccount.RewardAccount,
  ByronAddress.ByronAddress
)

export const isAddress = Schema.is(AddressEras)

/**
 * Type representing an address.
 *
 * @since 2.0.0
 * @category model
 */
export type AddressEras = typeof AddressEras.Type

/**
 * Schema for encoding/decoding addresses as bytes.
 *
 * @since 2.0.0
 * @category schema
 */
export const FromBytes = Schema.transformOrFail(Schema.Uint8ArrayFromSelf, Schema.typeSchema(AddressEras), {
  strict: true,
  encode: (_, __, ___, toA) => {
    switch (toA._tag) {
      case "BaseAddress":
        return ParseResult.encode(BaseAddress.FromBytes)(toA)
      case "EnterpriseAddress":
        return ParseResult.encode(EnterpriseAddress.FromBytes)(toA)
      case "PointerAddress":
        return ParseResult.encode(PointerAddress.FromBytes)(toA)
      case "RewardAccount":
        return ParseResult.encode(RewardAccount.FromBytes)(toA)
      case "ByronAddress":
        return ParseResult.encode(ByronAddress.BytesSchema)(toA)
    }
  },
  decode: (_, __, ast, fromA) =>
    Eff.gen(function* () {
      const header = fromA[0]
      // Extract address type from the upper 4 bits (bits 4-7)
      const addressType = header >> 4

      switch (addressType) {
        // Base address types (0000, 0001, 0010, 0011)
        // Format: [payment credential, stake credential]
        case 0b0000: // Key payment, Key stake
        case 0b0001: // Script payment, Key stake
        case 0b0010: // Key payment, Script stake
        case 0b0011:
          return yield* ParseResult.decode(BaseAddress.FromBytes)(fromA)

        // Enterprise address types (0110, 0111)
        // Format: [payment credential only]
        case 0b0110: // Key payment
        case 0b0111:
          return yield* ParseResult.decode(EnterpriseAddress.FromBytes)(fromA)

        // Pointer address types (0100, 0101)
        // Format: [payment credential, variable length integers for slot, txIndex, certIndex]
        case 0b0100: // Key payment with pointer
        case 0b0101:
          return yield* ParseResult.decode(PointerAddress.FromBytes)(fromA)

        case 0b1110:
        case 0b1111:
          return yield* ParseResult.decode(RewardAccount.FromBytes)(fromA)

        case 0b1000:
          return yield* ParseResult.decode(ByronAddress.BytesSchema)(fromA)

        default:
          return yield* ParseResult.fail(new ParseResult.Type(ast, fromA, `Unknown address type: ${addressType}`))
      }
    })
})

/**
 * Schema for encoding/decoding addresses as hex strings.
 *
 * @since 2.0.0
 * @category schema
 */
export const FromHex = Schema.compose(Bytes.FromHex, FromBytes)

/**
 * Schema for encoding/decoding addresses as Bech32 strings.
 *
 * @since 2.0.0
 * @category schema
 */
export const FromBech32 = Schema.transformOrFail(Schema.String, Schema.typeSchema(AddressEras), {
  strict: true,
  encode: (_, __, ast, toA) =>
    Eff.gen(function* () {
      const bytes = yield* ParseResult.encode(FromBytes)(toA)
      let prefix: string
      switch (toA._tag) {
        case "BaseAddress":
        case "EnterpriseAddress":
        case "PointerAddress":
          prefix = toA.networkId === 0 ? "addr_test" : "addr"
          break
        case "RewardAccount":
          prefix = toA.networkId === 0 ? "stake_test" : "stake"
          break
        case "ByronAddress":
          return yield* ParseResult.fail(
            new ParseResult.Type(ast, toA, "Byron addresses do not support Bech32 encoding")
          )
      }
      const result = yield* Eff.try({
        try: () => {
          const words = bech32.toWords(bytes)
          return bech32.encode(prefix, words, false)
        },
        catch: (error) => new ParseResult.Type(ast, toA, `Failed to encode Bech32: ${(error as Error).message}`)
      })
      return result
    }),
  decode: (fromA, _, ast) =>
    Eff.gen(function* () {
      const result = yield* Eff.try({
        try: () => {
          const decoded = bech32.decode(fromA as any, false)
          const bytes = bech32.fromWords(decoded.words)
          return new Uint8Array(bytes)
        },
        catch: (error) => new ParseResult.Type(ast, fromA, `Failed to decode Bech32: ${(error as Error).message}`)
      })
      return yield* ParseResult.decode(FromBytes)(result)
    })
}).annotations({
  identifier: "Address.FromBech32",
  description: "Transforms Bech32 string to Address"
})

/**
 * Checks if two addresses are equal.
 *
 * @since 2.0.0
 * @category utils
 */
export const equals = (a: AddressEras, b: AddressEras): boolean => {
  if (a._tag !== b._tag) {
    return false
  }
  switch (a._tag) {
    case "BaseAddress":
      return BaseAddress.equals(a, b as BaseAddress.BaseAddress)
    case "EnterpriseAddress":
      return EnterpriseAddress.equals(a, b as EnterpriseAddress.EnterpriseAddress)
    case "PointerAddress":
      return PointerAddress.equals(a, b as PointerAddress.PointerAddress)
    case "RewardAccount":
      return RewardAccount.equals(a, b as RewardAccount.RewardAccount)
    case "ByronAddress":
      return false
  }
}

/**
 * FastCheck arbitrary for Address instances.
 *
 * @since 2.0.0
 * @category arbitrary
 *
 */
export const arbitrary = FastCheck.oneof(
  BaseAddress.arbitrary,
  EnterpriseAddress.arbitrary,
  PointerAddress.arbitrary,
  RewardAccount.arbitrary
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse an Address from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, AddressError, "Address.fromBytes")

/**
 * Parse an Address from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, AddressError, "Address.fromHex")

/**
 * Parse an Address from Bech32 string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBech32 = Function.makeDecodeSync(FromBech32, AddressError, "Address.fromBech32")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert an Address to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, AddressError, "Address.toBytes")

/**
 * Convert an Address to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, AddressError, "Address.toHex")

/**
 * Convert an Address to Bech32 string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBech32 = Function.makeEncodeSync(FromBech32, AddressError, "Address.toBech32")

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, AddressError)
  export const fromHex = Function.makeDecodeEither(FromHex, AddressError)
  export const fromBech32 = Function.makeDecodeEither(FromBech32, AddressError)

  export const toBytes = Function.makeEncodeEither(FromBytes, AddressError)
  export const toHex = Function.makeEncodeEither(FromHex, AddressError)
  export const toBech32 = Function.makeEncodeEither(FromBech32, AddressError)
}
