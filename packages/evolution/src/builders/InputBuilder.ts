import { Data, Effect as Eff } from "effect"

import type * as Credential from "../core/Credential.js"
import type * as PlutusData from "../core/Data.js"
import * as DatumOption from "../core/DatumOption.js"
import type * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import * as ScriptHash from "../core/ScriptHash.js"
import type * as TransactionInput from "../core/TransactionInput.js"
import type * as TransactionOutput from "../core/TransactionOutput.js"
import { hashPlutusData } from "../utils/Hash.js"
import type { NativeScriptWitnessInfo, PartialPlutusWitness } from "./WitnessBuilder.js"
import { InputAggregateWitnessData, PlutusScriptWitness, RequiredWitnessSet } from "./WitnessBuilder.js"

/**
 * Error class for InputBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class InputBuilderError extends Data.TaggedError("InputBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Calculates required witnesses for a transaction output
 *
 * @since 2.0.0
 * @category utils
 */
export function inputRequiredWits(
  utxoInfo: TransactionOutput.TransactionOutput,
  requiredWitnesses: RequiredWitnessSet
): void {
  const address = utxoInfo.address

  // Extract payment credential based on address type
  // TransactionOutput only supports BaseAddress and EnterpriseAddress
  let paymentCred: Credential.CredentialSchema | undefined
  switch (address._tag) {
    case "BaseAddress":
      paymentCred = address.paymentCredential
      break
    case "EnterpriseAddress":
      paymentCred = address.paymentCredential
      break
  }

  if (paymentCred) {
    switch (paymentCred._tag) {
      case "KeyHash":
        requiredWitnesses.addVkeyKeyHash(paymentCred)
        break
      case "ScriptHash":
        requiredWitnesses.addScriptHash(paymentCred)
        // Check for datum hash in output
        if (utxoInfo._tag === "ShelleyTransactionOutput" && utxoInfo.datumHash) {
          requiredWitnesses.addPlutusDataHash(utxoInfo.datumHash)
        } else if (utxoInfo._tag === "BabbageTransactionOutput" && utxoInfo.datumOption) {
          if (utxoInfo.datumOption._tag === "DatumHash") {
            requiredWitnesses.addPlutusDataHash(utxoInfo.datumOption)
          }
        }
        break
    }
  }
}

/**
 * Result of building a transaction input
 *
 * @since 2.0.0
 * @category model
 */
export interface InputBuilderResult {
  input: TransactionInput.TransactionInput
  utxoInfo: TransactionOutput.TransactionOutput
  aggregateWitness?: InputAggregateWitnessData
  requiredWits: RequiredWitnessSet
}

/**
 * Builder for a single transaction input
 *
 * @since 2.0.0
 * @category builders
 */
export class SingleInputBuilder {
  constructor(
    public readonly input: TransactionInput.TransactionInput,
    public readonly utxoInfo: TransactionOutput.TransactionOutput
  ) {}

  static new(
    input: TransactionInput.TransactionInput,
    utxoInfo: TransactionOutput.TransactionOutput
  ): SingleInputBuilder {
    return new SingleInputBuilder(input, utxoInfo)
  }

  paymentKey(): Eff.Effect<InputBuilderResult, InputBuilderError> {
    return Eff.gen(
      function* (this: SingleInputBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        inputRequiredWits(this.utxoInfo, requiredWits)

        // Check that no scripts are required
        if (requiredWits.scripts.length > 0) {
          return yield* Eff.fail(
            new InputBuilderError({
              message: `UTXO address was not a payment key: ${this.utxoInfo.address}`
            })
          )
        }

        return {
          input: this.input,
          utxoInfo: this.utxoInfo,
          aggregateWitness: undefined,
          requiredWits
        }
      }.bind(this)
    )
  }

  nativeScript(
    nativeScript: NativeScripts.NativeScript,
    witnessInfo: NativeScriptWitnessInfo
  ): Eff.Effect<InputBuilderResult, InputBuilderError> {
    return Eff.gen(
      function* (this: SingleInputBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        inputRequiredWits(this.utxoInfo, requiredWits)
        const requiredWitsLeft = structuredClone(requiredWits)

        const scriptHash = ScriptHash.fromScript(nativeScript)

        // Remove the script hash from required witnesses
        const filteredScripts = requiredWitsLeft.scripts.filter((h) => !ScriptHash.equals(h, scriptHash))
        const mutableRequiredWitsLeft = { ...requiredWitsLeft, scripts: filteredScripts }

        if (mutableRequiredWitsLeft.scripts.length > 0) {
          return yield* Eff.fail(
            new InputBuilderError({
              message: `Missing the following witnesses for the input`,
              cause: mutableRequiredWitsLeft
            })
          )
        }

        return {
          input: this.input,
          utxoInfo: this.utxoInfo,
          aggregateWitness: InputAggregateWitnessData.nativeScript(nativeScript, witnessInfo),
          requiredWits
        }
      }.bind(this)
    )
  }

  plutusScript(
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum: PlutusData.Data
  ): Eff.Effect<InputBuilderResult, InputBuilderError> {
    return this.plutusScriptInner(partialWitness, requiredSigners, datum)
  }

  plutusScriptInlineDatum(
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>
  ): Eff.Effect<InputBuilderResult, InputBuilderError> {
    return this.plutusScriptInner(partialWitness, requiredSigners, undefined)
  }

  private plutusScriptInner(
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum?: PlutusData.Data
  ): Eff.Effect<InputBuilderResult, InputBuilderError> {
    return Eff.gen(
      function* (this: SingleInputBuilder) {
        const requiredWits = RequiredWitnessSet.default()

        // Add required signers
        requiredSigners.forEach((signer) => requiredWits.addVkeyKeyHash(signer))

        inputRequiredWits(this.utxoInfo, requiredWits)
        const requiredWitsLeft = structuredClone(requiredWits)

        // Clear vkeys as we don't know which ones will be used
        const clearedRequiredWitsLeft = new RequiredWitnessSet({
          vkeys: [], // Cleared
          bootstraps: requiredWitsLeft.bootstraps,
          scripts: requiredWitsLeft.scripts,
          plutusData: requiredWitsLeft.plutusData,
          redeemers: requiredWitsLeft.redeemers,
          scriptRefs: requiredWitsLeft.scriptRefs
        })

        const scriptHash = PlutusScriptWitness.hash(partialWitness.scriptWitness)

        // Remove the script hash
        const filteredScripts = clearedRequiredWitsLeft.scripts.filter((h) => !ScriptHash.equals(h, scriptHash))
        const updatedRequiredWitsLeft = new RequiredWitnessSet({
          vkeys: clearedRequiredWitsLeft.vkeys,
          bootstraps: clearedRequiredWitsLeft.bootstraps,
          scripts: filteredScripts,
          plutusData: clearedRequiredWitsLeft.plutusData,
          redeemers: clearedRequiredWitsLeft.redeemers,
          scriptRefs: clearedRequiredWitsLeft.scriptRefs
        })

        // Remove datum hash if provided
        let finalRequiredWitsLeft = updatedRequiredWitsLeft
        if (datum) {
          const datumHash = hashPlutusData(datum)
          const filteredPlutusData = updatedRequiredWitsLeft.plutusData.filter((h) => !DatumOption.equals(h, datumHash))
          finalRequiredWitsLeft = new RequiredWitnessSet({
            vkeys: updatedRequiredWitsLeft.vkeys,
            bootstraps: updatedRequiredWitsLeft.bootstraps,
            scripts: updatedRequiredWitsLeft.scripts,
            plutusData: filteredPlutusData,
            redeemers: updatedRequiredWitsLeft.redeemers,
            scriptRefs: updatedRequiredWitsLeft.scriptRefs
          })
        }

        if (finalRequiredWitsLeft.len() > 0) {
          return yield* Eff.fail(
            new InputBuilderError({
              message: `Missing the following witnesses for the input`,
              cause: finalRequiredWitsLeft
            })
          )
        }

        return {
          input: this.input,
          utxoInfo: this.utxoInfo,
          aggregateWitness: InputAggregateWitnessData.plutusScript(partialWitness, requiredSigners, datum),
          requiredWits
        }
      }.bind(this)
    )
  }
}
