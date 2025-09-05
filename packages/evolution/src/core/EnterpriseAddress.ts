import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes29 from "./Bytes29.js"
import * as Credential from "./Credential.js"
import * as Function from "./Function.js"
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
}) {
  toString(): string {
    return `EnterpriseAddress { networkId: ${this.networkId}, paymentCredential: ${this.paymentCredential} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

export const FromBytes = Schema.transformOrFail(Bytes29.BytesSchema, Schema.typeSchema(EnterpriseAddress), {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      const paymentBit = toA.paymentCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b01 << 6) | (0b1 << 5) | (paymentBit << 4) | (toA.networkId & 0b00001111)

      const result = new Uint8Array(29)
      result[0] = header

      const paymentCredentialBytes = toA.paymentCredential.hash
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
        ? new KeyHash.KeyHash({
            hash: fromA.slice(1, 29)
          })
        : new ScriptHash.ScriptHash({
            hash: fromA.slice(1, 29)
          })
      return EnterpriseAddress.make({
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
 * Smart constructor for EnterpriseAddress.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Schema.decodeSync(EnterpriseAddress)

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
  ([networkId, paymentCredential]) => new EnterpriseAddress({ networkId, paymentCredential })
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a EnterpriseAddress from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, EnterpriseAddressError, "EnterpriseAddress.fromBytes")

/**
 * Parse a EnterpriseAddress from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, EnterpriseAddressError, "EnterpriseAddress.fromHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a EnterpriseAddress to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, EnterpriseAddressError, "EnterpriseAddress.toBytes")

/**
 * Convert a EnterpriseAddress to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, EnterpriseAddressError, "EnterpriseAddress.toHex")

// ============================================================================
// Either Namespace - Either-based Error Handling
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse a EnterpriseAddress from bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, EnterpriseAddressError)

  /**
   * Parse a EnterpriseAddress from hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, EnterpriseAddressError)

  /**
   * Convert a EnterpriseAddress to bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, EnterpriseAddressError)

  /**
   * Convert a EnterpriseAddress to hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, EnterpriseAddressError)
}
