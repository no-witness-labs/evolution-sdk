import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { FastCheck, Schema } from "effect"
import { describe, expect, it } from "vitest"

import * as AuxiliaryData from "../src/AuxiliaryData.js"
import * as AuxiliaryDataHash from "../src/AuxiliaryDataHash.js"
import * as CBOR from "../src/CBOR.js"
import * as CostModel from "../src/CostModel.js"
import * as Data from "../src/Data.js"
import * as Redeemer from "../src/Redeemer.js"
import * as ScriptDataHash from "../src/ScriptDataHash.js"
import * as TransactionBody from "../src/TransactionBody.js"
import * as TransactionHash from "../src/TransactionHash.js"
import * as UtilsHash from "../src/utils/Hash.js"

// Local helper to hex-encode bytes for assertions
const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

// Helper: sum ex units manually (reference expectation)
const sumExUnits = (redeemers: ReadonlyArray<Redeemer.Redeemer>): Redeemer.ExUnits => {
  let mem = 0n
  let steps = 0n
  for (const r of redeemers) {
    mem += r.exUnits[0]
    steps += r.exUnits[1]
  }
  return [mem, steps]
}

describe("UtilsHash helpers CML parity", () => {
  it("property: hashTransaction matches CML.hash_transaction", () => {
    FastCheck.assert(
      FastCheck.property(TransactionBody.arbitrary, (body) => {
        const evolutionHash = UtilsHash.hashTransaction(body)
        const evolutionHex = TransactionHash.toHex(evolutionHash)

        const hex = TransactionBody.toCBORHex(body)
        const cmlBody = CML.TransactionBody.from_cbor_hex(hex)
        const cmlHash = CML.hash_transaction(cmlBody)
        const cmlHex = typeof cmlHash?.to_hex === "function" ? cmlHash.to_hex() : cmlHash

        expect(evolutionHex).toBe(cmlHex)
      })
    )
  })

  it("property: hashAuxiliaryData matches CML.hash_auxiliary_data", () => {
    FastCheck.assert(
      FastCheck.property(AuxiliaryData.arbitrary, (aux) => {
        const evolutionHash = UtilsHash.hashAuxiliaryData(aux)
        const evolutionHex = AuxiliaryDataHash.toHex(evolutionHash)

        const hex = AuxiliaryData.toCBORHex(aux)
        const cmlAux = CML.AuxiliaryData.from_cbor_hex(hex)
        const cmlHash = CML.hash_auxiliary_data(cmlAux)
        const cmlHex = typeof cmlHash?.to_hex === "function" ? cmlHash.to_hex() : cmlHash

        expect(evolutionHex).toBe(cmlHex)
      })
    )
  })

  it("property: hashPlutusData matches CML.hash_plutus_data", () => {
    FastCheck.assert(
      FastCheck.property(Data.arbitrary, (datum) => {
        const evolutionHash = UtilsHash.hashPlutusData(datum)
        const evolutionBytes = evolutionHash.hash

        const hex = Data.toCBORHex(datum)
        const cmlDatum = CML.PlutusData.from_cbor_hex(hex)
        const cmlHash = CML.hash_plutus_data(cmlDatum)

        expect(evolutionBytes).toStrictEqual(cmlHash.to_raw_bytes())
      })
    )
  })

  it("property: computeTotalExUnits sums mem and steps correctly", () => {
    const redeemersArb = FastCheck.array(Redeemer.arbitrary, { minLength: 0, maxLength: 5 })
    FastCheck.assert(
      FastCheck.property(redeemersArb, (redeemers) => {
        const expected = sumExUnits(redeemers)
        const actualExUnits = UtilsHash.computeTotalExUnits(redeemers)
        expect(actualExUnits[0]).toBe(expected[0])
        expect(actualExUnits[1]).toBe(expected[1])
      })
    )
  })

  it("property: hashScriptData matches CML (all cases)", () => {
    // Goal: Evolution hash equals CML hash across varied inputs (parity test)
    // Small domains to keep the test fast in CI
    const smallCostModel = FastCheck.array(FastCheck.bigInt({ min: 0n, max: 1000n }), { maxLength: 4 }).map(
      (costs) => new CostModel.CostModel({ costs })
    )
    const smallCostModels = FastCheck.tuple(smallCostModel, smallCostModel, smallCostModel).map(
      ([v1, v2, v3]) => new CostModel.CostModels({ PlutusV1: v1, PlutusV2: v2, PlutusV3: v3 })
    )

    const redeemersArb = FastCheck.array(Redeemer.arbitrary, { maxLength: 3 })
    const datumsOptArb = FastCheck.option(FastCheck.array(Data.arbitrary, { maxLength: 3 }), { nil: undefined })

    FastCheck.assert(
      FastCheck.property(redeemersArb, datumsOptArb, smallCostModels, (redeemers, datums, costModels) => {
        // Evolution
        const evolution = UtilsHash.hashScriptData(redeemers, costModels, datums)
        const evolutionHex = ScriptDataHash.toHex(evolution)

        // Build CML inputs from Evolution CBOR encodings
        // Redeemers: encode array of CDDL tuples and feed to CML
        const encRedeemer = Schema.encodeSync(Redeemer.FromCDDL)
        const redeemersCbor = redeemers.map((r) => encRedeemer(r))
        const redeemersHex = CBOR.toCBORHex(redeemersCbor)
        const cmlRedeemers = CML.Redeemers.from_cbor_hex(redeemersHex)

        // CostModels: direct CBOR hex roundtrip
        const costModelsHex = CostModel.toCBORHex(costModels)
        const cmlCostModels = CML.CostModels.from_cbor_hex(costModelsHex)

        // Datums: optional PlutusDataList
        let cmlDatums: any | undefined = undefined
        if (Array.isArray(datums) && datums.length > 0) {
          const list = CML.PlutusDataList.new()
          for (const d of datums) {
            const dHex = Data.toCBORHex(d)
            list.add(CML.PlutusData.from_cbor_hex(dHex))
          }
          cmlDatums = list
        }

        const cmlHash = CML.hash_script_data(cmlRedeemers, cmlCostModels, cmlDatums)
        const cmlHex = cmlHash.to_hex()

        expect(evolutionHex).toBe(cmlHex)
      })
    )
  })

  it("languageViewsEncoding: V1 all-zero matches ledger example hex", () => {
    // V1 has 166 parameters in example; value should be indefinite array wrapped in bytes
    const zerosV1 = Array.from({ length: 166 }, () => 0n)
    const cms = new CostModel.CostModels({
      PlutusV1: new CostModel.CostModel({ costs: zerosV1 }),
      PlutusV2: new CostModel.CostModel({ costs: [] }),
      PlutusV3: new CostModel.CostModel({ costs: [] })
    })
    const bytes = CostModel.languageViewsEncoding(cms)

    // Expected: a1 41 00 58 a8 9f 00 x166 ff
    const expected =
      "a14100" + // map(1), key = bytes(1) 0x00
      "58a8" + // bytes(length=168)
      "9f" + // start indefinite array
      "00".repeat(166) +
      "ff" // break

    expect(toHex(bytes)).toBe(expected)
  })

  it("languageViewsEncoding: V2 all-zero matches ledger example hex", () => {
    // V2 has 175 parameters in example; value should be definite-length array
    const zerosV2 = Array.from({ length: 175 }, () => 0n)
    const cms = new CostModel.CostModels({
      PlutusV1: new CostModel.CostModel({ costs: [] }),
      PlutusV2: new CostModel.CostModel({ costs: zerosV2 }),
      PlutusV3: new CostModel.CostModel({ costs: [] })
    })
    const bytes = CostModel.languageViewsEncoding(cms)

    // Expected: a1 01 98 af 00 x175
    const expected =
      "a101" + // map(1), key = uint 1
      "98af" + // array(length=175)
      "00".repeat(175)

    expect(toHex(bytes)).toBe(expected)
  })

  it("hashScriptData: deterministic V1 all-zero language views parity with CML (no redeemers, no datums)", () => {
    const cms = new CostModel.CostModels({
      PlutusV1: new CostModel.CostModel({ costs: Array.from({ length: 166 }, () => 0n) }),
      PlutusV2: new CostModel.CostModel({ costs: [] }),
      PlutusV3: new CostModel.CostModel({ costs: [] })
    })

    const redeemers: ReadonlyArray<Redeemer.Redeemer> = []
    const evolution = UtilsHash.hashScriptData(redeemers, cms)
    const evolutionHex = ScriptDataHash.toHex(evolution)

    // Build CML inputs
    const cmlRedeemers = CML.Redeemers.from_cbor_hex("80") // empty array
    const cmlCostModels = CML.CostModels.from_cbor_hex(CostModel.toCBORHex(cms))
    const cmlHex = CML.hash_script_data(cmlRedeemers, cmlCostModels).to_hex()

    expect(evolutionHex).toBe(cmlHex)
  })

  it("special case parity: redeemers=[], datums non-empty", () => {
    const redeemers: ReadonlyArray<Redeemer.Redeemer> = []
    const datums: ReadonlyArray<Data.Data> = [Data.fromCBORHex("d87980")] // Constr(0,[])
    const costModels = new CostModel.CostModels({
      PlutusV1: new CostModel.CostModel({ costs: [] }),
      PlutusV2: new CostModel.CostModel({ costs: [] }),
      PlutusV3: new CostModel.CostModel({ costs: [] })
    })

    const evolutionHex = ScriptDataHash.toHex(UtilsHash.hashScriptData(redeemers, costModels, datums))

    const list = CML.PlutusDataList.new()
    list.add(CML.PlutusData.from_cbor_hex("d87980"))
    const cmlHex = CML.hash_script_data(
      CML.Redeemers.from_cbor_hex("80"),
      CML.CostModels.from_cbor_hex("a0"),
      list
    ).to_hex()

    expect(evolutionHex).toBe(cmlHex)
  })
})
