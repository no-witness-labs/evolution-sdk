import { Data, Schema } from "effect"

import * as ByronAddress from "../core/ByronAddress.js"
import type * as PlutusData from "../core/Data.js"
import * as DatumOption from "../core/DatumOption.js"
import * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import type * as PlutusV1 from "../core/PlutusV1.js"
import type * as PlutusV2 from "../core/PlutusV2.js"
import type * as PlutusV3 from "../core/PlutusV3.js"
import * as Redeemer from "../core/Redeemer.js"
import * as ScriptHash from "../core/ScriptHash.js"

/**
 * Error class for WitnessBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class WitnessBuilderError extends Data.TaggedError("WitnessBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Redeemer witness key for identifying redeemers by tag and index.
 *
 * @since 2.0.0
 * @category model
 */
export class RedeemerWitnessKey extends Schema.Class<RedeemerWitnessKey>("RedeemerWitnessKey")({
  tag: Redeemer.RedeemerTag,
  index: Schema.BigInt.annotations({
    identifier: "RedeemerWitnessKey.Index",
    description: "Index into the respective transaction array"
  })
}) {
  static new(tag: Redeemer.RedeemerTag, index: bigint): RedeemerWitnessKey {
    return new RedeemerWitnessKey({ tag, index })
  }
}

/**
 * Required witness set tracking what witnesses are needed
 *
 * @since 2.0.0
 * @category model
 */
export class RequiredWitnessSet extends Schema.Class<RequiredWitnessSet>("RequiredWitnessSet")({
  vkeys: Schema.Array(KeyHash.KeyHash),
  bootstraps: Schema.Array(ByronAddress.ByronAddress),
  scripts: Schema.Array(ScriptHash.ScriptHash),
  plutusData: Schema.Array(DatumOption.DatumHash),
  redeemers: Schema.Array(RedeemerWitnessKey),
  scriptRefs: Schema.Array(ScriptHash.ScriptHash)
}) {
  static default(): RequiredWitnessSet {
    return new RequiredWitnessSet({
      vkeys: [],
      bootstraps: [],
      scripts: [],
      plutusData: [],
      redeemers: [],
      scriptRefs: []
    })
  }

  addVkeyKeyHash(hash: KeyHash.KeyHash): void {
    if (!this.vkeys.find((h) => KeyHash.equals(h, hash))) {
      ;(this.vkeys as Array<KeyHash.KeyHash>).push(hash)
    }
  }

  addBootstrap(address: ByronAddress.ByronAddress): void {
    if (!this.bootstraps.find((a) => ByronAddress.equals(a, address))) {
      ;(this.bootstraps as Array<ByronAddress.ByronAddress>).push(address)
    }
  }

  addScriptHash(hash: ScriptHash.ScriptHash): void {
    // Check if it's already in script refs
    if (!this.scriptRefs.find((h) => ScriptHash.equals(h, hash))) {
      if (!this.scripts.find((h) => ScriptHash.equals(h, hash))) {
        ;(this.scripts as Array<ScriptHash.ScriptHash>).push(hash)
      }
    }
  }

  addScriptRef(hash: ScriptHash.ScriptHash): void {
    // Remove from scripts if present
    ;(this as any).scripts = this.scripts.filter((h) => !ScriptHash.equals(h, hash))
    if (!this.scriptRefs.find((h) => ScriptHash.equals(h, hash))) {
      ;(this.scriptRefs as Array<ScriptHash.ScriptHash>).push(hash)
    }
  }

  addPlutusDataHash(hash: DatumOption.DatumHash): void {
    if (!this.plutusData.find((h) => DatumOption.equals(h, hash))) {
      ;(this.plutusData as Array<DatumOption.DatumHash>).push(hash)
    }
  }

  addRedeemerTag(redeemer: RedeemerWitnessKey): void {
    if (!this.redeemers.find((r) => r.tag === redeemer.tag && r.index === redeemer.index)) {
      ;(this.redeemers as Array<RedeemerWitnessKey>).push(redeemer)
    }
  }

  addAll(requirements: RequiredWitnessSet): void {
    requirements.vkeys.forEach((vkey) => this.addVkeyKeyHash(vkey))
    requirements.bootstraps.forEach((bootstrap) => this.addBootstrap(bootstrap))
    requirements.scripts.forEach((script) => this.addScriptHash(script))
    requirements.plutusData.forEach((data) => this.addPlutusDataHash(data))
    requirements.redeemers.forEach((redeemer) => this.addRedeemerTag(redeemer))
    requirements.scriptRefs.forEach((ref) => this.addScriptRef(ref))
  }

  len(): number {
    return (
      this.vkeys.length +
      this.bootstraps.length +
      this.scripts.length +
      this.plutusData.length +
      this.redeemers.length +
      this.scriptRefs.length
    )
  }
}

/**
 * Native script witness info
 *
 * @since 2.0.0
 * @category model
 */
export type NativeScriptWitnessInfo =
  | { type: "Count"; num: number }
  | { type: "Vkeys"; vkeys: Array<KeyHash.KeyHash> }
  | { type: "AssumeWorst" }

export const NativeScriptWitnessInfo = {
  numSignatures(num: number): NativeScriptWitnessInfo {
    return { type: "Count", num }
  },

  vkeys(vkeys: Array<KeyHash.KeyHash>): NativeScriptWitnessInfo {
    return { type: "Vkeys", vkeys }
  },

  assumeSignatureCount(): NativeScriptWitnessInfo {
    return { type: "AssumeWorst" }
  }
}

/**
 * Plutus script witness
 *
 * @since 2.0.0
 * @category model
 */
export type PlutusScriptWitness =
  | { type: "Ref"; hash: ScriptHash.ScriptHash }
  | { type: "Script"; script: PlutusV1.PlutusV1 | PlutusV2.PlutusV2 | PlutusV3.PlutusV3 }

export const PlutusScriptWitness = {
  ref(hash: ScriptHash.ScriptHash): PlutusScriptWitness {
    return { type: "Ref", hash }
  },

  script(script: PlutusV1.PlutusV1 | PlutusV2.PlutusV2 | PlutusV3.PlutusV3): PlutusScriptWitness {
    return { type: "Script", script }
  },

  hash(witness: PlutusScriptWitness): ScriptHash.ScriptHash {
    switch (witness.type) {
      case "Ref":
        return witness.hash
      case "Script":
        // Use ScriptHash.fromScript to compute the hash
        return ScriptHash.fromScript(witness.script)
    }
  }
}

/**
 * Partial plutus witness
 *
 * @since 2.0.0
 * @category model
 */
export class PartialPlutusWitness extends Schema.Class<PartialPlutusWitness>("PartialPlutusWitness")({
  script: Schema.Any, // PlutusScriptWitness
  redeemer: Schema.Any // PlutusData.Data
}) {
  static new(script: PlutusScriptWitness, redeemer: PlutusData.Data): PartialPlutusWitness {
    return new PartialPlutusWitness({ script: script as any, redeemer })
  }

  get scriptWitness(): PlutusScriptWitness {
    return this.script as PlutusScriptWitness
  }

  get redeemerData(): PlutusData.Data {
    return this.redeemer as PlutusData.Data
  }
}

/**
 * Aggregate witness data for inputs
 *
 * @since 2.0.0
 * @category model
 */
export type InputAggregateWitnessData =
  | { type: "NativeScript"; script: NativeScripts.NativeScript; info: NativeScriptWitnessInfo }
  | {
      type: "PlutusScript"
      witness: PartialPlutusWitness
      requiredSigners: Array<KeyHash.KeyHash>
      datum?: PlutusData.Data
    }

export const InputAggregateWitnessData = {
  nativeScript(script: NativeScripts.NativeScript, info: NativeScriptWitnessInfo): InputAggregateWitnessData {
    return { type: "NativeScript", script, info }
  },

  plutusScript(
    witness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum?: PlutusData.Data
  ): InputAggregateWitnessData {
    return { type: "PlutusScript", witness, requiredSigners, datum }
  },

  redeemerPlutusData(data: InputAggregateWitnessData): PlutusData.Data | undefined {
    if (data.type === "PlutusScript") {
      return data.witness.redeemer
    }
    return undefined
  }
}
