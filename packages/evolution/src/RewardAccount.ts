import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes29 from "./Bytes29.js"
import * as Credential from "./Credential.js"
import * as Function from "./Function.js"
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
      const stakeCredentialBytes = toA.stakeCredential.hash
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
        ? new KeyHash.KeyHash({
            hash: fromA.slice(1, 29)
          })
        : new ScriptHash.ScriptHash({
            hash: fromA.slice(1, 29)
          })
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
  return a.networkId === b.networkId && Credential.equals(a.stakeCredential, b.stakeCredential)
}

/**
 * FastCheck arbitrary for RewardAccount instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.tuple(NetworkId.arbitrary, Credential.arbitrary).map(
  ([networkId, stakeCredential]) =>
    new RewardAccount({
      networkId,
      stakeCredential
    })
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a RewardAccount from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, RewardAccountError, "RewardAccount.fromBytes")

/**
 * Parse a RewardAccount from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, RewardAccountError, "RewardAccount.fromHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a RewardAccount to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, RewardAccountError, "RewardAccount.toBytes")

/**
 * Convert a RewardAccount to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, RewardAccountError, "RewardAccount.toHex")

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
   * Parse a RewardAccount from bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, RewardAccountError)

  /**
   * Parse a RewardAccount from hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, RewardAccountError)

  /**
   * Convert a RewardAccount to bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, RewardAccountError)

  /**
   * Convert a RewardAccount to hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, RewardAccountError)
}
