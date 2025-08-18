import { Data, Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as Metadata from "./Metadata.js"
import * as NativeScripts from "./NativeScripts.js"
import * as PlutusV1 from "./PlutusV1.js"
import * as PlutusV2 from "./PlutusV2.js"
import * as PlutusV3 from "./PlutusV3.js"

/**
 * Error class for AuxiliaryData related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class AuxiliaryDataError extends Data.TaggedError("AuxiliaryDataError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * AuxiliaryData based on Conway CDDL specification.
 *
 * CDDL (Conway era):
 * ```
 * auxiliary_data = {
 *   ? 0 => metadata           ; transaction_metadata
 *   ? 1 => [* native_script]  ; native_scripts
 *   ? 2 => [* plutus_v1_script] ; plutus_v1_scripts
 *   ? 3 => [* plutus_v2_script] ; plutus_v2_scripts
 *   ? 4 => [* plutus_v3_script] ; plutus_v3_scripts
 * }
 * ```
 *
 * Uses map format with numeric keys as per Conway specification.
 *
 * @since 2.0.0
 * @category model
 */
export class AuxiliaryData extends Schema.Class<AuxiliaryData>("AuxiliaryData")({
  metadata: Schema.optional(Metadata.Metadata),
  nativeScripts: Schema.optional(Schema.Array(NativeScripts.Native)),
  plutusV1Scripts: Schema.optional(Schema.Array(PlutusV1.PlutusV1)),
  plutusV2Scripts: Schema.optional(Schema.Array(PlutusV2.PlutusV2)),
  plutusV3Scripts: Schema.optional(Schema.Array(PlutusV3.PlutusV3))
}) {}

/**
 * Tagged CDDL schema for AuxiliaryData (#6.259 wrapping the struct).
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = CBOR.tag(
  259,
  Schema.Struct({
    0: Schema.optional(Metadata.CDDLSchema),
    1: Schema.optional(Schema.Array(NativeScripts.CDDLSchema)),
    2: Schema.optional(Schema.Array(PlutusV1.CDDLSchema)),
    3: Schema.optional(Schema.Array(PlutusV2.CDDLSchema)),
    4: Schema.optional(Schema.Array(PlutusV3.CDDLSchema))
  })
)

/**
 * Transform between tagged CDDL (tag 259) and AuxiliaryData class.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(AuxiliaryData), {
  strict: true,
  encode: (toA) =>
    E.gen(function* () {
      const struct: Record<number, any> = {}
      if (toA.metadata !== undefined) struct[0] = yield* ParseResult.encodeEither(Metadata.FromCDDL)(toA.metadata)
      if (toA.nativeScripts !== undefined) {
        const scripts = []
        for (const s of toA.nativeScripts) {
          scripts.push(yield* ParseResult.encodeEither(NativeScripts.FromCDDL)(s))
        }
        struct[1] = scripts
      }
      if (toA.plutusV1Scripts !== undefined) {
        const scripts = []
        for (const s of toA.plutusV1Scripts) {
          scripts.push(yield* ParseResult.encodeEither(PlutusV1.FromCDDL)(s))
        }
        struct[2] = scripts
      }
      if (toA.plutusV2Scripts !== undefined) {
        const scripts = []
        for (const s of toA.plutusV2Scripts) {
          scripts.push(yield* ParseResult.encodeEither(PlutusV2.FromCDDL)(s))
        }
        struct[3] = scripts
      }
      if (toA.plutusV3Scripts !== undefined) {
        const scripts = []
        for (const s of toA.plutusV3Scripts) {
          scripts.push(yield* ParseResult.encodeEither(PlutusV3.FromCDDL)(s))
        }
        struct[4] = scripts
      }
      return { value: struct, tag: 259 as const, _tag: "Tag" as const }
    }),
  decode: (tagged) =>
    E.gen(function* () {
      const struct = tagged.value
      const metadata = struct[0] ? yield* ParseResult.decodeEither(Metadata.FromCDDL)(struct[0]) : undefined
      let nativeScripts: Array<NativeScripts.Native> | undefined = undefined
      if (struct[1]) {
        nativeScripts = []
        for (const s of struct[1]) {
          nativeScripts.push(yield* ParseResult.decodeEither(NativeScripts.FromCDDL)(s))
        }
      }
      let plutusV1Scripts: Array<PlutusV1.PlutusV1> | undefined = undefined
      if (struct[2]) {
        plutusV1Scripts = []
        for (const s of struct[2]) {
          plutusV1Scripts.push(yield* ParseResult.decodeEither(PlutusV1.FromCDDL)(s))
        }
      }
      let plutusV2Scripts: Array<PlutusV2.PlutusV2> | undefined = undefined
      if (struct[3]) {
        plutusV2Scripts = []
        for (const s of struct[3]) {
          plutusV2Scripts.push(yield* ParseResult.decodeEither(PlutusV2.FromCDDL)(s))
        }
      }
      let plutusV3Scripts: Array<PlutusV3.PlutusV3> | undefined = undefined
      if (struct[4]) {
        plutusV3Scripts = []
        for (const s of struct[4]) {
          plutusV3Scripts.push(yield* ParseResult.decodeEither(PlutusV3.FromCDDL)(s))
        }
      }
      return new AuxiliaryData({ metadata, nativeScripts, plutusV1Scripts, plutusV2Scripts, plutusV3Scripts })
    })
}).annotations({
  identifier: "AuxiliaryData.FromCDDL",
  title: "AuxiliaryData from tagged CDDL",
  description: "Transforms CBOR tag 259 CDDL structure to AuxiliaryData"
})

/**
 * CBOR bytes transformation schema for AuxiliaryData.
 * Transforms between CBOR bytes and AuxiliaryData using CDDL format.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL).annotations({
    identifier: "AuxiliaryData.FromCBORBytes",
    title: "AuxiliaryData from CBOR bytes",
    description: "Decode AuxiliaryData from CBOR-encoded bytes (tag 259)"
  })

/**
 * CBOR hex transformation schema for AuxiliaryData.
 * Transforms between CBOR hex string and AuxiliaryData using CDDL format.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(Bytes.FromHex, FromCBORBytes(options)).annotations({
    identifier: "AuxiliaryData.FromCBORHex",
    title: "AuxiliaryData from CBOR hex",
    description: "Decode AuxiliaryData from CBOR-encoded hex (tag 259)"
  })

/**
 * Smart constructor for AuxiliaryData with validation.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = AuxiliaryData.make

/**
 * Create an empty AuxiliaryData instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = (): AuxiliaryData =>
  new AuxiliaryData({
    metadata: undefined,
    nativeScripts: undefined,
    plutusV1Scripts: undefined,
    plutusV2Scripts: undefined,
    plutusV3Scripts: undefined
  })

/**
 * Check if two AuxiliaryData instances are equal (deep comparison).
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AuxiliaryData, b: AuxiliaryData): boolean => {
  if (a.metadata && b.metadata) {
    if (!Metadata.equals(a.metadata, b.metadata)) return false
  } else if (a.metadata || b.metadata) return false

  const cmpArray = (x?: ReadonlyArray<any>, y?: ReadonlyArray<any>) =>
    x && y ? x.length === y.length && x.every((v, i) => v === y[i]) : x === y

  if (!cmpArray(a.nativeScripts, b.nativeScripts)) return false
  if (!cmpArray(a.plutusV1Scripts, b.plutusV1Scripts)) return false
  if (!cmpArray(a.plutusV2Scripts, b.plutusV2Scripts)) return false
  if (!cmpArray(a.plutusV3Scripts, b.plutusV3Scripts)) return false
  return true
}

/**
 * FastCheck arbitrary for generating random AuxiliaryData instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<AuxiliaryData> = FastCheck.record({
  metadata: FastCheck.option(Metadata.arbitrary, { nil: undefined }),
  nativeScripts: FastCheck.option(
    FastCheck.array(
      // basic native script arbitrary using keyHash sig scripts only for now
      FastCheck.record({
        type: FastCheck.constant("sig" as const),
        keyHash: FastCheck.hexaString({ minLength: 56, maxLength: 56 })
      }),
      { maxLength: 3 }
    ),
    { nil: undefined }
  ),
  plutusV1Scripts: FastCheck.option(FastCheck.array(PlutusV1.arbitrary, { maxLength: 3 }), { nil: undefined }),
  plutusV2Scripts: FastCheck.option(FastCheck.array(PlutusV2.arbitrary, { maxLength: 3 }), { nil: undefined }),
  plutusV3Scripts: FastCheck.option(FastCheck.array(PlutusV3.arbitrary, { maxLength: 3 }), { nil: undefined })
}).map((r) => new AuxiliaryData(r))

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Decode AuxiliaryData from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, AuxiliaryDataError, "AuxiliaryData.fromCBORBytes")

/**
 * Decode AuxiliaryData from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, AuxiliaryDataError, "AuxiliaryData.fromCBORHex")

/**
 * Encode AuxiliaryData to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, AuxiliaryDataError, "AuxiliaryData.toCBORBytes")

/**
 * Encode AuxiliaryData to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, AuxiliaryDataError, "AuxiliaryData.toCBORHex")

// ============================================================================
// Either Namespace - Either-based Error Handling
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Decode AuxiliaryData from CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, AuxiliaryDataError)

  /**
   * Decode AuxiliaryData from CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, AuxiliaryDataError)

  /**
   * Encode AuxiliaryData to CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, AuxiliaryDataError)

  /**
   * Encode AuxiliaryData to CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, AuxiliaryDataError)
}
