import type * as CoreType from "@evolution-sdk/core-types"
import { applySingleCborEncoding, fromUnit } from "@evolution-sdk/utils"
import type { Record } from "effect"
import { Schema as S } from "effect"

export const JSONRPCSchema = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.Struct({
    jsonrpc: S.String,
    method: S.optional(S.String),
    id: S.NullOr(S.Number),
    result: schema
  }).annotations({ identifier: "JSONRPCSchema" })

const LovelaceAsset = S.Struct({
  lovelace: S.Number
})

const TupleNumberFromString = S.compose(S.split("/"), S.Array(S.NumberFromString))

export const ProtocolParametersSchema = S.Struct({
  minFeeCoefficient: S.Number,
  minFeeReferenceScripts: S.Struct({
    base: S.Number,
    range: S.Number,
    multiplier: S.Number
  }),
  maxReferenceScriptsSize: S.Struct({
    bytes: S.Number
  }),
  stakePoolVotingThresholds: S.Struct({
    noConfidence: TupleNumberFromString,
    constitutionalCommittee: S.Struct({
      default: TupleNumberFromString,
      stateOfNoConfidence: TupleNumberFromString
    }),
    hardForkInitiation: TupleNumberFromString,
    protocolParametersUpdate: S.Struct({
      security: TupleNumberFromString
    })
  }),
  delegateRepresentativeVotingThresholds: S.Struct({
    noConfidence: TupleNumberFromString,
    constitutionalCommittee: S.Struct({
      default: TupleNumberFromString,
      stateOfNoConfidence: TupleNumberFromString
    }),
    constitution: TupleNumberFromString,
    hardForkInitiation: TupleNumberFromString,
    protocolParametersUpdate: S.Struct({
      network: TupleNumberFromString,
      economic: TupleNumberFromString,
      technical: TupleNumberFromString,
      governance: TupleNumberFromString
    }),
    treasuryWithdrawals: TupleNumberFromString
  }),
  constitutionalCommitteeMinSize: S.optional(S.Number),
  constitutionalCommitteeMaxTermLength: S.Number,
  governanceActionLifetime: S.Number,
  governanceActionDeposit: S.Struct({
    ada: LovelaceAsset
  }),
  delegateRepresentativeDeposit: S.Struct({
    ada: LovelaceAsset
  }),
  delegateRepresentativeMaxIdleTime: S.Number,
  minFeeConstant: S.Struct({ ada: LovelaceAsset }),
  maxBlockBodySize: S.Struct({ bytes: S.Number }),
  maxBlockHeaderSize: S.Struct({ bytes: S.Number }),
  maxTransactionSize: S.Struct({ bytes: S.Number }),
  stakeCredentialDeposit: S.Struct({ ada: LovelaceAsset }),
  stakePoolDeposit: S.Struct({ ada: LovelaceAsset }),
  stakePoolRetirementEpochBound: S.Number,
  desiredNumberOfStakePools: S.Number,
  stakePoolPledgeInfluence: TupleNumberFromString,
  monetaryExpansion: TupleNumberFromString,
  treasuryExpansion: TupleNumberFromString,
  minStakePoolCost: S.Struct({ ada: LovelaceAsset }),
  minUtxoDepositConstant: S.Struct({ ada: LovelaceAsset }),
  minUtxoDepositCoefficient: S.Number,
  plutusCostModels: S.Struct({
    "plutus:v1": S.Array(S.Number),
    "plutus:v2": S.Array(S.Number),
    "plutus:v3": S.Array(S.Number)
  }),
  scriptExecutionPrices: S.Struct({
    memory: TupleNumberFromString,
    cpu: TupleNumberFromString
  }),
  maxExecutionUnitsPerTransaction: S.Struct({
    memory: S.Number,
    cpu: S.Number
  }),
  maxExecutionUnitsPerBlock: S.Struct({ memory: S.Number, cpu: S.Number }),
  maxValueSize: S.Struct({ bytes: S.Number }),
  collateralPercentage: S.Number,
  maxCollateralInputs: S.Number,
  version: S.Struct({ major: S.Number, minor: S.Number })
}).annotations({ identifier: "ProtocolParametersSchema" })

export interface ProtocolParameters extends S.Schema.Type<typeof ProtocolParametersSchema> {}

export const Delegation = S.NullOr(
  S.Record({
    key: S.String,
    value: S.Struct({
      delegate: S.Struct({ id: S.String }),
      rewards: S.Struct({ ada: S.Struct({ lovelace: S.Number }) }),
      deposit: S.Struct({ ada: S.Struct({ lovelace: S.Number }) })
    })
  })
)

type Script = {
  language: "plutus:v1" | "plutus:v2" | "plutus:v3"
  cbor: string
}

export type Assets = Record<string, Record<string, number>>

export type Value = {
  ada: { lovelace: number }
} & Assets

export type UTxO = {
  transaction: { id: string }
  index: number
  address: string
  value: Value
  datumHash?: string | null
  datum?: string | null
  script?: Script | null
}

export const RedeemerSchema = S.Struct({
  validator: S.Struct({
    purpose: S.Literal("spend", "mint", "publish", "withdraw", "vote", "propose"),
    index: S.Int
  }),
  budget: S.Struct({
    memory: S.Int,
    cpu: S.Int
  })
}).annotations({ identifier: "RedeemerSchema" })

export const toOgmiosUTxOs = (utxos: Array<CoreType.UTxO> | undefined): Array<UTxO> => {
  // NOTE: Ogmios only works with single encoding, not double encoding.
  // You will get the following error:
  // "Invalid request: couldn't decode Plutus script."
  // TODO: Ensure the CBOR script is sent with single encoding.
  const toOgmiosScript = (scriptRef: CoreType.UTxO["scriptRef"]): UTxO["script"] | null => {
    if (scriptRef) {
      switch (scriptRef.type) {
        case "PlutusV1":
          return {
            language: "plutus:v1",
            cbor: applySingleCborEncoding(scriptRef.script)
          }
        case "PlutusV2":
          return {
            language: "plutus:v2",
            cbor: applySingleCborEncoding(scriptRef.script)
          }
        case "PlutusV3":
          return {
            language: "plutus:v3",
            cbor: applySingleCborEncoding(scriptRef.script)
          }
        default:
          return null
      }
    }
  }

  const toOgmiosAssets = (assets: CoreType.Assets) => {
    const newAssets: Assets = {}
    Object.entries(assets).forEach(([unit, amount]) => {
      if (unit == "lovelace") return
      const { assetName, policyId } = fromUnit(unit)
      if (!newAssets[policyId]) {
        newAssets[policyId] = {}
      }
      return (newAssets[policyId][assetName ? assetName : ""] = Number(amount))
    })
    return newAssets
  }

  return (utxos || []).map(
    (utxo): UTxO => ({
      transaction: {
        id: utxo.txHash
      },
      index: utxo.outputIndex,
      address: utxo.address,
      value: {
        ada: { lovelace: Number(utxo.assets["lovelace"]) },
        ...toOgmiosAssets(utxo.assets)
      },
      datumHash: utxo.datumHash,
      datum: utxo.datum,
      script: toOgmiosScript(utxo.scriptRef)
    })
  )
}
