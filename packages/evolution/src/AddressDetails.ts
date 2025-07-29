import { Data, Effect, ParseResult, Schema } from "effect"

import * as Address from "./Address.js"
import * as _Bech32 from "./Bech32.js"
import * as Bytes from "./Bytes.js"
import * as _Codec from "./Codec.js"
import * as NetworkId from "./NetworkId.js"

export class AddressDetailsError extends Data.TaggedError("AddressDetailsError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Extended address information with both structured data and serialized formats
 * Contains the address structure and its serialized representations
 *
 * @since 2.0.0
 * @category model
 */

/**
 * Pointer address with payment credential and pointer to stake registration
 *
 * @since 2.0.0
 * @category schemas
 */
export class AddressDetails extends Schema.TaggedClass<AddressDetails>("AddressDetails")("AddressDetails", {
  networkId: NetworkId.NetworkId,
  type: Schema.Union(
    Schema.Literal("BaseAddress"),
    Schema.Literal("EnterpriseAddress"),
    Schema.Literal("PointerAddress"),
    Schema.Literal("RewardAccount"),
    Schema.Literal("ByronAddress")
  ),
  address: Address.Address,
  bech32: _Bech32.Bech32Schema,
  hex: Bytes.HexSchema
}) {}

export const FromBech32 = Schema.transformOrFail(Schema.typeSchema(_Bech32.Bech32Schema), AddressDetails, {
  strict: true,
  encode: (_, __, ___, toA) => ParseResult.succeed(toA.bech32),
  decode: (_, __, ___, fromA) =>
    Effect.gen(function* () {
      const address = yield* ParseResult.decode(Address.FromBech32)(fromA)
      const hex = yield* ParseResult.encode(Address.FromHex)(address)
      return new AddressDetails({
        networkId: address.networkId,
        type: address._tag,
        address,
        bech32: fromA,
        hex
      })
    })
})

export const FromHex = Schema.transformOrFail(Bytes.HexSchema, AddressDetails, {
  strict: true,
  encode: (_, __, ___, toA) => ParseResult.succeed(toA.hex),
  decode: (_, __, ___, fromA) =>
    Effect.gen(function* () {
      const address = yield* ParseResult.decode(Address.FromHex)(fromA)
      const bech32 = yield* ParseResult.encode(Address.FromBech32)(address)
      return new AddressDetails({
        networkId: address.networkId,
        type: address._tag,
        address,
        bech32,
        hex: fromA
      })
    })
})

export const Codec = _Codec.createEncoders(
  {
    bech32: FromBech32,
    hex: FromHex
  },
  AddressDetailsError
)
