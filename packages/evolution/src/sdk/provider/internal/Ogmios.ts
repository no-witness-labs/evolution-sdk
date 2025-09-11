import type { Record } from "effect"
import { Schema } from "effect"

import type * as Assets from "../../Assets.js"
import * as Script from "../../Script.js"
import * as Unit from "../../Unit.js"
import type * as UTxO from "../../UTxO.js"

export const JSONRPCSchema = <A, I, R>(schema: Schema.Schema<A, I, R>) =>
  Schema.Struct({
    jsonrpc: Schema.String,
    method: Schema.optional(Schema.String),
    id: Schema.NullOr(Schema.Number),
    result: schema
  }).annotations({ identifier: "JSONRPCSchema" })

const LovelaceAsset = Schema.Struct({
  lovelace: Schema.Number
})

const TupleNumberFromString = Schema.compose(Schema.split("/"), Schema.Array(Schema.NumberFromString))

export const ProtocolParametersSchema = Schema.Struct({
  minFeeCoefficient: Schema.Number,
  minFeeReferenceScripts: Schema.Struct({
    base: Schema.Number,
    range: Schema.Number,
    multiplier: Schema.Number
  }),
  maxReferenceScriptsSize: Schema.Struct({
    bytes: Schema.Number
  }),
  stakePoolVotingThresholds: Schema.Struct({
    noConfidence: TupleNumberFromString,
    constitutionalCommittee: Schema.Struct({
      default: TupleNumberFromString,
      stateOfNoConfidence: TupleNumberFromString
    }),
    hardForkInitiation: TupleNumberFromString,
    protocolParametersUpdate: Schema.Struct({
      security: TupleNumberFromString
    })
  }),
  delegateRepresentativeVotingThresholds: Schema.Struct({
    noConfidence: TupleNumberFromString,
    constitutionalCommittee: Schema.Struct({
      default: TupleNumberFromString,
      stateOfNoConfidence: TupleNumberFromString
    }),
    constitution: TupleNumberFromString,
    hardForkInitiation: TupleNumberFromString,
    protocolParametersUpdate: Schema.Struct({
      network: TupleNumberFromString,
      economic: TupleNumberFromString,
      technical: TupleNumberFromString,
      governance: TupleNumberFromString
    }),
    treasuryWithdrawals: TupleNumberFromString
  }),
  constitutionalCommitteeMinSize: Schema.optional(Schema.Number),
  constitutionalCommitteeMaxTermLength: Schema.Number,
  governanceActionLifetime: Schema.Number,
  governanceActionDeposit: Schema.Struct({
    ada: LovelaceAsset
  }),
  delegateRepresentativeDeposit: Schema.Struct({
    ada: LovelaceAsset
  }),
  delegateRepresentativeMaxIdleTime: Schema.Number,
  minFeeConstant: Schema.Struct({ ada: LovelaceAsset }),
  maxBlockBodySize: Schema.Struct({ bytes: Schema.Number }),
  maxBlockHeaderSize: Schema.Struct({ bytes: Schema.Number }),
  maxTransactionSize: Schema.Struct({ bytes: Schema.Number }),
  stakeCredentialDeposit: Schema.Struct({ ada: LovelaceAsset }),
  stakePoolDeposit: Schema.Struct({ ada: LovelaceAsset }),
  stakePoolRetirementEpochBound: Schema.Number,
  desiredNumberOfStakePools: Schema.Number,
  stakePoolPledgeInfluence: TupleNumberFromString,
  monetaryExpansion: TupleNumberFromString,
  treasuryExpansion: TupleNumberFromString,
  minStakePoolCost: Schema.Struct({ ada: LovelaceAsset }),
  minUtxoDepositConstant: Schema.Struct({ ada: LovelaceAsset }),
  minUtxoDepositCoefficient: Schema.Number,
  plutusCostModels: Schema.Struct({
    "plutus:v1": Schema.Array(Schema.Number),
    "plutus:v2": Schema.Array(Schema.Number),
    "plutus:v3": Schema.Array(Schema.Number)
  }),
  scriptExecutionPrices: Schema.Struct({
    memory: TupleNumberFromString,
    cpu: TupleNumberFromString
  }),
  maxExecutionUnitsPerTransaction: Schema.Struct({
    memory: Schema.Number,
    cpu: Schema.Number
  }),
  maxExecutionUnitsPerBlock: Schema.Struct({ memory: Schema.Number, cpu: Schema.Number }),
  maxValueSize: Schema.Struct({ bytes: Schema.Number }),
  collateralPercentage: Schema.Number,
  maxCollateralInputs: Schema.Number,
  version: Schema.Struct({ major: Schema.Number, minor: Schema.Number })
}).annotations({ identifier: "ProtocolParametersSchema" })

export interface ProtocolParameters extends Schema.Schema.Type<typeof ProtocolParametersSchema> {}

export const Delegation = Schema.NullOr(
  Schema.Record({
    key: Schema.String,
    value: Schema.Struct({
      delegate: Schema.Struct({ id: Schema.String }),
      rewards: Schema.Struct({ ada: Schema.Struct({ lovelace: Schema.Number }) }),
      deposit: Schema.Struct({ ada: Schema.Struct({ lovelace: Schema.Number }) })
    })
  })
)

type Script = {
  language: "plutus:v1" | "plutus:v2" | "plutus:v3"
  cbor: string
}

export type OgmiosAssets = Record<string, Record<string, number>>

export type Value = {
  ada: { lovelace: number }
} & OgmiosAssets

export type OgmiosUTxO = {
  transaction: { id: string }
  index: number
  address: string
  value: Value
  datumHash?: string | undefined
  datum?: string | undefined
  script?: Script | undefined
}

export const RedeemerSchema = Schema.Struct({
  validator: Schema.Struct({
    purpose: Schema.Literal("spend", "mint", "publish", "withdraw", "vote", "propose"),
    index: Schema.Int
  }),
  budget: Schema.Struct({
    memory: Schema.Int,
    cpu: Schema.Int
  })
}).annotations({ identifier: "RedeemerSchema" })

export const toOgmiosUTxOs = (utxos: Array<UTxO.UTxO> | undefined): Array<OgmiosUTxO> => {
  // NOTE: Ogmios only works with single encoding, not double encoding.
  // You will get the following error:
  // "Invalid request: couldn't decode Plutus script."
  // TODO: Ensure the CBOR script is sent with single encoding.
  const toOgmiosScript = (scriptRef: UTxO.UTxO["scriptRef"]): OgmiosUTxO["script"] | undefined => {
    if (scriptRef) {
      switch (scriptRef.type) {
        case "PlutusV1":
          return {
            language: "plutus:v1",
            cbor: Script.applySingleCborEncoding(scriptRef.script)
          }
        case "PlutusV2":
          return {
            language: "plutus:v2",
            cbor: Script.applySingleCborEncoding(scriptRef.script)
          }
        case "PlutusV3":
          return {
            language: "plutus:v3",
            cbor: Script.applySingleCborEncoding(scriptRef.script)
          }
        default:
          return undefined
      }
    }
  }

  const toOgmiosAssets = (assets: Assets.Assets) => {
    const newAssets: OgmiosAssets = {}
    Object.entries(assets).forEach(([unit, amount]) => {
      if (unit == "lovelace") return
      const { assetName, policyId } = Unit.fromUnit(unit)
      if (!newAssets[policyId]) {
        newAssets[policyId] = {}
      }
      return (newAssets[policyId][assetName ? assetName : ""] = Number(amount))
    })
    return newAssets
  }

  return (utxos || []).map(
    (utxo): OgmiosUTxO => ({
      transaction: {
        id: utxo.txHash
      },
      index: utxo.outputIndex,
      address: utxo.address,
      value: {
        ada: { lovelace: Number(utxo.assets["lovelace"]) },
        ...toOgmiosAssets(utxo.assets)
      },
      datumHash: utxo.datumOption?.type === "datumHash" ? utxo.datumOption.hash : undefined,
      datum: utxo.datumOption?.type === "inlineDatum" ? utxo.datumOption.inline : undefined,
      script: toOgmiosScript(utxo.scriptRef)
    })
  )
}
