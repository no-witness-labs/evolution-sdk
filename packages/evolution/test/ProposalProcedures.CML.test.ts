import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as Anchor from "../src/core/Anchor.js"
import * as GovernanceAction from "../src/core/GovernanceAction.js"
import * as ProposalProcedure from "../src/core/ProposalProcedure.js"
import * as RewardAccount from "../src/core/RewardAccount.js"

/**
 * CML compatibility test for ProposalProcedures CBOR serialization.
 */
describe("ProposalProcedures CML Compatibility", () => {
  // Test helper to generate deterministic test data using arbitraries
  const generateTestRewardAccount = (seed: number = 42): RewardAccount.RewardAccount =>
    FastCheck.sample(RewardAccount.arbitrary, { seed, numRuns: 1 })[0]

  const generateTestAnchor = (seed: number = 42): Anchor.Anchor =>
    FastCheck.sample(Anchor.arbitrary, { seed, numRuns: 1 })[0]

  it("validates CBOR hex compatibility: Evolution SDK vs CML serialization", () => {
    const deposit = 500000000n
    const rewardAccount = generateTestRewardAccount(1)
    const anchor = generateTestAnchor(1)

    // Create Evolution SDK ProposalProcedure
    const evolutionInfoAction = GovernanceAction.makeInfo()
    const evolutionProcedure = ProposalProcedure.make({
      deposit,
      rewardAccount,
      governanceAction: evolutionInfoAction,
      anchor
    })

    // Create equivalent CML ProposalProcedure
    const rewardAccountBytes = RewardAccount.toBytes(rewardAccount)
    const credentialHashBytes = rewardAccountBytes.slice(1, 29)

    // Create the correct CML credential based on Evolution SDK credential type
    const credential =
      rewardAccount.stakeCredential._tag === "KeyHash"
        ? CML.Credential.new_pub_key(CML.Ed25519KeyHash.from_raw_bytes(credentialHashBytes))
        : CML.Credential.new_script(CML.ScriptHash.from_raw_bytes(credentialHashBytes))

    const cmlRewardAddress = CML.RewardAddress.new(rewardAccount.networkId, credential)
    const cmlInfoAction = CML.GovAction.new_info_action()

    // Get Evolution SDK anchor CBOR and create CML anchor
    const anchorHex = Anchor.toCBORHex(anchor)
    const cmlAnchor = CML.Anchor.from_cbor_hex(anchorHex)

    // Create CML ProposalProcedure
    const cmlProcedure = CML.ProposalProcedure.new(deposit, cmlRewardAddress, cmlInfoAction, cmlAnchor)

    // Get CBOR hex from both implementations - now comparing individual procedures
    const cmlProcedureCborHex = cmlProcedure.to_cbor_hex()

    // Evolution SDK: use individual ProposalProcedure CBOR method
    const evolutionProcedureCborHex = ProposalProcedure.toCBORHex(evolutionProcedure)

    // Log both for comparison
    // eslint-disable-next-line no-console
    console.log("CML individual procedure CBOR (TRUTH):", cmlProcedureCborHex)
    // eslint-disable-next-line no-console
    console.log("Evolution individual procedure CBOR:  ", evolutionProcedureCborHex)

    // CML CBOR is the truth - Evolution SDK must match exactly
    expect(evolutionProcedureCborHex).toBe(cmlProcedureCborHex)

    // Test that Evolution SDK can parse CML's CBOR (the truth)
    const evolutionRoundTrip = ProposalProcedure.fromCBORHex(cmlProcedureCborHex)
    expect(evolutionRoundTrip).toEqual(evolutionProcedure)
  })
})
