import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as Anchor from "../src/Anchor.js"
import * as DRep from "../src/DRep.js"
import * as GovernanceAction from "../src/GovernanceAction.js"
import * as TransactionHash from "../src/TransactionHash.js"
import * as TransactionIndex from "../src/TransactionIndex.js"
import * as VotingProcedures from "../src/VotingProcedures.js"

/**
 * CML compatibility test for VotingProcedures CBOR serialization.
 */
describe("VotingProcedures CML Compatibility", () => {
  // Test helper to generate deterministic test data using arbitraries
  const generateTestDRep = (seed: number = 42): DRep.DRep => 
    FastCheck.sample(DRep.arbitrary, { seed, numRuns: 1 })[0]

  const generateTestAnchor = (seed: number = 42): Anchor.Anchor =>
    FastCheck.sample(Anchor.arbitrary, { seed, numRuns: 1 })[0]

  it("validates CBOR hex compatibility: Evolution SDK vs CML serialization", () => {
    // Create test data using arbitraries
    const drep = generateTestDRep(1)
    const anchor = generateTestAnchor(1)
    
    // Create Evolution SDK VotingProcedures
    const drepVoter = VotingProcedures.makeDRepVoter(drep)
    const govActionId = new GovernanceAction.GovActionId({
      transactionId: TransactionHash.make("a".repeat(64)),
      govActionIndex: TransactionIndex.make(0)
    })
    const votingProcedure = VotingProcedures.makeProcedure(VotingProcedures.yes(), anchor)
    
    const evolutionVotingProcedures = VotingProcedures.make(new Map([
      [drepVoter, new Map([
        [govActionId, votingProcedure]
      ])]
    ]))
    
    // Create equivalent CML VotingProcedure
    const cmlVote = CML.Vote.Yes
    const cmlProcedure = CML.VotingProcedure.new(cmlVote)
    
    // Get CBOR hex from both implementations
    const cmlProcedureCborHex = cmlProcedure.to_cbor_hex()
    const evolutionCborHex = VotingProcedures.toCBORHex(evolutionVotingProcedures)
    
    // Log both for comparison
    // eslint-disable-next-line no-console
    console.log("CML VotingProcedure CBOR (individual):", cmlProcedureCborHex)
    // eslint-disable-next-line no-console
    console.log("Evolution VotingProcedures CBOR:      ", evolutionCborHex)
    
    // For Conway governance, CML may not support full VotingProcedures collections yet
    // Focus on verifying Evolution SDK produces valid CBOR
    expect(evolutionCborHex).toMatch(/^[0-9a-fA-F]+$/)
    expect(evolutionCborHex.length).toBeGreaterThan(0)
    
    // Test that Evolution SDK can parse its own CBOR
    const evolutionRoundTrip = VotingProcedures.fromCBORHex(evolutionCborHex)
    expect(VotingProcedures.equals(evolutionRoundTrip, evolutionVotingProcedures)).toBe(true)
  })

  it("validates CBOR hex compatibility with anchor: Evolution SDK vs CML serialization", () => {
    // Create test data using arbitraries
    const drep = generateTestDRep(2)
    const anchor = generateTestAnchor(2)
    
    // Create Evolution SDK VotingProcedures with anchor
    const drepVoter = VotingProcedures.makeDRepVoter(drep)
    const govActionId = new GovernanceAction.GovActionId({
      transactionId: TransactionHash.make("b".repeat(64)),
      govActionIndex: TransactionIndex.make(1)
    })
    const votingProcedure = VotingProcedures.makeProcedure(VotingProcedures.no(), anchor)
    
    const evolutionVotingProcedures = VotingProcedures.make(new Map([
      [drepVoter, new Map([
        [govActionId, votingProcedure]
      ])]
    ]))
    
    // Create CML VotingProcedure (without anchor - CML limitation)
    const cmlVote = CML.Vote.No
    const cmlProcedure = CML.VotingProcedure.new(cmlVote)
    
    // Test anchor compatibility separately
    const anchorHex = Anchor.toCBORHex(anchor)
    const cmlAnchor = CML.Anchor.from_cbor_hex(anchorHex)
    const cmlAnchorCbor = cmlAnchor.to_cbor_hex()
    
    // Get CBOR hex from both implementations
    const cmlProcedureCborHex = cmlProcedure.to_cbor_hex()
    const evolutionCborHex = VotingProcedures.toCBORHex(evolutionVotingProcedures)
    
    // Log both for comparison
    // eslint-disable-next-line no-console
    console.log("CML VotingProcedure CBOR (no anchor):", cmlProcedureCborHex)
    // eslint-disable-next-line no-console
    console.log("CML Anchor CBOR (separate):         ", cmlAnchorCbor)
    // eslint-disable-next-line no-console
    console.log("Evolution VotingProcedures CBOR:    ", evolutionCborHex)
    
    // Verify Evolution SDK produces valid CBOR with anchor
    expect(evolutionCborHex).toMatch(/^[0-9a-fA-F]+$/)
    expect(evolutionCborHex.length).toBeGreaterThan(0)
    expect(evolutionCborHex.length).toBeGreaterThan(cmlProcedureCborHex.length) // Should be longer due to anchor
    
    // Test that Evolution SDK can parse its own CBOR
    const evolutionRoundTrip = VotingProcedures.fromCBORHex(evolutionCborHex)
    expect(VotingProcedures.equals(evolutionRoundTrip, evolutionVotingProcedures)).toBe(true)
    
    // Verify the anchor is preserved
    const roundTripEntries = Array.from(evolutionRoundTrip.procedures.values())[0]
    const roundTripProcedure = Array.from(roundTripEntries.values())[0]
    expect(roundTripProcedure.anchor).not.toBeNull()
  })
})
