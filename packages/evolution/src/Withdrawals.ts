import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

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
  message: string
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
 * @since 2.0.0
 * @category model
 */
export class Withdrawals extends Schema.TaggedClass<Withdrawals>()("Withdrawals", {
  withdrawals: Schema.MapFromSelf({
    key: RewardAccount.RewardAccount,
    value: Coin.CoinSchema
  })
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "Withdrawals",
      withdrawals: Array.from(this.withdrawals.entries()).map(([acc, coin]) => [acc, coin.toString()])
    }
  }
}

/**
 * Check if the given value is a valid Withdrawals
 *
 * @since 2.0.0
 * @category predicates
 */
export const isWithdrawals = Schema.is(Withdrawals)

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
export const WithdrawalsCDDLSchema = Schema.transformOrFail(
  Schema.MapFromSelf({
    key: Schema.Uint8ArrayFromSelf, // RewardAccount as Uint8Array (29 bytes)
    value: CBOR.Integer // Coin as bigint
  }),
  Schema.typeSchema(Withdrawals),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const withdrawalsMap = new Map<Uint8Array, bigint>()
        for (const [rewardAccount, coin] of toA.withdrawals.entries()) {
          const accountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(rewardAccount)
          withdrawalsMap.set(accountBytes, BigInt(coin))
        }
        return withdrawalsMap
      }),
    decode: (fromA) =>
      Effect.gen(function* () {
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
  }
)

/**
 * CBOR bytes transformation schema for Withdrawals.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    WithdrawalsCDDLSchema // CBOR → Withdrawals
  )

/**
 * CBOR hex transformation schema for Withdrawals.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → Withdrawals
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
 * FastCheck generator for Withdrawals instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.array(FastCheck.tuple(RewardAccount.generator, Coin.generator), {
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

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) => ({
  Encode: {
    cborBytes: Schema.encodeSync(CBORBytesSchema(options)),
    cborHex: Schema.encodeSync(CBORHexSchema(options))
  },
  Decode: {
    cborBytes: Schema.decodeUnknownSync(CBORBytesSchema(options)),
    cborHex: Schema.decodeUnknownSync(CBORHexSchema(options))
  },
  EncodeEither: {
    cborBytes: Schema.encodeEither(CBORBytesSchema(options)),
    cborHex: Schema.encodeEither(CBORHexSchema(options))
  },
  DecodeEither: {
    cborBytes: Schema.decodeUnknownEither(CBORBytesSchema(options)),
    cborHex: Schema.decodeUnknownEither(CBORHexSchema(options))
  },
  EncodeEffect: {
    cborBytes: Schema.encode(CBORBytesSchema(options)),
    cborHex: Schema.encode(CBORHexSchema(options))
  },
  DecodeEffect: {
    cborBytes: Schema.decodeUnknown(CBORBytesSchema(options)),
    cborHex: Schema.decodeUnknown(CBORHexSchema(options))
  }
})
