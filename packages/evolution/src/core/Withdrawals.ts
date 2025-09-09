import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as Function from "./Function.js"
import * as RewardAccount from "./RewardAccount.js"

/**
 * Error class for Withdrawals related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class WithdrawalsError extends Data.TaggedError("WithdrawalsError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Withdrawals representing a map of reward accounts to coin amounts.
 *
 * ```
 * withdrawals = {+ reward_account => coin}
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class Withdrawals extends Schema.TaggedClass<Withdrawals>()("Withdrawals", {
  withdrawals: Schema.Map({
    key: RewardAccount.FromBech32,
    value: Coin.Coin
  })
}) {}

/**
 * Check if the given value is a valid Withdrawals
 *
 * @since 2.0.0
 * @category predicates
 */
export const isWithdrawals = Schema.is(Withdrawals)

export const CDDLSchema = Schema.MapFromSelf({
  key: Schema.Uint8ArrayFromSelf, // RewardAccount as Uint8Array (29 bytes)
  value: CBOR.Integer // Coin as bigint
})

/**
 * CDDL schema for Withdrawals.
 *
 * ```
 * withdrawals = {+ reward_account => coin}
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Withdrawals), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const withdrawalsMap = new Map<Uint8Array, bigint>()
      for (const [rewardAccount, coin] of toA.withdrawals.entries()) {
        const accountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(rewardAccount)
        withdrawalsMap.set(accountBytes, coin)
      }
      return withdrawalsMap
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const decodedWithdrawals = new Map<RewardAccount.RewardAccount, Coin.Coin>()
      for (const [accountBytes, coinAmount] of fromA.entries()) {
        const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(accountBytes)
        const coin = Coin.make(coinAmount)
        decodedWithdrawals.set(rewardAccount, coin)
      }
      return Withdrawals.make({ withdrawals: decodedWithdrawals }, { disableValidation: true })
    })
})

/**
 * CBOR bytes transformation schema for Withdrawals.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Withdrawals
  )

/**
 * CBOR hex transformation schema for Withdrawals.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Withdrawals
  )

/**
 * Check if two Withdrawals instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: Withdrawals, that: Withdrawals): boolean => {
  if (self.withdrawals.size !== that.withdrawals.size) return false

  // Map keys are RewardAccount instances which may be different object
  // identities after decoding; compare keys structurally using RewardAccount.equals
  for (const [account, coin] of self.withdrawals) {
    let found = false
    for (const [otherAccount, otherCoin] of that.withdrawals) {
      if (RewardAccount.equals(account, otherAccount) && Coin.equals(coin, otherCoin)) {
        found = true
        break
      }
    }
    if (!found) return false
  }

  return true
}

/**
 * FastCheck arbitrary for Withdrawals instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.array(FastCheck.tuple(RewardAccount.arbitrary, Coin.arbitrary), {
  minLength: 0,
  maxLength: 10
}).map((entries) => new Withdrawals({ withdrawals: new Map(entries) }))

/**
 * Create an empty Withdrawals instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = (): Withdrawals => new Withdrawals({ withdrawals: new Map() })

/**
 * Create a Withdrawals instance with a single withdrawal.
 *
 * @since 2.0.0
 * @category constructors
 */
export const singleton = (rewardAccount: RewardAccount.RewardAccount, coin: Coin.Coin): Withdrawals =>
  new Withdrawals({ withdrawals: new Map([[rewardAccount, coin]]) })

/**
 * Create a Withdrawals instance from an array of [RewardAccount, Coin] pairs.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromEntries = (entries: Array<[RewardAccount.RewardAccount, Coin.Coin]>): Withdrawals =>
  new Withdrawals({ withdrawals: new Map(entries) })

/**
 * Add a withdrawal to existing Withdrawals.
 *
 * @since 2.0.0
 * @category transformation
 */
export const add = (
  withdrawals: Withdrawals,
  rewardAccount: RewardAccount.RewardAccount,
  coin: Coin.Coin
): Withdrawals => {
  const newMap = new Map(withdrawals.withdrawals)
  newMap.set(rewardAccount, coin)
  return new Withdrawals({ withdrawals: newMap })
}

/**
 * Remove a withdrawal from existing Withdrawals.
 *
 * @since 2.0.0
 * @category transformation
 */
export const remove = (withdrawals: Withdrawals, rewardAccount: RewardAccount.RewardAccount): Withdrawals => {
  const newMap = new Map(withdrawals.withdrawals)
  newMap.delete(rewardAccount)
  return new Withdrawals({ withdrawals: newMap })
}

/**
 * Get the coin amount for a specific reward account.
 *
 * @since 2.0.0
 * @category transformation
 */
export const get = (withdrawals: Withdrawals, rewardAccount: RewardAccount.RewardAccount): Coin.Coin | undefined =>
  withdrawals.withdrawals.get(rewardAccount)

/**
 * Check if Withdrawals contains a specific reward account.
 *
 * @since 2.0.0
 * @category predicates
 */
export const has = (withdrawals: Withdrawals, rewardAccount: RewardAccount.RewardAccount): boolean =>
  withdrawals.withdrawals.has(rewardAccount)

/**
 * Check if Withdrawals is empty.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isEmpty = (withdrawals: Withdrawals): boolean => withdrawals.withdrawals.size === 0

/**
 * Get the size (number of withdrawals) in Withdrawals.
 *
 * @since 2.0.0
 * @category transformation
 */
export const size = (withdrawals: Withdrawals): number => withdrawals.withdrawals.size

/**
 * Get all entries as an array of [reward account, coin] pairs.
 *
 * @since 2.0.0
 * @category transformation
 */
export const entries = (withdrawals: Withdrawals): Array<[RewardAccount.RewardAccount, Coin.Coin]> =>
  Array.from(withdrawals.withdrawals.entries())

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a Withdrawals from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, WithdrawalsError, "Withdrawals.fromCBORBytes")

/**
 * Parse a Withdrawals from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, WithdrawalsError, "Withdrawals.fromCBORHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a Withdrawals to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, WithdrawalsError, "Withdrawals.toCBORBytes")

/**
 * Convert a Withdrawals to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, WithdrawalsError, "Withdrawals.toCBORHex")

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
   * Parse a Withdrawals from CBOR bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, WithdrawalsError)

  /**
   * Parse a Withdrawals from CBOR hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, WithdrawalsError)

  /**
   * Convert a Withdrawals to CBOR bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, WithdrawalsError)

  /**
   * Convert a Withdrawals to CBOR hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, WithdrawalsError)
}
