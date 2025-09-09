import { Data, Effect as Eff } from "effect"

import type * as PlutusData from "../core/Data.js"
import * as DatumOption from "../core/DatumOption.js"
import type * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import * as ScriptHash from "../core/ScriptHash.js"
import type * as VotingProcedures from "../core/VotingProcedures.js"
import { hashPlutusData } from "../utils/Hash.js"
import type { NativeScriptWitnessInfo, PartialPlutusWitness } from "./WitnessBuilder.js"
import { InputAggregateWitnessData, PlutusScriptWitness, RequiredWitnessSet } from "./WitnessBuilder.js"

/**
 * Error class for VoteBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VoteBuilderError extends Data.TaggedError("VoteBuilderError")<{
  message?: string
  cause?: unknown
}> {}

// Define a simplified GovernanceActionId type for now
export interface GovActionId {
  transactionId: string
  govActionIndex: bigint
}

// Define a simplified VotingProcedure type for now
export interface VotingProcedure {
  vote: "No" | "Yes" | "Abstain"
  anchor?: string
}

/**
 * Result of building votes
 *
 * @since 2.0.0
 * @category model
 */
export interface VoteBuilderResult {
  votes: Map<VotingProcedures.Voter, Map<GovActionId, VotingProcedure>>
  requiredWits: RequiredWitnessSet
  aggregateWitnesses: Array<InputAggregateWitnessData>
}

/**
 * Builder for governance votes
 *
 * @since 2.0.0
 * @category builders
 */
export class VoteBuilder {
  private result: VoteBuilderResult

  constructor() {
    this.result = {
      votes: new Map(),
      requiredWits: RequiredWitnessSet.default(),
      aggregateWitnesses: []
    }
  }

  static new(): VoteBuilder {
    return new VoteBuilder()
  }

  withVote(
    voter: VotingProcedures.Voter,
    govActionId: GovActionId,
    procedure: VotingProcedure
  ): Eff.Effect<VoteBuilder, VoteBuilderError> {
    return Eff.gen(
      function* (this: VoteBuilder) {
        const keyHash = getVoterKeyHash(voter)
        if (!keyHash) {
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Voter is script. Call withPlutusVote() instead."
            })
          )
        }

        this.result.requiredWits.addVkeyKeyHash(keyHash)

        // Check for existing vote
        const voterVotes = this.result.votes.get(voter)
        if (voterVotes?.has(govActionId)) {
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Vote already exists"
            })
          )
        }

        if (!voterVotes) {
          this.result.votes.set(voter, new Map([[govActionId, procedure]]))
        } else {
          voterVotes.set(govActionId, procedure)
        }

        return this
      }.bind(this)
    )
  }

  withNativeScriptVote(
    voter: VotingProcedures.Voter,
    govActionId: GovActionId,
    procedure: VotingProcedure,
    nativeScript: NativeScripts.NativeScript,
    witnessInfo: NativeScriptWitnessInfo
  ): Eff.Effect<VoteBuilder, VoteBuilderError> {
    return Eff.gen(
      function* (this: VoteBuilder) {
        const voterScriptHash = getVoterScriptHash(voter)
        const scriptHash = ScriptHash.fromScript(nativeScript)

        if (!voterScriptHash) {
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Voter is key hash. Call withVote() instead."
            })
          )
        }

        if (!ScriptHash.equals(voterScriptHash, scriptHash)) {
          const errRequiredWits = RequiredWitnessSet.default()
          errRequiredWits.addScriptHash(voterScriptHash)
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Missing the following witnesses for the vote",
              cause: errRequiredWits
            })
          )
        }

        this.result.requiredWits.addScriptHash(voterScriptHash)

        // Check for existing vote
        const voterVotes = this.result.votes.get(voter)
        if (voterVotes?.has(govActionId)) {
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Vote already exists"
            })
          )
        }

        if (!voterVotes) {
          this.result.votes.set(voter, new Map([[govActionId, procedure]]))
        } else {
          voterVotes.set(govActionId, procedure)
        }

        this.result.aggregateWitnesses.push(InputAggregateWitnessData.nativeScript(nativeScript, witnessInfo))

        return this
      }.bind(this)
    )
  }

  withPlutusVote(
    voter: VotingProcedures.Voter,
    govActionId: GovActionId,
    procedure: VotingProcedure,
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum: PlutusData.Data
  ): Eff.Effect<VoteBuilder, VoteBuilderError> {
    return this.withPlutusVoteImpl(voter, govActionId, procedure, partialWitness, requiredSigners, datum)
  }

  withPlutusVoteInlineDatum(
    voter: VotingProcedures.Voter,
    govActionId: GovActionId,
    procedure: VotingProcedure,
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>
  ): Eff.Effect<VoteBuilder, VoteBuilderError> {
    return this.withPlutusVoteImpl(voter, govActionId, procedure, partialWitness, requiredSigners, undefined)
  }

  private withPlutusVoteImpl(
    voter: VotingProcedures.Voter,
    govActionId: GovActionId,
    procedure: VotingProcedure,
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>,
    datum?: PlutusData.Data
  ): Eff.Effect<VoteBuilder, VoteBuilderError> {
    return Eff.gen(
      function* (this: VoteBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        requiredSigners.forEach((signer) => requiredWits.addVkeyKeyHash(signer))

        const voterScriptHash = getVoterScriptHash(voter)
        if (!voterScriptHash) {
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Voter is key hash. Call withVote() instead."
            })
          )
        }

        requiredWits.addScriptHash(voterScriptHash)
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
            new VoteBuilderError({
              message: "Missing the following witnesses for the vote",
              cause: finalRequiredWitsLeft
            })
          )
        }

        // Check for existing vote
        const voterVotes = this.result.votes.get(voter)
        if (voterVotes?.has(govActionId)) {
          return yield* Eff.fail(
            new VoteBuilderError({
              message: "Vote already exists"
            })
          )
        }

        if (!voterVotes) {
          this.result.votes.set(voter, new Map([[govActionId, procedure]]))
        } else {
          voterVotes.set(govActionId, procedure)
        }

        this.result.requiredWits.addAll(requiredWits)
        this.result.aggregateWitnesses.push(
          InputAggregateWitnessData.plutusScript(partialWitness, requiredSigners, datum)
        )

        return this
      }.bind(this)
    )
  }

  build(): VoteBuilderResult {
    return this.result
  }
}

/**
 * Helper function to get key hash from a voter
 * Returns undefined if voter uses script hash
 */
function getVoterKeyHash(voter: VotingProcedures.Voter): KeyHash.KeyHash | undefined {
  // Extract KeyHash from voter credential
  if (voter._tag === "ConstitutionalCommitteeVoter" && voter.credential._tag === "KeyHash") {
    return voter.credential
  }
  if (voter._tag === "DRepVoter" && voter.drep._tag === "KeyHashDRep") {
    return voter.drep.keyHash
  }
  return undefined
}

/**
 * Helper function to get script hash from a voter
 * Returns undefined if voter uses key hash
 */
function getVoterScriptHash(voter: VotingProcedures.Voter): ScriptHash.ScriptHash | undefined {
  // Extract ScriptHash from voter credential
  if (voter._tag === "ConstitutionalCommitteeVoter" && voter.credential._tag === "ScriptHash") {
    return voter.credential
  }
  if (voter._tag === "DRepVoter" && voter.drep._tag === "ScriptHashDRep") {
    return voter.drep.scriptHash
  }
  return undefined
}
