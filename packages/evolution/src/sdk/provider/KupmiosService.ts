import { FetchHttpClient } from "@effect/platform"
import { Array as _Array, Context, Effect, Layer, pipe, Schedule, Schema } from "effect"

import type * as Address from "../Address.js"
import type * as Assets from "../Assets.js"
import type * as Credential from "../Credential.js"
import type { EvalRedeemer } from "../EvalRedeemer.js"
import type * as OutRef from "../OutRef.js"
import type * as ProtocolParameters from "../ProtocolParameters.js"
import type * as RewardAddress from "../RewardAddress.js"
import * as Script from "../Script.js"
import * as Unit from "../Unit.js"
import type * as UTxO from "../UTxO.js"
import * as HttpUtils from "./internal/HttpUtils.js"
import * as Kupo from "./internal/Kupo.js"
import * as Ogmios from "./internal/Ogmios.js"
import { ProviderError, ProviderService } from "./Provider.js"

const TIMEOUT = 10_000

// Configuration service for Kupmios URLs and headers
export class KupmiosConfig extends Context.Tag("KupmiosConfig")<
  KupmiosConfig,
  {
    readonly kupoUrl: string
    readonly ogmiosUrl: string
    readonly headers?: {
      readonly kupoHeader?: Record<string, string>
      readonly ogmiosHeader?: Record<string, string>
    }
  }
>() {}

// Utility functions
export const toProtocolParameters = (result: Ogmios.ProtocolParameters): ProtocolParameters.ProtocolParameters => {
  return {
    minFeeA: result.minFeeCoefficient,
    minFeeB: result.minFeeConstant.ada.lovelace,
    maxTxSize: result.maxTransactionSize.bytes,
    maxValSize: result.maxValueSize.bytes,
    keyDeposit: BigInt(result.stakeCredentialDeposit.ada.lovelace),
    poolDeposit: BigInt(result.stakePoolDeposit.ada.lovelace),
    drepDeposit: BigInt(result.delegateRepresentativeDeposit.ada.lovelace),
    govActionDeposit: BigInt(result.governanceActionDeposit.ada.lovelace),
    priceMem: result.scriptExecutionPrices.memory[0] / result.scriptExecutionPrices.memory[1],
    priceStep: result.scriptExecutionPrices.cpu[0] / result.scriptExecutionPrices.cpu[1],
    maxTxExMem: BigInt(result.maxExecutionUnitsPerTransaction.memory),
    maxTxExSteps: BigInt(result.maxExecutionUnitsPerTransaction.cpu),
    coinsPerUtxoByte: BigInt(result.minUtxoDepositCoefficient),
    collateralPercentage: result.collateralPercentage,
    maxCollateralInputs: result.maxCollateralInputs,
    minFeeRefScriptCostPerByte: result.minFeeReferenceScripts.base,
    costModels: {
      PlutusV1: Object.fromEntries(
        result.plutusCostModels["plutus:v1"].map((value, index) => [index.toString(), value])
      ),
      PlutusV2: Object.fromEntries(
        result.plutusCostModels["plutus:v2"].map((value, index) => [index.toString(), value])
      ),
      PlutusV3: Object.fromEntries(
        result.plutusCostModels["plutus:v3"].map((value, index) => [index.toString(), value])
      )
    }
  }
}

export const toAssets = (value: Kupo.UTxO["value"]): Assets.Assets => {
  const assets: Assets.Assets = { lovelace: BigInt(value.coins) }
  for (const unit of Object.keys(value.assets)) {
    assets[unit.replace(".", "")] = BigInt(value.assets[unit])
  }
  return assets
}

export const retrieveDatumEffect =
  (kupoUrl: string, kupoHeader?: Record<string, string>) =>
  (datum_type: Kupo.UTxO["datum_type"], datum_hash: Kupo.UTxO["datum_hash"]) =>
    Effect.gen(function* () {
      if (datum_type === "inline" && datum_hash) {
        const pattern = `${kupoUrl}/datums/${datum_hash}`
        const schema = Kupo.DatumSchema
        return yield* pipe(
          HttpUtils.get(pattern, schema, kupoHeader),
          Effect.flatMap(Effect.fromNullable),
          Effect.map(
            (result) =>
              ({
                type: "inlineDatum",
                inline: result.datum
              }) as const
          ),
          Effect.retry(Schedule.compose(Schedule.exponential(50), Schedule.recurs(5))),
          Effect.timeout(5_000)
        )
      } else if (datum_type === "hash" && datum_hash) {
        return { type: "datumHash", hash: datum_hash } as const
      }

      return undefined
    })

export const getScriptEffect =
  (kupoUrl: string, kupoHeader?: Record<string, string>) => (script_hash: Kupo.UTxO["script_hash"]) =>
    Effect.gen(function* () {
      if (script_hash) {
        const pattern = `${kupoUrl}/scripts/${script_hash}`
        const schema = Kupo.ScriptSchema
        return yield* pipe(
          HttpUtils.get(pattern, schema, kupoHeader),
          Effect.flatMap(Effect.fromNullable),
          Effect.retry(Schedule.compose(Schedule.exponential(50), Schedule.recurs(5))),
          Effect.timeout(5_000),
          Effect.map(({ language, script }) => {
            switch (language) {
              case "native":
                return {
                  type: "Native",
                  script
                } satisfies Script.Native
              case "plutus:v1":
                return {
                  type: "PlutusV1",
                  script: Script.applyDoubleCborEncoding(script)
                } satisfies Script.PlutusV1
              case "plutus:v2":
                return {
                  type: "PlutusV2",
                  script: Script.applyDoubleCborEncoding(script)
                } satisfies Script.PlutusV2
              case "plutus:v3":
                return {
                  type: "PlutusV3",
                  script: Script.applyDoubleCborEncoding(script)
                } satisfies Script.PlutusV3
            }
          })
        )
      } else return undefined
    })

export const kupmiosUtxosToUtxos =
  (kupoURL: string, kupoHeader?: Record<string, string>) => (utxos: ReadonlyArray<Kupo.UTxO>) => {
    const getDatum = retrieveDatumEffect(kupoURL, kupoHeader)
    const getScript = getScriptEffect(kupoURL, kupoHeader)
    return Effect.forEach(
      utxos,
      (utxo) => {
        return pipe(
          Effect.all([getDatum(utxo.datum_type, utxo.datum_hash), getScript(utxo.script_hash)]),
          Effect.map(
            ([datum, script]): UTxO.UTxO => ({
              address: utxo.address,
              txHash: utxo.transaction_id,
              outputIndex: utxo.output_index,
              assets: toAssets(utxo.value),
              datumOption: datum,
              scriptRef: script
            })
          )
        )
      },
      { concurrency: "unbounded" }
    )
  }

export const getProtocolParametersEffect = Effect.fn("getProtocolParameters")(function* (
  ogmiosUrl: string,
  headers?: { ogmiosHeader?: Record<string, string> }
) {
  const data = {
    jsonrpc: "2.0",
    method: "queryLedgerState/protocolParameters",
    params: {},
    id: null
  } as const

  const schema = Ogmios.JSONRPCSchema(Ogmios.ProtocolParametersSchema)
  const { result } = yield* pipe(
    HttpUtils.postJson(ogmiosUrl, data, schema, headers?.ogmiosHeader),
    Effect.timeout(TIMEOUT),
    Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get protocol parameters" })),
    Effect.provide(FetchHttpClient.layer)
  )
  return toProtocolParameters(result)
})

export const getUtxosEffect = (kupoUrl: string, headers?: { kupoHeader?: Record<string, string> }) =>
  Effect.fn("getUtxos")(function* (addressOrCredential: Address.Address | Credential.Credential) {
    let pattern: string
    if (typeof addressOrCredential === "string") {
      pattern = `${kupoUrl}/matches/${addressOrCredential}?unspent`
    } else {
      pattern = `${kupoUrl}/matches/${addressOrCredential.hash}/*?unspent`
    }
    const toUtxos = kupmiosUtxosToUtxos(kupoUrl, headers?.kupoHeader)

    const schema = Schema.Array(Kupo.UTxOSchema)
    const utxos = yield* pipe(
      HttpUtils.get(pattern, schema, headers?.kupoHeader),
      Effect.flatMap((u) => toUtxos(u)),
      Effect.timeout(TIMEOUT),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get UTxOs" })),
      Effect.provide(FetchHttpClient.layer)
    )
    return utxos
  })

export const getUtxoByUnitEffect = (kupoUrl: string, headers?: { kupoHeader?: Record<string, string> }) =>
  Effect.fn("getUtxoByUnit")(function* (unit: Unit.Unit) {
    const { assetName, policyId } = Unit.fromUnit(unit)
    const pattern = `${kupoUrl}/matches/${policyId}.${assetName ? `${assetName}` : "*"}?unspent`

    const toUtxos = kupmiosUtxosToUtxos(kupoUrl, headers?.kupoHeader)

    const schema = Schema.Array(Kupo.UTxOSchema)
    const utxos = yield* pipe(
      HttpUtils.get(pattern, schema, headers?.kupoHeader),
      Effect.flatMap((u) => toUtxos(u)),
      Effect.timeout(TIMEOUT),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get UTxO by unit" })),
      Effect.provide(FetchHttpClient.layer)
    )

    if (utxos.length > 1) {
      return yield* Effect.fail(
        new ProviderError({
          cause: new Error("Unit needs to be an NFT or only held by one address."),
          message: "Multiple UTxOs found for unit"
        })
      )
    }

    if (utxos.length === 0) {
      return yield* Effect.fail(
        new ProviderError({
          cause: new Error("No UTxO found for unit"),
          message: "UTxO not found"
        })
      )
    }

    return utxos[0]
  })

export const getUtxosByOutRefEffect = (kupoUrl: string, headers?: { kupoHeader?: Record<string, string> }) =>
  Effect.fn("getUtxosByOutRef")(function* (outRefs: ReadonlyArray<OutRef.OutRef>) {
    const queryHashes: Array<string> = [...new Set(outRefs.map((outRef) => outRef.txHash))]
    const mkPattern = (txHash: string) => `${kupoUrl}/matches/*@${txHash}?unspent`
    const schema = Schema.Array(Kupo.UTxOSchema)
    const toUtxos = kupmiosUtxosToUtxos(kupoUrl, headers?.kupoHeader)
    const program = Effect.forEach(queryHashes, (txHash) =>
      pipe(
        HttpUtils.get(mkPattern(txHash), schema, headers?.kupoHeader),
        Effect.flatMap((u) => toUtxos(u)),
        Effect.timeout(TIMEOUT),
        Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get UTxOs by OutRef" }))
      )
    )
    const utxos: Array<Array<UTxO.UTxO>> = yield* pipe(program, Effect.provide(FetchHttpClient.layer))

    return _Array
      .flatten(utxos)
      .filter((utxo) =>
        outRefs.some((outRef) => utxo.txHash === outRef.txHash && utxo.outputIndex === outRef.outputIndex)
      )
  })

export const submitTxEffect = (ogmiosUrl: string, headers?: { ogmiosHeader?: Record<string, string> }) =>
  Effect.fn("submitTx")(function* (tx: string) {
    const data = {
      jsonrpc: "2.0",
      method: "submitTransaction",
      params: {
        transaction: { cbor: tx }
      },
      id: null
    } as const

    const schema = Ogmios.JSONRPCSchema(
      Schema.Struct({
        transaction: Schema.Struct({
          id: Schema.String
        })
      })
    )

    const { result } = yield* pipe(
      HttpUtils.postJson(ogmiosUrl, data, schema, headers?.ogmiosHeader),
      Effect.timeout(TIMEOUT),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to submit transaction" })),
      Effect.provide(FetchHttpClient.layer)
    )

    // Return the transaction ID as a string
    return result.transaction.id
  })

export const getUtxosWithUnitEffect = (kupoUrl: string, headers?: { kupoHeader?: Record<string, string> }) =>
  Effect.fn("getUtxosWithUnit")(function* (addressOrCredential: Address.Address | { hash: string }, unit: Unit.Unit) {
    const isAddress = typeof addressOrCredential === "string"
    const queryPredicate = isAddress ? addressOrCredential : addressOrCredential.hash
    const { assetName, policyId } = Unit.fromUnit(unit)
    const pattern = `${kupoUrl}/matches/${queryPredicate}${isAddress ? "" : "/*"}?unspent&policy_id=${policyId}${assetName ? `&asset_name=${assetName}` : ""}`

    const schema = Schema.Array(Kupo.UTxOSchema)
    const toUtxos = kupmiosUtxosToUtxos(kupoUrl, headers?.kupoHeader)
    const utxos = yield* pipe(
      HttpUtils.get(pattern, schema, headers?.kupoHeader),
      Effect.flatMap((u) => toUtxos(u)),
      Effect.timeout(TIMEOUT),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get UTxOs with unit" })),
      Effect.provide(FetchHttpClient.layer)
    )
    return utxos
  })

export const evaluateTxEffect = (ogmiosUrl: string, headers?: { ogmiosHeader?: Record<string, string> }) =>
  Effect.fn("evaluateTx")(function* (tx: string, additionalUTxOs?: Array<UTxO.UTxO>) {
    // Prepare request data
    const data = {
      jsonrpc: "2.0",
      method: "evaluateTransaction",
      params: {
        transaction: { cbor: tx },
        additionalUtxo: Ogmios.toOgmiosUTxOs(additionalUTxOs)
      },
      id: null
    }

    // Define the schema
    const schema = Ogmios.JSONRPCSchema(Schema.Array(Ogmios.RedeemerSchema))

    // Perform the request and handle the response
    const { result } = yield* pipe(
      HttpUtils.postJson(ogmiosUrl, data, schema, headers?.ogmiosHeader),
      Effect.provide(FetchHttpClient.layer),
      Effect.timeout(TIMEOUT),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to evaluate transaction" }))
    )

    const evalRedeemers: Array<EvalRedeemer> = (result as Array<any>).map((item: any) => ({
      ex_units: {
        mem: item.budget.memory,
        steps: item.budget.cpu
      },
      redeemer_index: item.validator.index,
      redeemer_tag: item.validator.purpose
    }))

    return evalRedeemers
  })

export const awaitTxEffect = (kupoUrl: string, headers?: { kupoHeader?: Record<string, string> }) =>
  Effect.fn("awaitTx")(function* (txHash: string, checkInterval = 20000) {
    const pattern = `${kupoUrl}/matches/*@${txHash}?unspent`
    const schema = Schema.Array(Kupo.UTxOSchema).annotations({
      identifier: "Array<KupmiosSchema.KupoUTxO>"
    })

    const result = yield* pipe(
      HttpUtils.get(pattern, schema, headers?.kupoHeader),
      Effect.provide(FetchHttpClient.layer),
      Effect.repeat({
        schedule: Schedule.exponential(checkInterval),
        until: (result) => result.length > 0
      }),
      Effect.timeout(160_000),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to await transaction" })),
      Effect.as(true)
    )
    return result
  })

export const getDelegationEffect = (ogmiosUrl: string, headers?: { ogmiosHeader?: Record<string, string> }) =>
  Effect.fn("getDelegation")(function* (rewardAddress: RewardAddress.RewardAddress) {
    const data = {
      jsonrpc: "2.0",
      method: "queryLedgerState/rewardAccountSummaries",
      params: { keys: [rewardAddress] },
      id: null
    }
    const schema = Ogmios.JSONRPCSchema(Ogmios.Delegation)
    const { result } = yield* pipe(
      HttpUtils.postJson(ogmiosUrl, data, schema, headers?.ogmiosHeader),
      Effect.provide(FetchHttpClient.layer),
      Effect.timeout(TIMEOUT),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get delegation" }))
    )
    const delegation = result ? (Object.values(result)[0] as any) : null

    return {
      poolId: delegation?.delegate?.id || null,
      rewards: BigInt(delegation?.rewards?.ada?.lovelace || 0)
    }
  })

export const getDatumEffect = (kupoUrl: string, headers?: { kupoHeader?: Record<string, string> }) =>
  Effect.fn("getDatum")(function* (datumHash: string) {
    const pattern = `${kupoUrl}/datums/${datumHash}`
    const schema = Kupo.DatumSchema
    const result = yield* pipe(
      HttpUtils.get(pattern, schema, headers?.kupoHeader),
      Effect.provide(FetchHttpClient.layer),
      Effect.timeout(TIMEOUT),
      Effect.flatMap(Effect.fromNullable),
      Effect.catchAll((cause) => new ProviderError({ cause, message: "Failed to get datum" }))
    )
    return result.datum
  })

// Factory function to create a configured layer
export const makeKupmiosLayer = (
  kupoUrl: string,
  ogmiosUrl: string,
  headers?: {
    kupoHeader?: Record<string, string>
    ogmiosHeader?: Record<string, string>
  }
) => {
  return Layer.succeed(
    ProviderService,
    ProviderService.of({
      getProtocolParameters: getProtocolParametersEffect(ogmiosUrl, headers?.ogmiosHeader),
      getUtxos: getUtxosEffect(kupoUrl, headers?.kupoHeader),
      getUtxoByUnit: getUtxoByUnitEffect(kupoUrl, headers?.kupoHeader),
      getUtxosByOutRef: getUtxosByOutRefEffect(kupoUrl, headers?.kupoHeader),
      getUtxosWithUnit: getUtxosWithUnitEffect(kupoUrl, headers?.kupoHeader),
      submitTx: submitTxEffect(ogmiosUrl, headers?.ogmiosHeader),
      evaluateTx: evaluateTxEffect(ogmiosUrl, headers?.ogmiosHeader),
      awaitTx: awaitTxEffect(kupoUrl, headers?.kupoHeader),
      getDelegation: getDelegationEffect(ogmiosUrl, headers?.ogmiosHeader),
      getDatum: getDatumEffect(kupoUrl, headers?.kupoHeader)
    })
  )
}
