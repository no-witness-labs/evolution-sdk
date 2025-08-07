import { Data, Effect as Eff, ParseResult, Schema } from "effect"

import * as Address from "./Address.js"
import * as Bytes from "./Bytes.js"
import * as NetworkId from "./NetworkId.js"

export class AddressDetailsError extends Data.TaggedError("AddressDetailsError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for AddressDetails representing extended address information.
 * Contains the address structure and its serialized representations
 *
 * @since 2.0.0
 * @category schemas
 */
export class AddressDetails extends Schema.Class<AddressDetails>("AddressDetails")({
  networkId: NetworkId.NetworkId,
  type: Schema.Union(
    Schema.Literal("BaseAddress"),
    Schema.Literal("EnterpriseAddress"),
    Schema.Literal("PointerAddress"),
    Schema.Literal("RewardAccount"),
    Schema.Literal("ByronAddress")
  ),
  address: Address.Address,
  bech32: Schema.String,
  hex: Bytes.HexSchema
}) {}

export const FromBech32 = Schema.transformOrFail(Schema.String, AddressDetails, {
  strict: true,
  encode: (_, __, ___, toA) => ParseResult.succeed(toA.bech32),
  decode: (_, __, ___, fromA) =>
    Eff.gen(function* () {
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
    Eff.gen(function* () {
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

/**
 * Create AddressDetails from an Address instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = AddressDetails.make

/**
 * Check if two AddressDetails instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: AddressDetails, that: AddressDetails): boolean => {
  return (
    self.networkId === that.networkId &&
    self.type === that.type &&
    Address.equals(self.address, that.address) &&
    self.bech32 === that.bech32 &&
    self.hex === that.hex
  )
}

/**
 * FastCheck arbitrary for AddressDetails instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = Address.arbitrary.map((address) => fromAddress(address))

/**
 * Create AddressDetails from an Address.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromAddress = (address: Address.Address): AddressDetails => {
  // Use schema encoding to get the serialized formats
  const bech32 = Eff.runSync(Schema.encode(Address.FromBech32)(address))
  const hex = Eff.runSync(Schema.encode(Address.FromHex)(address))
  return new AddressDetails({
    networkId: address.networkId,
    type: address._tag,
    address,
    bech32,
    hex
  })
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse AddressDetails from Bech32 string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBech32 = (bech32: string): AddressDetails =>
  Eff.runSync(Effect.fromBech32(bech32))

/**
 * Parse AddressDetails from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): AddressDetails =>
  Eff.runSync(Effect.fromHex(hex))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert AddressDetails to Bech32 string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBech32 = (details: AddressDetails): string =>
  Eff.runSync(Effect.toBech32(details))

/**
 * Convert AddressDetails to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (details: AddressDetails): string =>
  Eff.runSync(Effect.toHex(details))

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 * Returns Effect<Success, Error> for composable error handling.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse AddressDetails from Bech32 string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBech32 = (bech32: string) =>
    Eff.mapError(
      Schema.decode(FromBech32)(bech32),
      (error) => new AddressDetailsError({ message: "Failed to decode AddressDetails from Bech32", cause: error })
    )

  /**
   * Parse AddressDetails from hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string) =>
    Eff.mapError(
      Schema.decode(FromHex)(hex),
      (error) => new AddressDetailsError({ message: "Failed to decode AddressDetails from hex", cause: error })
    )

  /**
   * Convert AddressDetails to Bech32 string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBech32 = (details: AddressDetails) =>
    Eff.mapError(
      Schema.encode(FromBech32)(details),
      (error) => new AddressDetailsError({ message: "Failed to encode AddressDetails to Bech32", cause: error })
    )

  /**
   * Convert AddressDetails to hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (details: AddressDetails) =>
    Eff.mapError(
      Schema.encode(FromHex)(details),
      (error) => new AddressDetailsError({ message: "Failed to encode AddressDetails to hex", cause: error })
    )
}
