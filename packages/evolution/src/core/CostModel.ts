import { Data, FastCheck, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"

/**
 * Error class for CostModel related operations.
 */
export class CostModelError extends Data.TaggedError("CostModelError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Individual cost model for a specific Plutus language version.
 * Contains an array of cost parameters.
 *
 * ```
 * cost_model = [ * uint ]
 * ```
 */
export class CostModel extends Schema.Class<CostModel>("CostModel")({
  costs: Schema.Array(Schema.BigInt)
}) {}

/**
 * Map of language versions to their corresponding cost models.
 *
 * ```
 *  cost_models = { * language => cost_model }
 * ```
 */
export class CostModels extends Schema.Class<CostModels>("CostModels")({
  PlutusV1: CostModel,
  PlutusV2: CostModel,
  PlutusV3: CostModel
}) {}

export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: Schema.Array(Schema.BigIntFromSelf)
})

/**
 * CBOR encoding/decoding for CostModels using language tags as keys.
 * Only includes languages with non-empty cost arrays to match CML behavior.
 */
export const FromCDDL = Schema.transform(CDDLSchema, Schema.typeSchema(CostModels), {
  strict: true,
  encode: (costModels) => {
    // Always emit as Map: include only languages with non-empty arrays
    const out = new Map<bigint, ReadonlyArray<bigint>>()
    if (costModels.PlutusV1.costs.length > 0) out.set(0n, costModels.PlutusV1.costs)
    if (costModels.PlutusV2.costs.length > 0) out.set(1n, costModels.PlutusV2.costs)
    if (costModels.PlutusV3.costs.length > 0) out.set(2n, costModels.PlutusV3.costs)
    return out
  },
  decode: (encoded) => {
    const v1 = encoded.get(0n) as ReadonlyArray<bigint> | undefined
    const v2 = encoded.get(1n) as ReadonlyArray<bigint> | undefined
    const v3 = encoded.get(2n) as ReadonlyArray<bigint> | undefined
    const result = {
      PlutusV1: new CostModel({ costs: v1 ?? [] }),
      PlutusV2: new CostModel({ costs: v2 ?? [] }),
      PlutusV3: new CostModel({ costs: v3 ?? [] })
    }
    return new CostModels(result)
  }
})

/**
 * FastCheck arbitrary for CostModel instances.
 */
export const arbitrary: FastCheck.Arbitrary<CostModel> = FastCheck.array(
  FastCheck.bigInt({
    min: 0n,
    max: 1000n
  })
).map((costs) => new CostModel({ costs }))

/**
 * CBOR encoding for CostModels.
 */
export const toCBOR = Function.makeCBOREncodeSync(
  FromCDDL,
  CostModelError,
  "CostModels.toCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

/**
 * CBOR decoding for CostModels.
 */
export const fromCBOR = Function.makeCBORDecodeSync(
  FromCDDL,
  CostModelError,
  "CostModels.fromCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  CostModelError,
  "CostModels.toCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

/**
 * CBOR decoding for CostModels.
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  CostModelError,
  "CostModels.fromCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

/**
 * Encode cost models as language_views for script data hash.
 *
 *
 * ```
 *  { * language => script_integrity_data }
 *
 *  This must be encoded canonically, using the same scheme as in
 *  RFC7049 section 3.9:
 *   - Maps, strings, and bytestrings must use a definite-length encoding
 *   - Integers must be as small as possible.
 *   - The expressions for map length, string length, and bytestring length
 *     must be as short as possible.
 *   - The keys in the map must be sorted as follows:
 *      -  If two keys have different lengths, the shorter one sorts earlier.
 *      -  If two keys have the same length, the one with the lower value
 *         in (byte-wise) lexical order sorts earlier.
 *
 *  For PlutusV1 (language id 0), the language view is the following:
 *    - the value of cost_models map at key 0 (in other words, the script_integrity_data)
 *      is encoded as an indefinite length list and the result is encoded as a bytestring.
 *      (our apologies)
 *      For example, the script_integrity_data corresponding to the all zero costmodel for V1
 *      would be encoded as (in hex):
 *      58a89f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff
 *    - the language ID tag is also encoded twice. first as a uint then as
 *      a bytestring. (our apologies)
 *      Concretely, this means that the language version for V1 is encoded as
 *      4100 in hex.
 *  For PlutusV2 (language id 1), the language view is the following:
 *    - the value of cost_models map at key 1 is encoded as an definite length list.
 *      For example, the script_integrity_data corresponding to the all zero costmodel for V2
 *      would be encoded as (in hex):
 *      98af0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
 *    - the language ID tag is encoded as expected.
 *      Concretely, this means that the language version for V2 is encoded as
 *      01 in hex.
 *  For PlutusV3 (language id 2), the language view is the following:
 *    - the value of cost_models map at key 2 is encoded as a definite length list.
 *
 *  Note that each Plutus language represented inside a transaction must have
 *  a cost model in the cost_models protocol parameter in order to execute,
 *  regardless of what the script integrity data is.
 * ```
 *
 * Returns the canonical CBOR encoding of the language views map.
 */
export const languageViewsEncoding = (costModels: CostModels): Uint8Array => {
  // Build a map of language ID -> cost model data
  // Only include cost models that have at least one cost (to match CML behavior)
  const languageData = new Map<number, ReadonlyArray<bigint>>()

  if (costModels.PlutusV1.costs.length > 0) languageData.set(0, costModels.PlutusV1.costs)
  if (costModels.PlutusV2.costs.length > 0) languageData.set(1, costModels.PlutusV2.costs)
  if (costModels.PlutusV3.costs.length > 0) languageData.set(2, costModels.PlutusV3.costs)

  // Create CBOR map with canonical ordering
  const mapEntries = new Map<CBOR.CBOR, CBOR.CBOR>()

  for (const [languageId, costs] of languageData.entries()) {
    if (languageId === 0) {
      // PlutusV1: Special indefinite length encoding due to cardano-node bug
      // Key: language ID (0) encoded as bytes [0x00]
      const v1KeyBytes = new Uint8Array([0])

      // Value: indefinite length array encoded as bytes
      const costsArray: ReadonlyArray<CBOR.CBOR> = costs.map((cost) => (cost >= 0n ? cost : -(cost + 1n)))
      const indefiniteArrayCbor = CBOR.internalEncodeSync(
        costsArray,
        CBOR.CML_DATA_DEFAULT_OPTIONS // indefinite length
      )

      mapEntries.set(v1KeyBytes, indefiniteArrayCbor)
    } else {
      // PlutusV2/V3: Standard definite length encoding
      const costsArray: ReadonlyArray<CBOR.CBOR> = costs.map((cost) => (cost >= 0n ? cost : -(cost + 1n)))

      mapEntries.set(BigInt(languageId), costsArray)
    }
  }

  // Encode as canonical CBOR map
  return CBOR.internalEncodeSync(mapEntries, CBOR.CML_DEFAULT_OPTIONS)
}
