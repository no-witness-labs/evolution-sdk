import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as CostModel from "./CostModel.js"
import * as Function from "./Function.js"
import * as NonnegativeInterval from "./NonnegativeInterval.js"
import * as Numeric from "./Numeric.js"
import * as UnitInterval from "./UnitInterval.js"

/**
 * Error class for ProtocolParamUpdate related operations.
 */
export class ProtocolParamUpdateError extends Data.TaggedError("ProtocolParamUpdateError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * ex_unit_prices (domain) = [mem_price : NonnegativeInterval, step_price : NonnegativeInterval]
 */
export const ExUnitPrices = Schema.Tuple(
  NonnegativeInterval.NonnegativeInterval,
  NonnegativeInterval.NonnegativeInterval
).annotations({ identifier: "ExUnitPrices" })
export type ExUnitPrices = typeof ExUnitPrices.Type

/**
 * ex_units = [mem : uint, steps : uint]
 */
export const ExUnits = Schema.Tuple(Numeric.Uint64Schema, Numeric.Uint64Schema).annotations({
  identifier: "ExUnits"
})
export type ExUnits = typeof ExUnits.Type

/**
 * pool_voting_thresholds (domain) = [u,u,u,u,u] (5 unit_intervals)
 */
export const PoolVotingThresholds = Schema.Tuple(
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval
).annotations({ identifier: "PoolVotingThresholds" })
export type PoolVotingThresholds = typeof PoolVotingThresholds.Type

/**
 * drep_voting_thresholds (domain) = [10 unit_intervals]
 */
export const DRepVotingThresholds = Schema.Tuple(
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval,
  UnitInterval.UnitInterval
).annotations({ identifier: "DRepVotingThresholds" })
export type DRepVotingThresholds = typeof DRepVotingThresholds.Type

/**
 * ProtocolParamUpdate CDDL record with optional fields keyed by indexes.
 * Mirrors Conway CDDL `protocol_param_update`.
 */
// Map-based CDDL: { * uint => value }
// We keep the value loosely typed as CBOR to allow nested encoded schemas where needed.
export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: CBOR.CBORSchema
}).annotations({ identifier: "ProtocolParamUpdate.CDDL" })

export type CDDLSchema = typeof CDDLSchema.Type

/**
 * Convenience domain class mirroring the same structure.
 */
export class ProtocolParamUpdate extends Schema.TaggedClass<ProtocolParamUpdate>()("ProtocolParamUpdate", {
  minfeeA: Schema.optional(Coin.Coin), // 0
  minfeeB: Schema.optional(Coin.Coin), // 1
  maxBlockBodySize: Schema.optional(Numeric.Uint32Schema), // 2
  maxTxSize: Schema.optional(Numeric.Uint32Schema), // 3
  maxBlockHeaderSize: Schema.optional(Numeric.Uint16Schema), // 4
  keyDeposit: Schema.optional(Coin.Coin), // 5
  poolDeposit: Schema.optional(Coin.Coin), // 6
  maxEpoch: Schema.optional(Numeric.Uint32Schema), // 7
  nOpt: Schema.optional(Numeric.Uint16Schema), // 8
  poolPledgeInfluence: Schema.optional(NonnegativeInterval.NonnegativeInterval), // 9
  expansionRate: Schema.optional(UnitInterval.UnitInterval), // 10
  treasuryGrowthRate: Schema.optional(UnitInterval.UnitInterval), // 11
  minPoolCost: Schema.optional(Coin.Coin), // 16
  adaPerUtxoByte: Schema.optional(Coin.Coin), // 17
  costModels: Schema.optional(CostModel.CostModels), // 18
  exUnitPrices: Schema.optional(ExUnitPrices), // 19
  maxTxExUnits: Schema.optional(ExUnits), // 20
  maxBlockExUnits: Schema.optional(ExUnits), // 21
  maxValueSize: Schema.optional(Numeric.Uint32Schema), // 22
  collateralPercentage: Schema.optional(Numeric.Uint16Schema), // 23
  maxCollateralInputs: Schema.optional(Numeric.Uint16Schema), // 24
  poolVotingThresholds: Schema.optional(PoolVotingThresholds), // 25
  drepVotingThresholds: Schema.optional(DRepVotingThresholds), // 26
  minCommitteeSize: Schema.optional(Numeric.Uint16Schema), // 27
  committeeTermLimit: Schema.optional(Numeric.Uint32Schema), // 28
  governanceActionValidity: Schema.optional(Numeric.Uint32Schema), // 29
  governanceActionDeposit: Schema.optional(Coin.Coin), // 30
  drepDeposit: Schema.optional(Coin.Coin), // 31
  drepInactivityPeriod: Schema.optional(Numeric.Uint32Schema), // 32
  minfeeRefScriptCoinsPerByte: Schema.optional(NonnegativeInterval.NonnegativeInterval) // 33
}) {}

export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(ProtocolParamUpdate), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const out = new Map<bigint, CBOR.CBOR>()

      // Simple passthrough bigints
      if (toA.minfeeA !== undefined) out.set(0n, toA.minfeeA)
      if (toA.minfeeB !== undefined) out.set(1n, toA.minfeeB)
      if (toA.maxBlockBodySize !== undefined) out.set(2n, toA.maxBlockBodySize)
      if (toA.maxTxSize !== undefined) out.set(3n, toA.maxTxSize)
      if (toA.maxBlockHeaderSize !== undefined) out.set(4n, toA.maxBlockHeaderSize)
      if (toA.keyDeposit !== undefined) out.set(5n, toA.keyDeposit)
      if (toA.poolDeposit !== undefined) out.set(6n, toA.poolDeposit)
      if (toA.maxEpoch !== undefined) out.set(7n, toA.maxEpoch)
      if (toA.nOpt !== undefined) out.set(8n, toA.nOpt)

      // Intervals (encoded via tag 30)
      if (toA.poolPledgeInfluence !== undefined)
        out.set(9n, yield* ParseResult.encode(NonnegativeInterval.FromCDDL)(toA.poolPledgeInfluence))
      if (toA.expansionRate !== undefined)
        out.set(10n, yield* ParseResult.encode(UnitInterval.FromCDDL)(toA.expansionRate))
      if (toA.treasuryGrowthRate !== undefined)
        out.set(11n, yield* ParseResult.encode(UnitInterval.FromCDDL)(toA.treasuryGrowthRate))

      if (toA.minPoolCost !== undefined) out.set(16n, toA.minPoolCost)
      if (toA.adaPerUtxoByte !== undefined) out.set(17n, toA.adaPerUtxoByte)

      // Cost models (encoded schema)
      if (toA.costModels !== undefined) out.set(18n, yield* ParseResult.encode(CostModel.FromCDDL)(toA.costModels))

      // ExUnitPrices (tuple of two nonnegative intervals)
      if (toA.exUnitPrices !== undefined) {
        const [memPrice, stepPrice] = toA.exUnitPrices
        out.set(19n, [
          yield* ParseResult.encode(NonnegativeInterval.FromCDDL)(memPrice),
          yield* ParseResult.encode(NonnegativeInterval.FromCDDL)(stepPrice)
        ] as const)
      }

      // ExUnits (passthrough bigints)
      if (toA.maxTxExUnits !== undefined) out.set(20n, toA.maxTxExUnits)
      if (toA.maxBlockExUnits !== undefined) out.set(21n, toA.maxBlockExUnits)

      if (toA.maxValueSize !== undefined) out.set(22n, toA.maxValueSize)
      if (toA.collateralPercentage !== undefined) out.set(23n, toA.collateralPercentage)
      if (toA.maxCollateralInputs !== undefined) out.set(24n, toA.maxCollateralInputs)

      // PoolVotingThresholds (5 unit intervals)
      if (toA.poolVotingThresholds !== undefined) {
        const [a, b, c, d, e] = toA.poolVotingThresholds
        out.set(25n, [
          yield* ParseResult.encode(UnitInterval.FromCDDL)(a),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(b),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(c),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(d),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(e)
        ] as const)
      }

      // DRepVotingThresholds (10 unit intervals)
      if (toA.drepVotingThresholds !== undefined) {
        const [a, b, c, d, e, f, g, h, i, j] = toA.drepVotingThresholds
        out.set(26n, [
          yield* ParseResult.encode(UnitInterval.FromCDDL)(a),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(b),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(c),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(d),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(e),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(f),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(g),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(h),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(i),
          yield* ParseResult.encode(UnitInterval.FromCDDL)(j)
        ] as const)
      }

      if (toA.minCommitteeSize !== undefined) out.set(27n, toA.minCommitteeSize)
      if (toA.committeeTermLimit !== undefined) out.set(28n, toA.committeeTermLimit)
      if (toA.governanceActionValidity !== undefined) out.set(29n, toA.governanceActionValidity)
      if (toA.governanceActionDeposit !== undefined) out.set(30n, toA.governanceActionDeposit)
      if (toA.drepDeposit !== undefined) out.set(31n, toA.drepDeposit)
      if (toA.drepInactivityPeriod !== undefined) out.set(32n, toA.drepInactivityPeriod)

      if (toA.minfeeRefScriptCoinsPerByte !== undefined)
        out.set(33n, yield* ParseResult.encode(NonnegativeInterval.FromCDDL)(toA.minfeeRefScriptCoinsPerByte))

      return out
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const model: {
        minfeeA?: Coin.Coin
        minfeeB?: Coin.Coin
        maxBlockBodySize?: Numeric.Uint32
        maxTxSize?: Numeric.Uint32
        maxBlockHeaderSize?: Numeric.Uint16
        keyDeposit?: Coin.Coin
        poolDeposit?: Coin.Coin
        maxEpoch?: Numeric.Uint32
        nOpt?: Numeric.Uint16
        poolPledgeInfluence?: NonnegativeInterval.NonnegativeInterval
        expansionRate?: UnitInterval.UnitInterval
        treasuryGrowthRate?: UnitInterval.UnitInterval
        minPoolCost?: Coin.Coin
        adaPerUtxoByte?: Coin.Coin
        costModels?: CostModel.CostModels
        exUnitPrices?: ExUnitPrices
        maxTxExUnits?: ExUnits
        maxBlockExUnits?: ExUnits
        maxValueSize?: Numeric.Uint32
        collateralPercentage?: Numeric.Uint16
        maxCollateralInputs?: Numeric.Uint16
        poolVotingThresholds?: PoolVotingThresholds
        drepVotingThresholds?: DRepVotingThresholds
        minCommitteeSize?: Numeric.Uint16
        committeeTermLimit?: Numeric.Uint32
        governanceActionValidity?: Numeric.Uint32
        governanceActionDeposit?: Coin.Coin
        drepDeposit?: Coin.Coin
        drepInactivityPeriod?: Numeric.Uint32
        minfeeRefScriptCoinsPerByte?: NonnegativeInterval.NonnegativeInterval
      } = {}

      const get = <T = unknown>(k: bigint): T | undefined =>
        (fromA as ReadonlyMap<CBOR.CBOR, CBOR.CBOR>).get(k as any) as any

      const v0 = get<Coin.Coin>(0n)
      if (v0 !== undefined) model.minfeeA = v0
      const v1 = get<Coin.Coin>(1n)
      if (v1 !== undefined) model.minfeeB = v1
      const v2 = get<Numeric.Uint32>(2n)
      if (v2 !== undefined) model.maxBlockBodySize = v2
      const v3 = get<Numeric.Uint32>(3n)
      if (v3 !== undefined) model.maxTxSize = v3
      const v4 = get<Numeric.Uint16>(4n)
      if (v4 !== undefined) model.maxBlockHeaderSize = v4
      const v5 = get<Coin.Coin>(5n)
      if (v5 !== undefined) model.keyDeposit = v5
      const v6 = get<Coin.Coin>(6n)
      if (v6 !== undefined) model.poolDeposit = v6
      const v7 = get<Numeric.Uint32>(7n)
      if (v7 !== undefined) model.maxEpoch = v7
      const v8 = get<Numeric.Uint16>(8n)
      if (v8 !== undefined) model.nOpt = v8

      const v9 = get(9n)
      if (v9 !== undefined)
        model.poolPledgeInfluence = yield* ParseResult.decode(NonnegativeInterval.FromCDDL)(v9 as any)
      const v10 = get(10n)
      if (v10 !== undefined) model.expansionRate = yield* ParseResult.decode(UnitInterval.FromCDDL)(v10 as any)
      const v11 = get(11n)
      if (v11 !== undefined) model.treasuryGrowthRate = yield* ParseResult.decode(UnitInterval.FromCDDL)(v11 as any)

      const v16 = get<Coin.Coin>(16n)
      if (v16 !== undefined) model.minPoolCost = v16
      const v17 = get<Coin.Coin>(17n)
      if (v17 !== undefined) model.adaPerUtxoByte = v17

      const v18 = get(18n)
      if (v18 !== undefined) model.costModels = yield* ParseResult.decode(CostModel.FromCDDL)(v18 as any)

      const v19 = get<readonly [unknown, unknown]>(19n)
      if (v19 !== undefined) {
        const [mem, step] = v19 as any
        model.exUnitPrices = [
          yield* ParseResult.decode(NonnegativeInterval.FromCDDL)(mem),
          yield* ParseResult.decode(NonnegativeInterval.FromCDDL)(step)
        ]
      }

      const v20 = get<ExUnits>(20n)
      if (v20 !== undefined) model.maxTxExUnits = v20
      const v21 = get<ExUnits>(21n)
      if (v21 !== undefined) model.maxBlockExUnits = v21

      const v22 = get<Numeric.Uint32>(22n)
      if (v22 !== undefined) model.maxValueSize = v22
      const v23 = get<Numeric.Uint16>(23n)
      if (v23 !== undefined) model.collateralPercentage = v23
      const v24 = get<Numeric.Uint16>(24n)
      if (v24 !== undefined) model.maxCollateralInputs = v24

      const v25 = get<readonly [unknown, unknown, unknown, unknown, unknown]>(25n)
      if (v25 !== undefined) {
        const [a, b, c, d, e] = v25 as any
        model.poolVotingThresholds = [
          yield* ParseResult.decode(UnitInterval.FromCDDL)(a),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(b),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(c),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(d),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(e)
        ]
      }

      const v26 =
        get<readonly [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>(26n)
      if (v26 !== undefined) {
        const [a, b, c, d, e, f, g, h, i, j] = v26 as any
        model.drepVotingThresholds = [
          yield* ParseResult.decode(UnitInterval.FromCDDL)(a),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(b),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(c),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(d),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(e),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(f),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(g),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(h),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(i),
          yield* ParseResult.decode(UnitInterval.FromCDDL)(j)
        ]
      }

      const v27 = get<Numeric.Uint16>(27n)
      if (v27 !== undefined) model.minCommitteeSize = v27
      const v28 = get<Numeric.Uint32>(28n)
      if (v28 !== undefined) model.committeeTermLimit = v28
      const v29 = get<Numeric.Uint32>(29n)
      if (v29 !== undefined) model.governanceActionValidity = v29
      const v30 = get<Coin.Coin>(30n)
      if (v30 !== undefined) model.governanceActionDeposit = v30
      const v31 = get<Coin.Coin>(31n)
      if (v31 !== undefined) model.drepDeposit = v31
      const v32 = get<Numeric.Uint32>(32n)
      if (v32 !== undefined) model.drepInactivityPeriod = v32

      const v33 = get(33n)
      if (v33 !== undefined)
        model.minfeeRefScriptCoinsPerByte = yield* ParseResult.decode(NonnegativeInterval.FromCDDL)(v33 as any)

      return new ProtocolParamUpdate(model)
    })
})

export const toCBOR = Function.makeCBOREncodeSync(
  FromCDDL,
  ProtocolParamUpdateError,
  "ProtocolParamUpdate.toCBOR",
  CBOR.CML_DEFAULT_OPTIONS
)
export const fromCBOR = Function.makeCBORDecodeSync(
  FromCDDL,
  ProtocolParamUpdateError,
  "ProtocolParamUpdate.fromCBOR",
  CBOR.CML_DEFAULT_OPTIONS
)
export const toCBORBytes = toCBOR
export const fromCBORBytes = fromCBOR
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  ProtocolParamUpdateError,
  "ProtocolParamUpdate.toCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  ProtocolParamUpdateError,
  "ProtocolParamUpdate.fromCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

const coinArb = Coin.arbitrary
const costModelsArb = FastCheck.record({
  PlutusV1: CostModel.arbitrary,
  PlutusV2: CostModel.arbitrary,
  PlutusV3: CostModel.arbitrary
}).map((o) => new CostModel.CostModels(o))

export const arbitrary: FastCheck.Arbitrary<ProtocolParamUpdate> = FastCheck.record({
  minfeeA: FastCheck.option(coinArb, { nil: undefined }),
  minfeeB: FastCheck.option(coinArb, { nil: undefined }),
  maxBlockBodySize: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  maxTxSize: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  maxBlockHeaderSize: FastCheck.option(Numeric.Uint16Arbitrary, { nil: undefined }),
  keyDeposit: FastCheck.option(coinArb, { nil: undefined }),
  poolDeposit: FastCheck.option(coinArb, { nil: undefined }),
  maxEpoch: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  nOpt: FastCheck.option(Numeric.Uint16Arbitrary, { nil: undefined }),
  poolPledgeInfluence: FastCheck.option(NonnegativeInterval.arbitrary, { nil: undefined }),
  expansionRate: FastCheck.option(UnitInterval.arbitrary, { nil: undefined }),
  treasuryGrowthRate: FastCheck.option(UnitInterval.arbitrary, { nil: undefined }),
  minPoolCost: FastCheck.option(coinArb, { nil: undefined }),
  adaPerUtxoByte: FastCheck.option(coinArb, { nil: undefined }),
  costModels: FastCheck.option(costModelsArb, { nil: undefined }),
  exUnitPrices: FastCheck.option(FastCheck.tuple(NonnegativeInterval.arbitrary, NonnegativeInterval.arbitrary), {
    nil: undefined
  }),
  maxTxExUnits: FastCheck.option(FastCheck.tuple(Numeric.Uint64Arbitrary, Numeric.Uint64Arbitrary), {
    nil: undefined
  }),
  maxBlockExUnits: FastCheck.option(FastCheck.tuple(Numeric.Uint64Arbitrary, Numeric.Uint64Arbitrary), {
    nil: undefined
  }),
  maxValueSize: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  collateralPercentage: FastCheck.option(Numeric.Uint16Arbitrary, { nil: undefined }),
  maxCollateralInputs: FastCheck.option(Numeric.Uint16Arbitrary, { nil: undefined }),
  poolVotingThresholds: FastCheck.option(
    FastCheck.tuple(
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary
    ),
    { nil: undefined }
  ),
  drepVotingThresholds: FastCheck.option(
    FastCheck.tuple(
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary,
      UnitInterval.arbitrary
    ),
    { nil: undefined }
  ),
  minCommitteeSize: FastCheck.option(Numeric.Uint16Arbitrary, { nil: undefined }),
  committeeTermLimit: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  governanceActionValidity: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  governanceActionDeposit: FastCheck.option(coinArb, { nil: undefined }),
  drepDeposit: FastCheck.option(coinArb, { nil: undefined }),
  drepInactivityPeriod: FastCheck.option(Numeric.Uint32Arbitrary, { nil: undefined }),
  minfeeRefScriptCoinsPerByte: FastCheck.option(NonnegativeInterval.arbitrary, { nil: undefined })
}).map((r) => new ProtocolParamUpdate(r))
