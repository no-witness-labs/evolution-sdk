import { Data, Effect, FastCheck, ParseResult, pipe, Schema } from "effect"

import * as BaseAddress from "./BaseAddress.js"
import * as Bech32 from "./Bech32.js"
import * as ByronAddress from "./ByronAddress.js"
import * as Bytes from "./Bytes.js"
import { createEncoders } from "./Codec.js"
import * as EnterpriseAddress from "./EnterpriseAddress.js"
import * as PointerAddress from "./PointerAddress.js"
import * as RewardAccount from "./RewardAccount.js"

/**
 * CDDL specs
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
export const Address = Schema.Union(
  BaseAddress.BaseAddress,
  EnterpriseAddress.EnterpriseAddress,
  PointerAddress.PointerAddress,
  RewardAccount.RewardAccount,
  ByronAddress.ByronAddress
)

/**
 * Type representing an address.
 *
 * @since 2.0.0
 * @category model
 */
export type Address = typeof Address.Type

/**
 * Schema for encoding/decoding addresses as bytes.
 *
 * @since 2.0.0
 * @category schema
 */
export const FromBytes = Schema.transformOrFail(Schema.Uint8ArrayFromSelf, Address, {
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
    Effect.gen(function* () {
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
export const FromBech32 = Schema.transformOrFail(Schema.typeSchema(Bech32.Bech32Schema), Address, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Effect.gen(function* () {
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
          prefix = ""
          break
      }
      const b = yield* ParseResult.decode(Bech32.FromBytes(prefix))(bytes)
      return b
    }),
  decode: (fromI) => pipe(ParseResult.encode(Bech32.FromBytes())(fromI), Effect.flatMap(ParseResult.decode(FromBytes)))
})

/**
 * Checks if two addresses are equal.
 *
 * @since 2.0.0
 * @category utils
 */
export const equals = (a: Address, b: Address): boolean => {
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
 * FastCheck generator for addresses.
 *
 * @since 2.0.0
 * @category testing
 */
export const generator = FastCheck.oneof(
  BaseAddress.generator,
  EnterpriseAddress.generator,
  PointerAddress.generator,
  RewardAccount.generator
)

/**
 * Codec utilities for addresses.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bech32: FromBech32,
    hex: FromHex,
    bytes: FromBytes
  },
  AddressError
)
