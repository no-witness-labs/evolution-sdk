import { Array as _Array, Effect } from "effect"

import type * as UTxO from "../../sdk/UTxO.js"
import type * as Address from "../Address.js"
import type * as Delegation from "../Delegation.js"
import type { EvalRedeemer } from "../EvalRedeemer.js"
import type * as OutRef from "../OutRef.js"
import type * as ProtocolParameters from "../ProtocolParameters.js"
import type * as RewardAddress from "../RewardAddress.js"
import type * as Unit from "../Unit.js"
import * as KupmiosService from "./KupmiosService.js"
import type { Provider } from "./Provider.js"

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

  async getProtocolParameters(): Promise<ProtocolParameters.ProtocolParameters> {
    return Effect.runPromise(KupmiosService.getProtocolParametersEffect(this.ogmiosUrl, this.headers?.ogmiosHeader))
  }

  async getUtxos(address: Address.Address): Promise<Array<UTxO.UTxO>> {
    return Effect.runPromise(KupmiosService.getUtxosEffect(this.kupoUrl, this.headers?.kupoHeader)(address))
  }

  async getUtxosWithUnit(
    addressOrCredential: Address.Address | { hash: string },
    unit: Unit.Unit
  ): Promise<Array<UTxO.UTxO>> {
    return Effect.runPromise(
      KupmiosService.getUtxosWithUnitEffect(this.kupoUrl, this.headers?.kupoHeader)(addressOrCredential, unit)
    )
  }

  async getUtxoByUnit(unit: Unit.Unit): Promise<UTxO.UTxO> {
    return Effect.runPromise(KupmiosService.getUtxoByUnitEffect(this.kupoUrl, this.headers?.kupoHeader)(unit))
  }

  async getUtxosByOutRef(outRefs: ReadonlyArray<OutRef.OutRef>): Promise<Array<UTxO.UTxO>> {
    return Effect.runPromise(KupmiosService.getUtxosByOutRefEffect(this.kupoUrl, this.headers?.kupoHeader)(outRefs))
  }

  async getDelegation(rewardAddress: RewardAddress.RewardAddress): Promise<Delegation.Delegation> {
    return Effect.runPromise(KupmiosService.getDelegationEffect(this.kupoUrl, this.headers?.kupoHeader)(rewardAddress))
  }

  async getDatum(datumHash: string): Promise<string> {
    return Effect.runPromise(KupmiosService.getDatumEffect(this.kupoUrl, this.headers?.kupoHeader)(datumHash))
  }

  async awaitTx(txHash: string, checkInterval?: number): Promise<boolean> {
    return Effect.runPromise(
      KupmiosService.awaitTxEffect(this.kupoUrl, this.headers?.kupoHeader)(txHash, checkInterval)
    )
  }

  async evaluateTx(tx: string, additionalUTxOs?: Array<UTxO.UTxO>): Promise<Array<EvalRedeemer>> {
    return Effect.runPromise(
      KupmiosService.evaluateTxEffect(this.ogmiosUrl, this.headers?.ogmiosHeader)(tx, additionalUTxOs)
    )
  }

  async submitTx(tx: string): Promise<string> {
    return Effect.runPromise(KupmiosService.submitTxEffect(this.ogmiosUrl, this.headers?.ogmiosHeader)(tx))
  }
}
