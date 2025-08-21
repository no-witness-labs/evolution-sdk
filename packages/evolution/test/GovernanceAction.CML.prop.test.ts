import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck } from "effect"
import { describe, expect, it } from "vitest"

import * as GovernanceAction from "../src/GovernanceAction.js"
import * as ProtocolParams from "../src/ProtocolParamUpdate.js"
import * as ScriptHash from "../src/ScriptHash.js"

describe("GovernanceAction CML Compatibility (property)", () => {
  it("Evolution GovernanceAction CBOR is parseable by CML GovAction and roundtrips CBOR", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.arbitrary, (ga) => {
        const evoHex = GovernanceAction.toCBORHex(ga)

        // Parse with CML and re-encode
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()

        expect(evoHex).toBe(cmlHex)

        // Also ensure our decoder accepts CML's CBOR and equals original
        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  // Test individual governance actions with their full arbitraries
  it("InfoAction property test", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.infoArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)

        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  it("NoConfidenceAction property test", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.noConfidenceArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)

        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  it("HardForkInitiationAction property test", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.hardForkInitiationArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)

        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  it("TreasuryWithdrawalsAction property test", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.treasuryWithdrawalsArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)

        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  it("ParameterChangeAction property test", () => {
    // Create a simplified arbitrary that avoids circular references
    const simpleParameterChangeArbitrary = FastCheck.tuple(
      GovernanceAction.govActionIdArbitrary,
      // Use empty ProtocolParamUpdate instead of complex arbitrary
      FastCheck.constant(ProtocolParams.ProtocolParamUpdate.make({})),
      FastCheck.option(ScriptHash.arbitrary, { nil: null })
    ).map(
      ([govActionId, protocolParamUpdate, policyHash]) =>
        new GovernanceAction.ParameterChangeAction({
          govActionId,
          protocolParamUpdate,
          policyHash
        })
    )

    FastCheck.assert(
      FastCheck.property(simpleParameterChangeArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)

        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  it("UpdateCommitteeAction property test", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.updateCommitteeArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)

        // Strict CML roundtrip parity for UpdateCommitteeAction
        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)

        const evoRoundTrip = GovernanceAction.fromCBORHex(cmlHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)
      })
    )
  })

  it("NewConstitutionAction property test", () => {
    FastCheck.assert(
      FastCheck.property(GovernanceAction.newConstitutionArbitrary, (action) => {
        const ga = action
        const evoHex = GovernanceAction.toCBORHex(ga)

        // Test Evolution roundtrip at minimum
        const evoRoundTrip = GovernanceAction.fromCBORHex(evoHex)
        expect(GovernanceAction.equals(evoRoundTrip, ga)).toBe(true)

        const cmlParsed = CML.GovAction.from_cbor_hex(evoHex)
        const cmlHex = cmlParsed.to_cbor_hex()
        expect(evoHex).toBe(cmlHex)
      })
    )
  })
})
