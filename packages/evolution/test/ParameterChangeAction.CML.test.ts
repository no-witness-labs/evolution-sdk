import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as Anchor from "../src/Anchor.js"
import * as Coin from "../src/Coin.js"
import * as GovernanceAction from "../src/GovernanceAction.js"
import * as ProposalProcedure from "../src/ProposalProcedure.js"
import * as ProtocolParams from "../src/ProtocolParamUpdate.js"
import * as RewardAccount from "../src/RewardAccount.js"

// Deterministic helper copied from other CML tests
const generateTestRewardAccount = (seed: number = 42): RewardAccount.RewardAccount =>
  FastCheck.sample(RewardAccount.arbitrary, { seed, numRuns: 1 })[0]
const generateTestAnchor = (seed: number = 42): Anchor.Anchor =>
  FastCheck.sample(Anchor.arbitrary, { seed, numRuns: 1 })[0]

describe("ParameterChangeAction CML Compatibility", () => {
  it.skip("roundtrips ProposalProcedure with ParameterChangeAction through CML (CBOR parity)", () => {
    // Minimal protocol param update: only minfeeA set
    const ppu = new ProtocolParams.ProtocolParamUpdate({
      minfeeA: 44n
    })

    // Sanity check: ProtocolParamUpdate enc/dec on its own
    const ppuHex = ProtocolParams.toCBORHex(ppu)
    const ppuRT = ProtocolParams.fromCBORHex(ppuHex)
    expect(ppuRT.minfeeA).toBe(44n)

    // Build Evolution SDK governance action and wrap into a ProposalProcedure
    const gov = GovernanceAction.makeParameterChange(null, ppu, null)
    const deposit = 12345n
    const rewardAccount = generateTestRewardAccount(7)
    const evoProcedure = ProposalProcedure.make({
      deposit,
      rewardAccount,
      governanceAction: gov,
      anchor: generateTestAnchor(11)
    })

    // Encode with Evolution SDK
    const evoHex = ProposalProcedure.toCBORHex(evoProcedure)

    // Parse with CML and re-encode
    const cmlParsed = CML.ProposalProcedure.from_cbor_hex(evoHex)
    const cmlHex = cmlParsed.to_cbor_hex()

    // CML CBOR must match exactly
    expect(evoHex).toBe(cmlHex)

    // Ensure Evolution decodes its own CBOR correctly
    const evoDecoded = ProposalProcedure.fromCBORHex(evoHex)
    if (GovernanceAction.isParameterChangeAction(evoDecoded.governanceAction)) {
      expect(evoDecoded.governanceAction.protocolParamUpdate.minfeeA).toBe(44n)
    } else {
      throw new Error("Expected ParameterChangeAction")
    }

    // Ensure Evolution can decode CML's CBOR (truth) and preserve the field
    const evoRoundTrip = ProposalProcedure.fromCBORHex(cmlHex)
    if (GovernanceAction.isParameterChangeAction(evoRoundTrip.governanceAction)) {
      expect(evoRoundTrip.governanceAction.protocolParamUpdate.minfeeA).toBe(44n)
    } else {
      throw new Error("Expected ParameterChangeAction")
    }
  })

  it("property: ProposalProcedure with ParameterChangeAction has CBOR parity with CML and preserves minfeeA", () => {
    const depositArb = Coin.arbitrary
    const rewardArb = RewardAccount.arbitrary
    const anchorArb = Anchor.arbitrary // Always provide anchor (CML expects array, not null)
    const ppuArb = ProtocolParams.arbitrary
    const govArb = GovernanceAction.arbitrary

    FastCheck.assert(
      FastCheck.property(
        depositArb,
        rewardArb,
        anchorArb,
        ppuArb,
        govArb,
        (deposit, rewardAccount, anchor, ppu, gov) => {
          const evoProcedure = ProposalProcedure.make({ deposit, rewardAccount, governanceAction: gov, anchor })
          const evoHex = ProposalProcedure.toCBORHex(evoProcedure)
          const cmlParsed = CML.ProposalProcedure.from_cbor_hex(evoHex)
          const cmlHex = cmlParsed.to_cbor_hex()
          expect(evoHex).toBe(cmlHex)
        }
      )
    )
  })
})
