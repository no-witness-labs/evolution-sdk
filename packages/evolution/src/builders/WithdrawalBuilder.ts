import { Data, Effect as Eff } from "effect"

import type * as Coin from "../core/Coin.js"
import type * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import type * as RewardAccount from "../core/RewardAccount.js"
import * as ScriptHash from "../core/ScriptHash.js"
import type { NativeScriptWitnessInfo, PartialPlutusWitness } from "./WitnessBuilder.js"
import { InputAggregateWitnessData, PlutusScriptWitness, RequiredWitnessSet } from "./WitnessBuilder.js"

/**
 * Error class for WithdrawalBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class WithdrawalBuilderError extends Data.TaggedError("WithdrawalBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Calculates required witnesses for a withdrawal
 *
 * @since 2.0.0
 * @category utils
 */
export function withdrawalRequiredWits(
  address: RewardAccount.RewardAccount,
  requiredWitnesses: RequiredWitnessSet
): void {
  const credential = address.stakeCredential

  switch (credential._tag) {
    case "KeyHash":
      requiredWitnesses.addVkeyKeyHash(credential)
      break
    case "ScriptHash":
      requiredWitnesses.addScriptHash(credential)
      break
  }
}

/**
 * Result of building a withdrawal
 *
 * @since 2.0.0
 * @category model
 */
export interface WithdrawalBuilderResult {
  address: RewardAccount.RewardAccount
  amount: Coin.Coin
  aggregateWitness?: InputAggregateWitnessData
  requiredWits: RequiredWitnessSet
}

/**
 * Builder for a single withdrawal
 *
 * @since 2.0.0
 * @category builders
 */
export class SingleWithdrawalBuilder {
  constructor(
    public readonly address: RewardAccount.RewardAccount,
    public readonly amount: Coin.Coin
  ) {}

  static new(address: RewardAccount.RewardAccount, amount: Coin.Coin): SingleWithdrawalBuilder {
    return new SingleWithdrawalBuilder(address, amount)
  }

  paymentKey(): Eff.Effect<WithdrawalBuilderResult, WithdrawalBuilderError> {
    return Eff.gen(
      function* (this: SingleWithdrawalBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        withdrawalRequiredWits(this.address, requiredWits)

        if (requiredWits.scripts.length > 0) {
          return yield* Eff.fail(
            new WithdrawalBuilderError({
              message: "Withdrawal required a script, not a payment key"
            })
          )
        }

        return {
          address: this.address,
          amount: this.amount,
          aggregateWitness: undefined,
          requiredWits
        }
      }.bind(this)
    )
  }

  nativeScript(
    nativeScript: NativeScripts.NativeScript,
    witnessInfo: NativeScriptWitnessInfo
  ): Eff.Effect<WithdrawalBuilderResult, WithdrawalBuilderError> {
    return Eff.gen(
      function* (this: SingleWithdrawalBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        withdrawalRequiredWits(this.address, requiredWits)
        const requiredWitsLeft = structuredClone(requiredWits)

        const scriptHash = ScriptHash.fromScript(nativeScript)

        // Remove the script hash from required witnesses
        const filteredScripts = requiredWitsLeft.scripts.filter((h) => !ScriptHash.equals(h, scriptHash))
        const finalRequiredWitsLeft = new RequiredWitnessSet({
          vkeys: requiredWitsLeft.vkeys,
          bootstraps: requiredWitsLeft.bootstraps,
          scripts: filteredScripts,
          plutusData: requiredWitsLeft.plutusData,
          redeemers: requiredWitsLeft.redeemers,
          scriptRefs: requiredWitsLeft.scriptRefs
        })

        if (finalRequiredWitsLeft.scripts.length > 0) {
          return yield* Eff.fail(
            new WithdrawalBuilderError({
              message: "Missing the following witnesses for the withdrawal",
              cause: finalRequiredWitsLeft
            })
          )
        }

        return {
          address: this.address,
          amount: this.amount,
          aggregateWitness: InputAggregateWitnessData.nativeScript(nativeScript, witnessInfo),
          requiredWits
        }
      }.bind(this)
    )
  }

  plutusScript(
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>
  ): Eff.Effect<WithdrawalBuilderResult, WithdrawalBuilderError> {
    return Eff.gen(
      function* (this: SingleWithdrawalBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        requiredSigners.forEach((signer) => requiredWits.addVkeyKeyHash(signer))
        withdrawalRequiredWits(this.address, requiredWits)
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
        const finalRequiredWitsLeft = new RequiredWitnessSet({
          vkeys: clearedRequiredWitsLeft.vkeys,
          bootstraps: clearedRequiredWitsLeft.bootstraps,
          scripts: filteredScripts,
          plutusData: clearedRequiredWitsLeft.plutusData,
          redeemers: clearedRequiredWitsLeft.redeemers,
          scriptRefs: clearedRequiredWitsLeft.scriptRefs
        })

        if (finalRequiredWitsLeft.len() > 0) {
          return yield* Eff.fail(
            new WithdrawalBuilderError({
              message: "Missing the following witnesses for the withdrawal",
              cause: finalRequiredWitsLeft
            })
          )
        }

        return {
          address: this.address,
          amount: this.amount,
          aggregateWitness: InputAggregateWitnessData.plutusScript(
            partialWitness,
            requiredSigners,
            undefined // No datum for withdrawals
          ),
          requiredWits
        }
      }.bind(this)
    )
  }
}
