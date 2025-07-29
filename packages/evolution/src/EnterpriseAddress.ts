import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes29 from "./Bytes29.js"
import * as _Codec from "./Codec.js"
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
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "EnterpriseAddress",
      networkId: this.networkId,
      paymentCredential: this.paymentCredential
    }
  }
}

export const FromBytes = Schema.transformOrFail(Bytes29.BytesSchema, EnterpriseAddress, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Effect.gen(function* () {
      const paymentBit = toA.paymentCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b01 << 6) | (0b1 << 5) | (paymentBit << 4) | (toA.networkId & 0b00001111)

      const result = new Uint8Array(29)
      result[0] = header

      const paymentCredentialBytes = yield* ParseResult.decode(Bytes.FromHex)(toA.paymentCredential.hash)
      result.set(paymentCredentialBytes, 1)

      return yield* ParseResult.succeed(result)
    }),
  decode: (_, __, ___, fromA) =>
    Effect.gen(function* () {
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
            hash: yield* ParseResult.decode(ScriptHash.BytesSchema)(fromA.slice(1, 29))
          }
      return yield* ParseResult.decode(EnterpriseAddress)({
        _tag: "EnterpriseAddress",
        networkId,
        paymentCredential
      })
    })
})

export const FromHex = Schema.compose(
  Bytes.FromHex, // string → Uint8Array
  FromBytes // Uint8Array → EnterpriseAddress
)

/**
 * Check if two EnterpriseAddress instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: EnterpriseAddress, b: EnterpriseAddress): boolean => {
  return (
    a.networkId === b.networkId &&
    a.paymentCredential._tag === b.paymentCredential._tag &&
    a.paymentCredential.hash === b.paymentCredential.hash
  )
}

/**
 * Generate a random EnterpriseAddress.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.tuple(NetworkId.generator, Credential.generator).map(
  ([networkId, paymentCredential]) =>
    new EnterpriseAddress({
      networkId,
      paymentCredential
    })
)

export const Codec = _Codec.createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  EnterpriseAddressError
)
