import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes29 from "./Bytes29.js"
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
}) {}

export const FromBytes = Schema.transformOrFail(Bytes29.BytesSchema, RewardAccount, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      const stakingBit = toA.stakeCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b111 << 5) | (stakingBit << 4) | (toA.networkId & 0b00001111)
      const result = new Uint8Array(29)
      result[0] = header
      const stakeCredentialBytes = yield* ParseResult.decode(Bytes.FromHex)(toA.stakeCredential.hash)
      result.set(stakeCredentialBytes, 1)
      return yield* ParseResult.succeed(result)
    }),
  decode: (_, __, ___, fromA) =>
    Eff.gen(function* () {
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
            hash: yield* ParseResult.decode(ScriptHash.FromBytes)(fromA.slice(1, 29))
          }
      return yield* ParseResult.decode(RewardAccount)({
        _tag: "RewardAccount",
        networkId,
        stakeCredential
      })
    })
}).annotations({
  identifier: "RewardAccount.FromBytes",
  description: "Transforms raw bytes to RewardAccount"
})

export const FromHex = Schema.compose(
  Bytes.FromHex, // string → Uint8Array
  FromBytes // Uint8Array → RewardAccount
).annotations({
  identifier: "RewardAccount.FromHex",
  description: "Transforms raw hex string to RewardAccount"
})

/**
 * Smart constructor for creating RewardAccount instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (props: {
  networkId: NetworkId.NetworkId
  stakeCredential: Credential.Credential
}): RewardAccount => new RewardAccount(props)

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
 * FastCheck arbitrary for generating random RewardAccount instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.tuple(NetworkId.arbitrary, Credential.arbitrary).map(
  ([networkId, stakeCredential]) =>
    make({
      networkId,
      stakeCredential
    })
)

/**
 * Effect namespace for RewardAccount operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Convert bytes to RewardAccount using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromBytes = (bytes: Uint8Array) =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) => new RewardAccountError({ message: "Failed to decode from bytes", cause })
    )

  /**
   * Convert hex string to RewardAccount using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromHex = (hex: string) =>
    Eff.mapError(
      Schema.decode(FromHex)(hex),
      (cause) => new RewardAccountError({ message: "Failed to decode from hex", cause })
    )

  /**
   * Convert RewardAccount to bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toBytes = (account: RewardAccount) =>
    Eff.mapError(
      Schema.encode(FromBytes)(account),
      (cause) => new RewardAccountError({ message: "Failed to encode to bytes", cause })
    )

  /**
   * Convert RewardAccount to hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toHex = (account: RewardAccount) =>
    Eff.mapError(
      Schema.encode(FromHex)(account),
      (cause) => new RewardAccountError({ message: "Failed to encode to hex", cause })
    )
}

/**
 * Convert bytes to RewardAccount (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromBytes = (bytes: Uint8Array): RewardAccount => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Convert hex string to RewardAccount (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromHex = (hex: string): RewardAccount => Eff.runSync(Effect.fromHex(hex))

/**
 * Convert RewardAccount to bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toBytes = (account: RewardAccount): Uint8Array => Eff.runSync(Effect.toBytes(account))

/**
 * Convert RewardAccount to hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toHex = (account: RewardAccount): string => Eff.runSync(Effect.toHex(account))
