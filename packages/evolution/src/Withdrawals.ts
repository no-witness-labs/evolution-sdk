import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as RewardAccount from "./RewardAccount.js"

/**
 * ```
 * CDDL specs
 * withdrawals = {+ reward_account => coin}
 * ```
 */

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
  withdrawals: Schema.MapFromSelf({
    key: RewardAccount.RewardAccount,
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
        withdrawalsMap.set(accountBytes, BigInt(coin))
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
      return yield* ParseResult.decode(Withdrawals)({
        _tag: "Withdrawals",
        withdrawals: decodedWithdrawals
      })
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

  for (const [account, coin] of self.withdrawals) {
    const otherCoin = that.withdrawals.get(account)
    if (!otherCoin || !Coin.equals(coin, otherCoin)) return false
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
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Withdrawals =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse a Withdrawals from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Withdrawals =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a Withdrawals to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (withdrawals: Withdrawals, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(withdrawals, options))

/**
 * Convert a Withdrawals to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (withdrawals: Withdrawals, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(withdrawals, options))

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse a Withdrawals from CBOR bytes.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Withdrawals, WithdrawalsError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (error) =>
          new WithdrawalsError({
            message: "Failed to decode Withdrawals from CBOR bytes",
            cause: error
          })
      )
    )

  /**
   * Parse a Withdrawals from CBOR hex string.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Withdrawals, WithdrawalsError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (error) =>
          new WithdrawalsError({
            message: "Failed to decode Withdrawals from CBOR hex",
            cause: error
          })
      )
    )

  /**
   * Convert a Withdrawals to CBOR bytes.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORBytes = (
    withdrawals: Withdrawals,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, WithdrawalsError> =>
    Schema.encode(FromCBORBytes(options))(withdrawals).pipe(
      Eff.mapError(
        (error) =>
          new WithdrawalsError({
            message: "Failed to encode Withdrawals to CBOR bytes",
            cause: error
          })
      )
    )

  /**
   * Convert a Withdrawals to CBOR hex string.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORHex = (
    withdrawals: Withdrawals,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, WithdrawalsError> =>
    Schema.encode(FromCBORHex(options))(withdrawals).pipe(
      Eff.mapError(
        (error) =>
          new WithdrawalsError({
            message: "Failed to encode Withdrawals to CBOR hex",
            cause: error
          })
      )
    )
}
