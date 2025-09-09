import { Data, Effect as Eff } from "effect"

import type * as PlutusData from "../core/Data.js"
import * as DatumOption from "../core/DatumOption.js"
import type * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import type * as ProposalProcedure from "../core/ProposalProcedure.js"
import * as ScriptHash from "../core/ScriptHash.js"
import { hashPlutusData } from "../utils/Hash.js"
import type { NativeScriptWitnessInfo, PartialPlutusWitness } from "./WitnessBuilder.js"
import { InputAggregateWitnessData, PlutusScriptWitness, RequiredWitnessSet } from "./WitnessBuilder.js"

/**
 * Error class for ProposalBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ProposalBuilderError extends Data.TaggedError("ProposalBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Result of building proposals
 *
 * @since 2.0.0
 * @category model
 */
export interface ProposalBuilderResult {
  proposals: Array<ProposalProcedure.ProposalProcedure>
  requiredWits: RequiredWitnessSet
  aggregateWitnesses: Array<InputAggregateWitnessData>
}

/**
 * Builder for governance proposals
 *
 * @since 2.0.0
 * @category builders
 */
export class ProposalBuilder {
  private result: ProposalBuilderResult

  constructor() {
    this.result = {
      proposals: [],
      requiredWits: RequiredWitnessSet.default(),
      aggregateWitnesses: []
    }
  }

  static new(): ProposalBuilder {
    return new ProposalBuilder()
  }

  withProposal(proposal: ProposalProcedure.ProposalProcedure): Eff.Effect<ProposalBuilder, ProposalBuilderError> {
    return Eff.gen(
      function* (this: ProposalBuilder) {
        // Check if proposal uses script hash
        const scriptHash = getProposalScriptHash(proposal)
        if (scriptHash) {
          return yield* Eff.fail(
            new ProposalBuilderError({
              message: "Proposal uses script. Call withPlutusProposal() instead."
            })
          )
        }

        this.result.proposals.push(proposal)
        return this
      }.bind(this)
    )
  }

  withNativeScriptProposal(
    proposal: ProposalProcedure.ProposalProcedure,
    nativeScript: NativeScripts.NativeScript,
    witnessInfo: NativeScriptWitnessInfo
  ): Eff.Effect<ProposalBuilder, ProposalBuilderError> {
    return Eff.gen(
      function* (this: ProposalBuilder) {
        const proposalScriptHash = getProposalScriptHash(proposal)
        const scriptHash = ScriptHash.fromScript(nativeScript)

        if (!proposalScriptHash) {
          return yield* Eff.fail(
            new ProposalBuilderError({
              message: "Proposal uses key hash. Call withProposal() instead."
            })
          )
        }

        if (!ScriptHash.equals(proposalScriptHash, scriptHash)) {
          const errRequiredWits = RequiredWitnessSet.default()
          errRequiredWits.addScriptHash(proposalScriptHash)
          return yield* Eff.fail(
            new ProposalBuilderError({
              message: "Missing the following witnesses for the proposal",
              cause: errRequiredWits
            })
          )
        }

        this.result.requiredWits.addScriptHash(proposalScriptHash)
        this.result.proposals.push(proposal)
        this.result.aggregateWitnesses.push(InputAggregateWitnessData.nativeScript(nativeScript, witnessInfo))

        return this
      }.bind(this)
    )
  }

  withPlutusProposal(
    proposal: ProposalProcedure.ProposalProcedure,
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum: PlutusData.Data
  ): Eff.Effect<ProposalBuilder, ProposalBuilderError> {
    return this.withPlutusProposalImpl(proposal, partialWitness, requiredSigners, datum)
  }

  withPlutusProposalInlineDatum(
    proposal: ProposalProcedure.ProposalProcedure,
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>
  ): Eff.Effect<ProposalBuilder, ProposalBuilderError> {
    return this.withPlutusProposalImpl(proposal, partialWitness, requiredSigners, undefined)
  }

  private withPlutusProposalImpl(
    proposal: ProposalProcedure.ProposalProcedure,
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum?: PlutusData.Data
  ): Eff.Effect<ProposalBuilder, ProposalBuilderError> {
    return Eff.gen(
      function* (this: ProposalBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        requiredSigners.forEach((signer) => requiredWits.addVkeyKeyHash(signer))

        const proposalScriptHash = getProposalScriptHash(proposal)
        if (!proposalScriptHash) {
          return yield* Eff.fail(
            new ProposalBuilderError({
              message: "Proposal uses key hash. Call withProposal() instead."
            })
          )
        }

        requiredWits.addScriptHash(proposalScriptHash)
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
            new ProposalBuilderError({
              message: "Missing the following witnesses for the proposal",
              cause: finalRequiredWitsLeft
            })
          )
        }

        this.result.proposals.push(proposal)
        this.result.requiredWits.addAll(requiredWits)
        this.result.aggregateWitnesses.push(
          InputAggregateWitnessData.plutusScript(partialWitness, requiredSigners, datum)
        )

        return this
      }.bind(this)
    )
  }

  build(): ProposalBuilderResult {
    return this.result
  }
}

/**
 * Helper function to get script hash from a proposal
 * Returns undefined if proposal uses key hash
 * Based on Conway CDDL: only ParameterChangeAction and TreasuryWithdrawalsAction have policy_hash
 */
function getProposalScriptHash(proposal: ProposalProcedure.ProposalProcedure): ScriptHash.ScriptHash | undefined {
  const action = proposal.governanceAction

  switch (action._tag) {
    case "ParameterChangeAction":
      return action.policyHash || undefined
    case "TreasuryWithdrawalsAction":
      return action.policyHash || undefined
    case "HardForkInitiationAction":
    case "NoConfidenceAction":
    case "UpdateCommitteeAction":
    case "NewConstitutionAction":
    case "InfoAction":
      return undefined
    default:
      return undefined
  }
}
