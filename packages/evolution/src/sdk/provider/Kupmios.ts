import { FetchHttpClient } from "@effect/platform"
import { Effect, Layer, pipe, Schedule, Schema } from "effect"

import type * as Address from "../../core/AddressEras.js"
import type * as BaseAddress from "../../core/BaseAddress.js"
import { fromHex } from "../../core/Bytes.js"
import type * as Credential from "../../core/Credential.js"
import * as Data from "../../core/Data.js"
import * as DatumOption from "../../core/DatumOption.js"
import type * as EnterpriseAddress from "../../core/EnterpriseAddress.js"
import type { TransactionHash } from "../../core/TransactionHash.js"
import type * as Assets from "../../sdk/Assets.js"
import type * as UTxO from "../../sdk/UTxO.js"
import * as HttpUtils from "./internal/HttpUtils.js"
import * as Kupo from "./internal/Kupo.js"
import * as Ogmios from "./internal/Ogmios.js"
import type { Provider } from "./Provider.js"
import { ProviderError, ProviderService } from "./Provider.js"
import type { ProtocolParameters } from "./types.js"

const TIMEOUT = 10_000

export const toProtocolParameters = (result: Ogmios.ProtocolParameters): ProtocolParameters => {
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
    // NOTE: coinsPerUtxoByte is now called utxoCostPerByte:
    // https://github.com/IntersectMBO/cardano-node/pull/4141
    // Ogmios v6.x calls it minUtxoDepositCoefficient according to the following
    // documentation from its protocol parameters data model:
    // https://github.com/CardanoSolutions/ogmios/blob/master/architectural-decisions/accepted/017-api-version-6-major-rewrite.md#protocol-parameters
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

const getDatumEffect = (
  kupoUrl: string,
  datum_type: Kupo.UTxO["datum_type"],
  datum_hash: Kupo.UTxO["datum_hash"],
  kupoHeader?: Record<string, string>
) =>
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
              inline: result.datum
            }) as UTxO.Datum
        ),
        Effect.retry(Schedule.compose(Schedule.exponential(50), Schedule.recurs(5))),
        Effect.timeout(5_000)
      )
    } else if (datum_type === "hash" && datum_hash) {
      return { hash: datum_hash } as UTxO.Datum
    }

    return undefined
  })

const toAssets = (value: Kupo.UTxO["value"]): Assets.Assets => {
  const assets: Assets.Assets = { lovelace: BigInt(value.coins) }
  for (const unit of Object.keys(value.assets)) {
    assets[unit.replace(".", "")] = BigInt(value.assets[unit])
  }
  return assets
}

const kupmiosUtxosToUtxos = (kupoURL: string, utxos: ReadonlyArray<Kupo.UTxO>, kupoHeader?: Record<string, string>) =>
  Effect.forEach(
    utxos,
    (utxo) => {
      return pipe(
        Effect.all([
          getDatumEffect(kupoURL, utxo.datum_type, utxo.datum_hash, kupoHeader),
          getScriptEffect(kupoURL, utxo.script_hash, kupoHeader)
        ]),
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

const getScriptEffect = (kupoUrl: string, script_hash: Kupo.UTxO["script_hash"], kupoHeader?: Record<string, string>) =>
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
              } satisfies Script
            case "plutus:v1":
              return {
                type: "PlutusV1",
                script: applyDoubleCborEncoding(script)
              } satisfies Script
            case "plutus:v2":
              return {
                type: "PlutusV2",
                script: applyDoubleCborEncoding(script)
              } satisfies Script
            case "plutus:v3":
              return {
                type: "PlutusV3",
                script: applyDoubleCborEncoding(script)
              } satisfies Script
          }
        })
      )
    } else return undefined
  })

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

// async getUtxos(addressOrCredential: Address | Credential): Promise<UTxO[]> {
//     const isAddress = typeof addressOrCredential === "string";
//     const queryPredicate = isAddress
//       ? addressOrCredential
//       : addressOrCredential.hash;
//     const pattern = `${this.kupoUrl}/matches/${queryPredicate}${isAddress ? "" : "/*"}?unspent`;
//     const schema = S.Array(Kupo.UTxOSchema);
//     const utxos = await pipe(
//       HttpUtils.makeGet(pattern, schema, this.headers?.kupoHeader),
//       Effect.flatMap((u) => kupmiosUtxosToUtxos(this.kupoUrl, u)),
//       Effect.timeout(10_000),
//       Effect.catchAll((cause) => new KupmiosError({ cause })),
//       Effect.provide(FetchHttpClient.layer),
//       Effect.runPromise,
//     );
//     return utxos;
//   }
export const getUtxos = (kupoUrl: string, headers?: { [key: string]: string }) =>
  Effect.fn("getUtxos")(function* (
    addressOrCredential: EnterpriseAddress.EnterpriseAddress | BaseAddress.BaseAddress | Credential.Credential
  ) {
    let pattern: string
    switch (addressOrCredential._tag) {
      case "EnterpriseAddress":
        pattern = `${kupoUrl}/matches/${addressOrCredential.toString()}?unspent`
        break
      case "BaseAddress":
        pattern = `${kupoUrl}/matches/${addressOrCredential.toString()}?unspent`
        break
      case "KeyHash":
        pattern = `${kupoUrl}/matches/${addressOrCredential.toString()}/*?unspent`
        break
      case "ScriptHash":
        pattern = `${kupoUrl}/matches/${addressOrCredential.toString()}/*?unspent`
        break
    }
    const schema = Schema.Array(Kupo.UTxOSchema)
    const utxos = yield* pipe(
      HttpUtils.get(pattern, schema, headers),
      Effect.flatMap((u) => kupmiosUtxosToUtxos(kupoUrl, u)),
      Effect.timeout(10_000),
      Effect.catchAll((cause) => new KupmiosError({ cause })),
      Effect.provide(FetchHttpClient.layer)
    )

    // const isAddress = typeof addressOrCredential === "string";
    // const queryPredicate = isAddress
    //   ? addressOrCredential
    //   : addressOrCredential.hash;
    // const pattern = `${this.kupoUrl}/matches/${queryPredicate}${isAddress ? "" : "/*"}?unspent`;
    // const schema = S.Array(Kupo.UTxOSchema);
    // const utxos = await pipe(
    //   HttpUtils.makeGet(pattern, schema, this.headers?.kupoHeader),
    //   Effect.flatMap((u) => kupmiosUtxosToUtxos(this.kupoUrl, u)),
    //   Effect.timeout(10_000),
    //   Effect.catchAll((cause) => new KupmiosError({ cause })),
    //   Effect.provide(FetchHttpClient.layer),
    //   Effect.runPromise,
    // );
    // return utxos;
  })

/**
 * Provides support for interacting with both Kupo and Ogmios APIs.
 *
 * @example Using Local URLs (No Authentication):
 * ```typescript
 * const kupmios = new KupmiosProvider(
 *   "http://localhost:1442", // Kupo API URL
 *   "http://localhost:1337"  // Ogmios API URL
 * );
 * ```
 *
 * @example Using Authenticated URLs (No Custom Headers):
 * ```typescript
 * const kupmios = new KupmiosProvider(
 *   "https://dmtr_kupoXXX.preprod-v2.kupo-m1.demeter.run", // Kupo Authenticated URL
 *   "https://dmtr_ogmiosXXX.preprod-v6.ogmios-m1.demeter.run" // Ogmios Authenticated URL
 * );
 * ```
 *
 * @example Using Public URLs with Custom Headers:
 * ```typescript
 * const kupmios = new KupmiosProvider(
 *   "https://preprod-v2.kupo-m1.demeter.run", // Kupo API URL
 *   "https://preprod-v6.ogmios-m1.demeter.run", // Ogmios API URL
 *   {
 *     kupoHeader: { "dmtr-api-key": "dmtr_kupoXXX" }, // Custom header for Kupo
 *     ogmiosHeader: { "dmtr-api-key": "dmtr_ogmiosXXX" } // Custom header for Ogmios
 *   }
 * );
 */
export class KupmiosProvider implements Provider {
  private readonly kupoUrl: string
  private readonly ogmiosUrl: string
  private readonly headers?: {
    readonly ogmiosHeader?: Record<string, string>
    readonly kupoHeader?: Record<string, string>
  }

  constructor(
    kupoUrl: string,
    ogmiosUrl: string,
    headers?: {
      ogmiosHeader?: Record<string, string>
      kupoHeader?: Record<string, string>
    }
  ) {
    this.kupoUrl = kupoUrl
    this.ogmiosUrl = ogmiosUrl
    this.headers = headers
  }

  async getProtocolParameters(): Promise<ProtocolParameters> {
    return Effect.runPromise(getProtocolParametersEffect(this.ogmiosUrl, this.headers))
  }

  async getUtxos(_address: Address): Promise<Array<UTxO>> {
    // TODO: Implement UTxO fetching from Kupo
    throw new Error("getUtxos not implemented yet")
  }

  async submitTx(_tx: string): Promise<TransactionHash> {
    // TODO: Implement transaction submission to Ogmios
    throw new Error("submitTx not implemented yet")
  }
}

export const makeKupmiosLayer = (
  kupoUrl: string,
  ogmiosUrl: string,
  headers?: {
    ogmiosHeader?: Record<string, string>
    kupoHeader?: Record<string, string>
  }
) =>
  Layer.succeed(ProviderService, {
    getProtocolParameters: getProtocolParametersEffect(ogmiosUrl, headers),
    getUtxos: (_address: Address) =>
      Effect.fail(
        new ProviderError({
          cause: "Not implemented",
          message: "getUtxos not implemented yet"
        })
      ),
    submitTx: (_tx: string) =>
      Effect.fail(
        new ProviderError({
          cause: "Not implemented",
          message: "submitTx not implemented yet"
        })
      )
  })
