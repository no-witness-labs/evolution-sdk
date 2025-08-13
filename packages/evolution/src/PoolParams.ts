import { BigDecimal, Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as KeyHash from "./KeyHash.js"
import * as NetworkId from "./NetworkId.js"
import * as PoolKeyHash from "./PoolKeyHash.js"
import * as PoolMetadata from "./PoolMetadata.js"
import * as Relay from "./Relay.js"
import * as RewardAccount from "./RewardAccount.js"
import * as UnitInterval from "./UnitInterval.js"
import * as VrfKeyHash from "./VrfKeyHash.js"

/**
 * Error class for PoolParams related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PoolParamsError extends Data.TaggedError("PoolParamsError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for PoolParams representing stake pool registration parameters.
 *
 * ```
 * pool_params =
 *   ( operator       : pool_keyhash
 *   , vrf_keyhash    : vrf_keyhash
 *   , pledge         : coin
 *   , cost           : coin
 *   , margin         : unit_interval
 *   , reward_account : reward_account
 *   , pool_owners    : set<addr_keyhash>
 *   , relays         : [* relay]
 *   , pool_metadata  : pool_metadata/ nil
 *   )
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class PoolParams extends Schema.TaggedClass<PoolParams>()("PoolParams", {
  operator: PoolKeyHash.PoolKeyHash,
  vrfKeyhash: VrfKeyHash.VrfKeyHash,
  pledge: Coin.Coin,
  cost: Coin.Coin,
  margin: UnitInterval.UnitInterval,
  rewardAccount: RewardAccount.RewardAccount,
  poolOwners: Schema.Array(KeyHash.KeyHash),
  relays: Schema.Array(Relay.Relay),
  poolMetadata: Schema.optionalWith(PoolMetadata.PoolMetadata, {
    nullable: true
  })
}) {}

export const CDDLSchema = Schema.Tuple(
  CBOR.ByteArray, // operator (pool_keyhash as bytes)
  CBOR.ByteArray, // vrf_keyhash (as bytes)
  CBOR.Integer, // pledge (coin)
  CBOR.Integer, // cost (coin)
  UnitInterval.CDDLSchema, // margin using UnitInterval CDDL schema
  CBOR.ByteArray, // reward_account (bytes)
  Schema.Array(CBOR.ByteArray), // pool_owners (set<addr_keyhash> as bytes array)
  Schema.Array(Schema.encodedSchema(Relay.FromCDDL)), // relays using Relay CDDL schema
  Schema.NullOr(Schema.encodedSchema(PoolMetadata.FromCDDL)) // pool_metadata using PoolMetadata CDDL schema
)

/**
 * CDDL schema for PoolParams.
 *
 * ```
 * pool_params = [
 *   operator       : pool_keyhash,
 *   vrf_keyhash    : vrf_keyhash,
 *   pledge         : coin,
 *   cost           : coin,
 *   margin         : unit_interval,
 *   reward_account : reward_account,
 *   pool_owners    : set<addr_keyhash>,
 *   relays         : [* relay],
 *   pool_metadata  : pool_metadata / nil
 * ]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(PoolParams), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const operatorBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(toA.operator)
      const vrfKeyhashBytes = yield* ParseResult.encode(VrfKeyHash.FromBytes)(toA.vrfKeyhash)

      const marginEncoded = yield* ParseResult.encode(UnitInterval.FromCDDL)(toA.margin)
      const rewardAccountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(toA.rewardAccount)

      const poolOwnersBytes = yield* Eff.all(
        toA.poolOwners.map((owner) => ParseResult.encode(KeyHash.FromBytes)(owner))
      )

      const relaysEncoded = yield* Eff.all(toA.relays.map((relay) => ParseResult.encode(Relay.FromCDDL)(relay)))

      const poolMetadataEncoded = toA.poolMetadata
        ? yield* ParseResult.encode(PoolMetadata.FromCDDL)(toA.poolMetadata)
        : null

      return [
        operatorBytes,
        vrfKeyhashBytes,
        toA.pledge,
        toA.cost,
        marginEncoded,
        rewardAccountBytes,
        poolOwnersBytes,
        relaysEncoded,
        poolMetadataEncoded
      ] as const
    }),
  decode: ([
    operatorBytes,
    vrfKeyhashBytes,
    pledge,
    cost,
    marginEncoded,
    rewardAccountBytes,
    poolOwnersBytes,
    relaysEncoded,
    poolMetadataEncoded
  ]) =>
    Eff.gen(function* () {
      const operator = yield* ParseResult.decode(PoolKeyHash.FromBytes)(operatorBytes)
      const vrfKeyhash = yield* ParseResult.decode(VrfKeyHash.FromBytes)(vrfKeyhashBytes)
      const margin = yield* ParseResult.decode(UnitInterval.FromCDDL)(marginEncoded)
      const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(rewardAccountBytes)

      const poolOwners = yield* Eff.all(
        poolOwnersBytes.map((ownerBytes) => ParseResult.decode(KeyHash.FromBytes)(ownerBytes))
      )

      const relays = yield* Eff.all(
        relaysEncoded.map((relayEncoded) => ParseResult.decode(Relay.FromCDDL)(relayEncoded))
      )

      const poolMetadata = poolMetadataEncoded
        ? yield* ParseResult.decode(PoolMetadata.FromCDDL)(poolMetadataEncoded)
        : undefined

      return yield* Eff.succeed(
        new PoolParams({
          operator,
          vrfKeyhash,
          pledge,
          cost,
          margin,
          rewardAccount,
          poolOwners,
          relays,
          poolMetadata
        })
      )
    })
})

/**
 * CBOR bytes transformation schema for PoolParams.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → PoolParams
  )

/**
 * CBOR hex transformation schema for PoolParams.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → PoolParams
  )

/**
 * Check if two PoolParams instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PoolParams, b: PoolParams): boolean =>
  PoolKeyHash.equals(a.operator, b.operator) &&
  VrfKeyHash.equals(a.vrfKeyhash, b.vrfKeyhash) &&
  a.pledge === b.pledge &&
  a.cost === b.cost &&
  UnitInterval.equals(a.margin, b.margin) &&
  a.rewardAccount.networkId === b.rewardAccount.networkId &&
  a.rewardAccount.stakeCredential._tag === b.rewardAccount.stakeCredential._tag &&
  a.poolOwners.length === b.poolOwners.length &&
  a.poolOwners.every((owner, index) => KeyHash.equals(owner, b.poolOwners[index])) &&
  a.relays.length === b.relays.length &&
  // Note: Relay equality comparison would need to be implemented
  ((a.poolMetadata === undefined && b.poolMetadata === undefined) ||
    (a.poolMetadata !== undefined && b.poolMetadata !== undefined && a.poolMetadata.url === b.poolMetadata.url))

/**
 * Create a PoolParams instance with validation.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (params: {
  operator: PoolKeyHash.PoolKeyHash
  vrfKeyhash: VrfKeyHash.VrfKeyHash
  pledge: Coin.Coin
  cost: Coin.Coin
  margin: UnitInterval.UnitInterval
  rewardAccount: RewardAccount.RewardAccount
  poolOwners: Array<KeyHash.KeyHash>
  relays: Array<Relay.Relay>
  poolMetadata?: PoolMetadata.PoolMetadata
}): PoolParams => new PoolParams(params)

/**
 * Get total effective stake for pool rewards calculation.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getEffectiveStake = (params: PoolParams, totalStake: Coin.Coin): Coin.Coin => {
  // Effective stake is min(totalStake, pledge) for calculation purposes
  return totalStake < params.pledge ? totalStake : params.pledge
}

/**
 * Calculate pool operator rewards based on pool parameters.
 *
 * @since 2.0.0
 * @category transformation
 */
export const calculatePoolRewards = (
  params: PoolParams,
  totalRewards: Coin.Coin
): { operatorRewards: Coin.Coin; delegatorRewards: Coin.Coin } => {
  const fixedCost = params.cost
  const marginDecimal = UnitInterval.toBigDecimal(params.margin)

  if (totalRewards <= fixedCost) {
    return {
      operatorRewards: totalRewards,
      delegatorRewards: 0n
    }
  }

  const rewardsAfterCost = totalRewards - fixedCost
  const marginAsNumber = Number(BigDecimal.unsafeToNumber(marginDecimal))
  const operatorShare = BigInt(Math.floor(Number(rewardsAfterCost) * marginAsNumber))

  return {
    operatorRewards: fixedCost + operatorShare,
    delegatorRewards: rewardsAfterCost - operatorShare
  }
}

/**
 * Check if the pool has the minimum required cost.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasMinimumCost = (params: PoolParams, minPoolCost: Coin.Coin): boolean => params.cost >= minPoolCost

/**
 * Check if the pool margin is within valid range (0 to 1).
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasValidMargin = (params: PoolParams): boolean =>
  params.margin.numerator <= params.margin.denominator && params.margin.denominator > 0n

/**
 * FastCheck arbitrary for generating random PoolParams instances for testing.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.record({
  operator: PoolKeyHash.arbitrary,
  vrfKeyhash: VrfKeyHash.arbitrary,
  pledge: FastCheck.bigInt({ min: 0n, max: 1000000000000n }),
  cost: FastCheck.bigInt({ min: 340000000n, max: 1000000000n }),
  margin: UnitInterval.arbitrary,
  rewardAccount: FastCheck.constant(
    new RewardAccount.RewardAccount({
      networkId: NetworkId.make(1),
      stakeCredential: {
        _tag: "KeyHash",
        hash: KeyHash.KeyHash.make("a".repeat(56))
      }
    })
  ),
  poolOwners: FastCheck.array(KeyHash.arbitrary, {
    minLength: 1,
    maxLength: 5
  }),
  relays: FastCheck.array(Relay.arbitrary, { minLength: 0, maxLength: 3 }),
  poolMetadata: FastCheck.option(FastCheck.constant(undefined), {
    nil: undefined
  })
}).map((params) => new PoolParams(params))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse PoolParams from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): PoolParams =>
  Eff.runSync(Effect.fromBytes(bytes, options))

/**
 * Parse PoolParams from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string, options?: CBOR.CodecOptions): PoolParams =>
  Eff.runSync(Effect.fromHex(hex, options))

/**
 * Encode PoolParams to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (poolParams: PoolParams, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toBytes(poolParams, options))

/**
 * Encode PoolParams to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (poolParams: PoolParams, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toHex(poolParams, options))

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse PoolParams from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<PoolParams, PoolParamsError> =>
    Schema.decode(FromBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new PoolParamsError({
            message: "Failed to parse PoolParams from bytes",
            cause
          })
      )
    )

  /**
   * Parse PoolParams from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<PoolParams, PoolParamsError> =>
    Schema.decode(FromHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new PoolParamsError({
            message: "Failed to parse PoolParams from hex",
            cause
          })
      )
    )

  /**
   * Encode PoolParams to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (
    poolParams: PoolParams,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, PoolParamsError> =>
    Schema.encode(FromBytes(options))(poolParams).pipe(
      Eff.mapError(
        (cause) =>
          new PoolParamsError({
            message: "Failed to encode PoolParams to bytes",
            cause
          })
      )
    )

  /**
   * Encode PoolParams to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (
    poolParams: PoolParams,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, PoolParamsError> =>
    Schema.encode(FromHex(options))(poolParams).pipe(
      Eff.mapError(
        (cause) =>
          new PoolParamsError({
            message: "Failed to encode PoolParams to hex",
            cause
          })
      )
    )
}
