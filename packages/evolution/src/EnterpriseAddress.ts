import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes29 from "./Bytes29.js"
import * as Credential from "./Credential.js"
import * as KeyHash from "./KeyHash.js"
import * as NetworkId from "./NetworkId.js"
import * as ScriptHash from "./ScriptHash.js"

export class EnterpriseAddressError extends Data.TaggedError("EnterpriseAddressError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Enterprise address with only payment credential
 *
 * @since 2.0.0
 * @category schemas
 */
export class EnterpriseAddress extends Schema.TaggedClass<EnterpriseAddress>("EnterpriseAddress")("EnterpriseAddress", {
  networkId: NetworkId.NetworkId,
  paymentCredential: Credential.Credential
}) {}

export const FromBytes = Schema.transformOrFail(Bytes29.BytesSchema, EnterpriseAddress, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      const paymentBit = toA.paymentCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b01 << 6) | (0b1 << 5) | (paymentBit << 4) | (toA.networkId & 0b00001111)

      const result = new Uint8Array(29)
      result[0] = header

      const paymentCredentialBytes = yield* ParseResult.decode(Bytes.FromHex)(toA.paymentCredential.hash)
      result.set(paymentCredentialBytes, 1)

      return yield* ParseResult.succeed(result)
    }),
  decode: (_, __, ___, fromA) =>
    Eff.gen(function* () {
      const header = fromA[0]
      // Extract network ID from the lower 4 bits
      const networkId = header & 0b00001111
      // Extract address type from the upper 4 bits (bits 4-7)
      const addressType = header >> 4

      // Script payment
      const isPaymentKey = (addressType & 0b0001) === 0
      const paymentCredential: Credential.Credential = isPaymentKey
        ? {
            _tag: "KeyHash",
            hash: yield* ParseResult.decode(KeyHash.FromBytes)(fromA.slice(1, 29))
          }
        : {
            _tag: "ScriptHash",
            hash: yield* ParseResult.decode(ScriptHash.FromBytes)(fromA.slice(1, 29))
          }
      return yield* ParseResult.decode(EnterpriseAddress)({
        _tag: "EnterpriseAddress",
        networkId,
        paymentCredential
      })
    })
}).annotations({
  identifier: "EnterpriseAddress.FromBytes",
  description: "Transforms raw bytes to EnterpriseAddress"
})

export const FromHex = Schema.compose(
  Bytes.FromHex, // string → Uint8Array
  FromBytes // Uint8Array → EnterpriseAddress
).annotations({
  identifier: "EnterpriseAddress.FromHex",
  description: "Transforms raw hex string to EnterpriseAddress"
})

/**
 * Smart constructor for creating EnterpriseAddress instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (props: {
  networkId: NetworkId.NetworkId
  paymentCredential: Credential.Credential
}): EnterpriseAddress => new EnterpriseAddress(props)

/**
 * Check if two EnterpriseAddress instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: EnterpriseAddress, b: EnterpriseAddress): boolean => {
  return a.networkId === b.networkId && Credential.equals(a.paymentCredential, b.paymentCredential)
}

/**
 * FastCheck arbitrary for generating random EnterpriseAddress instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.tuple(NetworkId.arbitrary, Credential.arbitrary).map(
  ([networkId, paymentCredential]) => make({ networkId, paymentCredential })
)

/**
 * Effect namespace for EnterpriseAddress operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Convert bytes to EnterpriseAddress using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromBytes = (bytes: Uint8Array) =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) => new EnterpriseAddressError({ message: "Failed to decode from bytes", cause })
    )

  /**
   * Convert hex string to EnterpriseAddress using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromHex = (hex: string) =>
    Eff.mapError(
      Schema.decode(FromHex)(hex),
      (cause) => new EnterpriseAddressError({ message: "Failed to decode from hex", cause })
    )

  /**
   * Convert EnterpriseAddress to bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toBytes = (address: EnterpriseAddress) =>
    Eff.mapError(
      Schema.encode(FromBytes)(address),
      (cause) => new EnterpriseAddressError({ message: "Failed to encode to bytes", cause })
    )

  /**
   * Convert EnterpriseAddress to hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toHex = (address: EnterpriseAddress) =>
    Eff.mapError(
      Schema.encode(FromHex)(address),
      (cause) => new EnterpriseAddressError({ message: "Failed to encode to hex", cause })
    )
}

/**
 * Convert bytes to EnterpriseAddress (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromBytes = (bytes: Uint8Array): EnterpriseAddress => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Convert hex string to EnterpriseAddress (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromHex = (hex: string): EnterpriseAddress => Eff.runSync(Effect.fromHex(hex))

/**
 * Convert EnterpriseAddress to bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toBytes = (address: EnterpriseAddress): Uint8Array => Eff.runSync(Effect.toBytes(address))

/**
 * Convert EnterpriseAddress to hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toHex = (address: EnterpriseAddress): string => Eff.runSync(Effect.toHex(address))
