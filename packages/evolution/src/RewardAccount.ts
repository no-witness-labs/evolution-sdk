import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes29 from "./Bytes29.js"
import * as _Codec from "./Codec.js"
import * as Credential from "./Credential.js"
import * as KeyHash from "./KeyHash.js"
import * as NetworkId from "./NetworkId.js"
import * as ScriptHash from "./ScriptHash.js"

export class RewardAccountError extends Data.TaggedError("RewardAccountError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Reward/stake address with only staking credential
 *
 * @since 2.0.0
 * @category schemas
 */
export class RewardAccount extends Schema.TaggedClass<RewardAccount>("RewardAccount")("RewardAccount", {
  networkId: NetworkId.NetworkId,
  stakeCredential: Credential.Credential
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "RewardAccount",
      networkId: this.networkId,
      stakeCredential: this.stakeCredential
    }
  }
}

export const FromBytes = Schema.transformOrFail(Bytes29.BytesSchema, RewardAccount, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Effect.gen(function* () {
      const stakingBit = toA.stakeCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b111 << 5) | (stakingBit << 4) | (toA.networkId & 0b00001111)
      const result = new Uint8Array(29)
      result[0] = header
      const stakeCredentialBytes = yield* ParseResult.decode(Bytes.FromHex)(toA.stakeCredential.hash)
      result.set(stakeCredentialBytes, 1)
      return yield* ParseResult.succeed(result)
    }),
  decode: (_, __, ___, fromA) =>
    Effect.gen(function* () {
      const header = fromA[0]
      // Extract network ID from the lower 4 bits
      const networkId = header & 0b00001111
      // Extract address type from the upper 4 bits (bits 4-7)
      const addressType = header >> 4

      const isStakeKey = (addressType & 0b0001) === 0
      const stakeCredential: Credential.Credential = isStakeKey
        ? {
            _tag: "KeyHash",
            hash: yield* ParseResult.decode(KeyHash.FromBytes)(fromA.slice(1, 29))
          }
        : {
            _tag: "ScriptHash",
            hash: yield* ParseResult.decode(ScriptHash.BytesSchema)(fromA.slice(1, 29))
          }
      return yield* ParseResult.decode(RewardAccount)({
        _tag: "RewardAccount",
        networkId,
        stakeCredential
      })
    })
})

export const FromHex = Schema.compose(
  Bytes.FromHex, // string → Uint8Array
  FromBytes // Uint8Array → RewardAccount
)

/**
 * Check if two RewardAccount instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: RewardAccount, b: RewardAccount): boolean => {
  return (
    a.networkId === b.networkId &&
    a.stakeCredential._tag === b.stakeCredential._tag &&
    a.stakeCredential.hash === b.stakeCredential.hash
  )
}

/**
 * Generate a random RewardAccount.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.tuple(NetworkId.generator, Credential.generator).map(
  ([networkId, stakeCredential]) =>
    new RewardAccount({
      networkId,
      stakeCredential
    })
)

export const Codec = _Codec.createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  RewardAccountError
)
