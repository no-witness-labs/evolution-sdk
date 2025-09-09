import { Data } from "effect"

import type * as AssetName from "../core/AssetName.js"
import type * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import * as PolicyId from "../core/PolicyId.js"
import * as ScriptHash from "../core/ScriptHash.js"
import type { NativeScriptWitnessInfo, PartialPlutusWitness } from "./WitnessBuilder.js"
import { InputAggregateWitnessData, PlutusScriptWitness, RequiredWitnessSet } from "./WitnessBuilder.js"

/**
 * Error class for MintBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class MintBuilderError extends Data.TaggedError("MintBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Convert ScriptHash to PolicyId
 * Since both are based on Hash28, we can convert by extracting the hash
 */
function scriptHashToPolicyId(scriptHash: ScriptHash.ScriptHash): PolicyId.PolicyId {
  return new PolicyId.PolicyId({ hash: scriptHash.hash }, { disableValidation: true })
}

/**
 * Result of building a mint operation
 *
 * @since 2.0.0
 * @category model
 */
export interface MintBuilderResult {
  policyId: PolicyId.PolicyId
  assets: Map<AssetName.AssetName, bigint>
  aggregateWitness?: InputAggregateWitnessData
  requiredWits: RequiredWitnessSet
}

/**
 * Builder for a single mint operation
 *
 * @since 2.0.0
 * @category builders
 */
export class SingleMintBuilder {
  constructor(public readonly assets: Map<AssetName.AssetName, bigint>) {}

  static new(assets: Map<AssetName.AssetName, bigint>): SingleMintBuilder {
    return new SingleMintBuilder(assets)
  }

  static newSingleAsset(asset: AssetName.AssetName, amount: bigint): SingleMintBuilder {
    const assets = new Map<AssetName.AssetName, bigint>()
    assets.set(asset, amount)
    return new SingleMintBuilder(assets)
  }

  nativeScript(nativeScript: NativeScripts.NativeScript, witnessInfo: NativeScriptWitnessInfo): MintBuilderResult {
    const requiredWits = RequiredWitnessSet.default()
    const scriptHash = ScriptHash.fromScript(nativeScript)
    requiredWits.addScriptHash(scriptHash)

    return {
      assets: this.assets,
      policyId: scriptHashToPolicyId(scriptHash),
      aggregateWitness: InputAggregateWitnessData.nativeScript(nativeScript, witnessInfo),
      requiredWits
    }
  }

  plutusScript(partialWitness: PartialPlutusWitness, requiredSigners: Array<KeyHash.KeyHash>): MintBuilderResult {
    const requiredWits = RequiredWitnessSet.default()

    const scriptHash = PlutusScriptWitness.hash(partialWitness.scriptWitness)
    requiredSigners.forEach((signer) => requiredWits.addVkeyKeyHash(signer))
    requiredWits.addScriptHash(scriptHash)

    return {
      assets: this.assets,
      policyId: scriptHashToPolicyId(scriptHash),
      aggregateWitness: InputAggregateWitnessData.plutusScript(
        partialWitness,
        requiredSigners,
        undefined // No datum for minting
      ),
      requiredWits
    }
  }
}
