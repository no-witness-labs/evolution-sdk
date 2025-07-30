import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes57 from "./Bytes57.js"
import * as _Codec from "./Codec.js"
import * as Credential from "./Credential.js"
import * as KeyHash from "./KeyHash.js"
import * as NetworkId from "./NetworkId.js"
import * as ScriptHash from "./ScriptHash.js"

export class BaseAddressError extends Data.TaggedError("BaseAddressError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Base address with both payment and staking credentials
 *
 * @since 2.0.0
 * @category schemas
 */
export class BaseAddress extends Schema.TaggedClass<BaseAddress>("BaseAddress")("BaseAddress", {
  networkId: NetworkId.NetworkId,
  paymentCredential: Credential.Credential,
  stakeCredential: Credential.Credential
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "BaseAddress",
      networkId: this.networkId,
      paymentCredential: this.paymentCredential,
      stakeCredential: this.stakeCredential
    }
  }
}

export const FromBytes = Schema.transformOrFail(Bytes57.BytesSchema, BaseAddress, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Effect.gen(function* () {
      const paymentBit = toA.paymentCredential._tag === "KeyHash" ? 0 : 1
      const stakeBit = toA.stakeCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b00 << 6) | (stakeBit << 5) | (paymentBit << 4) | (toA.networkId & 0b00001111)
      const result = new Uint8Array(57)
      result[0] = header
      // const paymentCredentialBytes = Bytes.Decode.hex(
      //   toA.paymentCredential.hash,
      // );
      const paymentCredentialBytes = yield* ParseResult.decode(Bytes.FromHex)(toA.paymentCredential.hash)
      result.set(paymentCredentialBytes, 1)
      const stakeCredentialBytes = yield* ParseResult.decode(Bytes.FromHex)(toA.stakeCredential.hash)
      result.set(stakeCredentialBytes, 29)
      return yield* ParseResult.succeed(result)
    }),
  decode: (fromI, options, ast, fromA) =>
    Effect.gen(function* () {
      const header = fromA[0]
      // Extract network ID from the lower 4 bits
      const networkId = header & 0b00001111
      // Extract address type from the upper 4 bits (bits 4-7)
      const addressType = header >> 4
      // Script payment, Script stake
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
      const isStakeKey = (addressType & 0b0010) === 0
      const stakeCredential: Credential.Credential = isStakeKey
        ? {
            _tag: "KeyHash",
            hash: yield* ParseResult.decode(KeyHash.FromBytes)(fromA.slice(29, 57))
          }
        : {
            _tag: "ScriptHash",
            hash: yield* ParseResult.decode(ScriptHash.BytesSchema)(fromA.slice(29, 57))
          }
      return yield* ParseResult.decode(BaseAddress)({
        _tag: "BaseAddress",
        networkId,
        paymentCredential,
        stakeCredential
      })
    })
}).annotations({
  identifier: "BaseAddress.FromBytes"
})

export const FromHex = Schema.compose(Bytes.FromHex, FromBytes).annotations({
  identifier: "BaseAddress.FromHex"
})

/**
 * Check if two BaseAddress instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BaseAddress, b: BaseAddress): boolean => {
  return (
    a.networkId === b.networkId &&
    Credential.equals(a.paymentCredential, b.paymentCredential) &&
    Credential.equals(a.stakeCredential, b.stakeCredential)
  )
}

/**
 * Generate a random BaseAddress.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.tuple(NetworkId.generator, Credential.generator, Credential.generator).map(
  ([networkId, paymentCredential, stakeCredential]) =>
    new BaseAddress({
      networkId,
      paymentCredential,
      stakeCredential
    })
)

export const Codec = _Codec.createEncoders(
  {
    hex: FromHex,
    bytes: FromBytes
  },
  BaseAddressError
)
