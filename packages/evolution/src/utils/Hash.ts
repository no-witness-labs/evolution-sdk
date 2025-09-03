import { blake2b } from "@noble/hashes/blake2"
import { Schema } from "effect"

import * as AuxiliaryData from "../core/AuxiliaryData.js"
import * as AuxiliaryDataHash from "../core/AuxiliaryDataHash.js"
import * as CBOR from "../core/CBOR.js"
import * as CostModel from "../core/CostModel.js"
import * as Data from "../core/Data.js"
import * as DatumOption from "../core/DatumOption.js"
import * as Redeemer from "../core/Redeemer.js"
import * as ScriptDataHash from "../core/ScriptDataHash.js"
import * as TransactionBody from "../core/TransactionBody.js"
import * as TransactionHash from "../core/TransactionHash.js"

/**
 * Compute the transaction body hash (blake2b-256 over CBOR of body).
 */
export const hashTransaction = (body: TransactionBody.TransactionBody): TransactionHash.TransactionHash => {
  // Encode body using the same options used across the SDK to ensure parity with CML
  const bytes = TransactionBody.toCBORBytes(body)
  const digest = blake2b(bytes, { dkLen: 32 })
  return new TransactionHash.TransactionHash({ hash: digest })
}

/**
 * script_data per CDDL (Conway)
 *
 * ```
 * ; This is a hash of data which may affect evaluation of a script.
 * ; This data consists of:
 * ;   - The redeemers from the transaction_witness_set (the value of field 5).
 * ;   - The datums from the transaction_witness_set (the value of field 4).
 * ;   - The value in the cost_models map corresponding to the script's language
 * ;     (in field 18 of protocol_param_update.)
 * ; (In the future it may contain additional protocol parameters.)
 * ;
 * ; Since this data does not exist in contiguous form inside a transaction, it needs
 * ; to be independently constructed by each recipient.
 * ;
 * ; The bytestring which is hashed is the concatenation of three things:
 * ;   redeemers || datums || language views
 * ; The redeemers are exactly the data present in the transaction witness set.
 * ; Similarly for the datums, if present. If no datums are provided, the middle
 * ; field is omitted (i.e. it is the empty/null bytestring).
 * ;
 * ; language views CDDL:
 * ; { * language => script_integrity_data }
 * ;
 * ; This must be encoded canonically, using the same scheme as in
 * ; RFC7049 section 3.9:
 * ;  - Maps, strings, and bytestrings must use a definite-length encoding
 * ;  - Integers must be as small as possible.
 * ;  - The expressions for map length, string length, and bytestring length
 * ;    must be as short as possible.
 * ;  - The keys in the map must be sorted as follows:
 * ;     -  If two keys have different lengths, the shorter one sorts earlier.
 * ;     -  If two keys have the same length, the one with the lower value
 * ;        in (byte-wise) lexical order sorts earlier.
 * ;
 * ; For PlutusV1 (language id 0), the language view is the following:
 * ;   - the value of cost_models map at key 0 (in other words, the script_integrity_data)
 * ;     is encoded as an indefinite length list and the result is encoded as a bytestring.
 * ;     (our apologies)
 * ;     For example, the script_integrity_data corresponding to the all zero costmodel for V1
 * ;     would be encoded as (in hex):
 * ;     58a89f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff
 * ;   - the language ID tag is also encoded twice. first as a uint then as
 * ;     a bytestring. (our apologies)
 * ;     Concretely, this means that the language version for V1 is encoded as
 * ;     4100 in hex.
 * ; For PlutusV2 (language id 1), the language view is the following:
 * ;   - the value of cost_models map at key 1 is encoded as an definite length list.
 * ;     For example, the script_integrity_data corresponding to the all zero costmodel for V2
 * ;     would be encoded as (in hex):
 * ;     98af0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
 * ;   - the language ID tag is encoded as expected.
 * ;     Concretely, this means that the language version for V2 is encoded as
 * ;     01 in hex.
 * ; For PlutusV3 (language id 2), the language view is the following:
 * ;   - the value of cost_models map at key 2 is encoded as a definite length list.
 * ;
 * ; Note that each Plutus language represented inside a transaction must have
 * ; a cost model in the cost_models protocol parameter in order to execute,
 * ; regardless of what the script integrity data is.
 * ;
 * ; Finally, note that in the case that a transaction includes datums but does not
 * ; include the redeemers field, the script data format becomes (in hex):
 * ; [ A0 | datums | A0 ]
 * ; corresponding to a CBOR empty map and an empty map for language view.
 * ; This empty redeeemer case has changed from the previous eras, since default
 * ; representation for redeemers has been changed to a map. Also whenever redeemers are
 * ; supplied either as a map or as an array they must contain at least one element,
 * ; therefore there is no way to override this behavior by providing a custom
 * ; representation for empty redeemers.
 * script_data_hash = hash32
 * ```
 */
export const hashScriptData = (
  redeemers: ReadonlyArray<Redeemer.Redeemer>,
  costModels: CostModel.CostModels,
  datums?: ReadonlyArray<Data.Data>
): ScriptDataHash.ScriptDataHash => {
  // Helper: build tag(258) bytes around a definite-length array of datum bytes
  // Each datum is encoded using Data.toCBORBytes (which uses CML_DATA_DEFAULT_OPTIONS),
  // while the outer array is encoded as a definite-length CBOR array for stability.
  const buildDatumsSetBytes = (ds: ReadonlyArray<Data.Data>): Uint8Array => {
    // Pre-encode each datum using Data's encoding
    const items = ds.map((d) => Data.toCBORBytes(d))
    // Use CBOR helper to build definite-length array
    const arr = CBOR.encodeArrayAsDefinite(items)
    // Wrap with tag(258) using CBOR helper
    return CBOR.encodeTaggedValue(258, arr)
  }
  // 1) Encode redeemers to CBOR values via CDDL
  const encodeRedeemer = Schema.encodeSync(Redeemer.FromCDDL)
  const redeemersCbor = redeemers.map((r) => encodeRedeemer(r))

  // 2) Encode optional datums to CBOR values via CDDL (if provided and non-empty)
  //    Note: CML treats empty datums array as "no datums provided" (undefined)
  const hasDatums = Array.isArray(datums) && datums.length > 0 // Only include datums if array is non-empty

  // 3) Get language_views encoding using CML's exact method
  //    This handles PlutusV1 indefinite length bug and PlutusV2/V3 definite length
  const langViewsBytes = CostModel.languageViewsEncoding(costModels)

  // 4) Build payload per CML's exact algorithm
  let payload: Uint8Array

  if (hasDatums && redeemers.length === 0) {
    // Special case (CDDL): [ A0 | tag(258) datums | A0 ]
    const datumsSetBytes = buildDatumsSetBytes(datums)
    const totalLen = 1 + datumsSetBytes.length + 1
    payload = new Uint8Array(totalLen)
    payload.set([0xa0], 0) // Empty map
    payload.set(datumsSetBytes, 1)
    payload.set([0xa0], 1 + datumsSetBytes.length) // Empty map
  } else {
    // Normal case: [ redeemers | datums | language_views ]
    const redeemersBytes = CBOR.internalEncodeSync(redeemersCbor, CBOR.CML_DEFAULT_OPTIONS)
    const datumsSetBytes = hasDatums ? buildDatumsSetBytes(datums) : undefined

    const totalLen = redeemersBytes.length + (datumsSetBytes ? datumsSetBytes.length : 0) + langViewsBytes.length
    payload = new Uint8Array(totalLen)
    payload.set(redeemersBytes, 0)
    if (datumsSetBytes) payload.set(datumsSetBytes, redeemersBytes.length)
    payload.set(langViewsBytes, redeemersBytes.length + (datumsSetBytes ? datumsSetBytes.length : 0))
  }

  const digest = blake2b(payload, { dkLen: 32 })
  return new ScriptDataHash.ScriptDataHash({ hash: digest })
}

/**
 * Compute hash of auxiliary data (tag 259) per ledger rules.
 */
export const hashAuxiliaryData = (aux: AuxiliaryData.AuxiliaryData): AuxiliaryDataHash.AuxiliaryDataHash => {
  const bytes = AuxiliaryData.toCBORBytes(aux)
  const digest = blake2b(bytes, { dkLen: 32 })
  return new AuxiliaryDataHash.AuxiliaryDataHash({ bytes: digest })
}

/**
 * Compute hash of plutus data using default Data encoding.
 */
export const hashPlutusData = (pd: Data.Data): DatumOption.DatumHash => {
  const bytes = Data.toCBORBytes(pd)
  const digest = blake2b(bytes, { dkLen: 32 })
  return new DatumOption.DatumHash({ hash: digest })
}

/**
 * Compute total ex_units by summing over redeemers.
 */
export const computeTotalExUnits = (redeemers: ReadonlyArray<Redeemer.Redeemer>): Redeemer.ExUnits => {
  let mem = 0n
  let steps = 0n
  for (const r of redeemers) {
    mem += r.exUnits[0]
    steps += r.exUnits[1]
  }
  return [mem, steps]
}
