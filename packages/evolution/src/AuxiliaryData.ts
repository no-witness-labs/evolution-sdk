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
export class ConwayAuxiliaryData extends Schema.TaggedClass<ConwayAuxiliaryData>("ConwayAuxiliaryData")(
  "ConwayAuxiliaryData",
  {
    metadata: Schema.optional(Metadata.Metadata),
    nativeScripts: Schema.optional(Schema.Array(NativeScripts.Native)),
    plutusV1Scripts: Schema.optional(Schema.Array(PlutusV1.PlutusV1)),
    plutusV2Scripts: Schema.optional(Schema.Array(PlutusV2.PlutusV2)),
    plutusV3Scripts: Schema.optional(Schema.Array(PlutusV3.PlutusV3))
  }
) {}

/**
 * AuxiliaryData for ShelleyMA era (array format).
 *
 * CDDL (ShelleyMA era):
 * ```
 * auxiliary_data = [ metadata?, [* native_script]? ]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class ShelleyMAAuxiliaryData extends Schema.TaggedClass<ShelleyMAAuxiliaryData>("ShelleyMAAuxiliaryData")(
  "ShelleyMAAuxiliaryData",
  {
    metadata: Schema.optional(Metadata.Metadata),
    nativeScripts: Schema.optional(Schema.Array(NativeScripts.Native))
  }
) {}

/**
 * AuxiliaryData for Shelley era (direct metadata).
 *
 * CDDL (Shelley era):
 * ```
 * auxiliary_data = metadata
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class ShelleyAuxiliaryData extends Schema.TaggedClass<ShelleyAuxiliaryData>("ShelleyAuxiliaryData")(
  "ShelleyAuxiliaryData",
  {
    metadata: Metadata.Metadata
  }
) {}

/**
 * Union of all AuxiliaryData era formats.
 *
 * @since 2.0.0
 * @category model
 */
export const AuxiliaryData = Schema.Union(ConwayAuxiliaryData, ShelleyMAAuxiliaryData, ShelleyAuxiliaryData)

/**
 * Type representing any AuxiliaryData format.
 *
 * @since 2.0.0
 * @category model
 */
export type AuxiliaryData = Schema.Schema.Type<typeof AuxiliaryData>

/**
 * Tagged CDDL schema for AuxiliaryData (#6.259 wrapping the struct).
 *
 * @since 2.0.0
 * @category schemas
 */
// Conway (current) CDDL form: tagged map with numeric keys
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
// Union across eras:
// - Conway: tag(259, {0: metadata, 1: [native], 2: [v1], 3: [v2], 4: [v3]})
// - ShelleyMA: [ metadata?, [native_script]? ]
// - Shelley: metadata (map)
const AnyEraCDDL = Schema.Union(
  CDDLSchema,
  // ShelleyMA array form; we accept arbitrary CBOR array and validate within decode
  CBOR.ArraySchema,
  // Shelley map form (metadata only)
  Metadata.CDDLSchema
)

export const FromCDDL = Schema.transformOrFail(AnyEraCDDL, Schema.typeSchema(AuxiliaryData), {
  strict: true,
  encode: (auxData) =>
    E.gen(function* () {
      // Always encode as Conway format (tag 259) for compatibility
      switch (auxData._tag) {
        case "ConwayAuxiliaryData": {
          const struct: Record<number, any> = {}
          if (auxData.metadata !== undefined)
            struct[0] = yield* ParseResult.encodeEither(Metadata.FromCDDL)(auxData.metadata)
          if (auxData.nativeScripts !== undefined) {
            const scripts = []
            for (const s of auxData.nativeScripts) {
              scripts.push(yield* ParseResult.encodeEither(NativeScripts.FromCDDL)(s))
            }
            struct[1] = scripts
          }
          if (auxData.plutusV1Scripts !== undefined) {
            const scripts = []
            for (const s of auxData.plutusV1Scripts) {
              scripts.push(yield* ParseResult.encodeEither(PlutusV1.FromCDDL)(s))
            }
            struct[2] = scripts
          }
          if (auxData.plutusV2Scripts !== undefined) {
            const scripts = []
            for (const s of auxData.plutusV2Scripts) {
              scripts.push(yield* ParseResult.encodeEither(PlutusV2.FromCDDL)(s))
            }
            struct[3] = scripts
          }
          if (auxData.plutusV3Scripts !== undefined) {
            const scripts = []
            for (const s of auxData.plutusV3Scripts) {
              scripts.push(yield* ParseResult.encodeEither(PlutusV3.FromCDDL)(s))
            }
            struct[4] = scripts
          }
          return { value: struct, tag: 259 as const, _tag: "Tag" as const }
        }
        case "ShelleyMAAuxiliaryData": {
          // Convert to Conway format for encoding
          const struct: Record<number, any> = {}
          if (auxData.metadata !== undefined)
            struct[0] = yield* ParseResult.encodeEither(Metadata.FromCDDL)(auxData.metadata)
          if (auxData.nativeScripts !== undefined) {
            const scripts = []
            for (const s of auxData.nativeScripts) {
              scripts.push(yield* ParseResult.encodeEither(NativeScripts.FromCDDL)(s))
            }
            struct[1] = scripts
          }
          return { value: struct, tag: 259 as const, _tag: "Tag" as const }
        }
        case "ShelleyAuxiliaryData": {
          // Convert to Conway format for encoding
          const struct: Record<number, any> = {}
          if (auxData.metadata !== undefined)
            struct[0] = yield* ParseResult.encodeEither(Metadata.FromCDDL)(auxData.metadata)
          return { value: struct, tag: 259 as const, _tag: "Tag" as const }
        }
      }
    }),
  decode: (input) =>
    E.gen(function* () {
      // Conway tag(259)
      if (CBOR.isTag(input) && input.tag === 259) {
        const struct = input.value
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
        return new ConwayAuxiliaryData({
          metadata,
          nativeScripts,
          plutusV1Scripts,
          plutusV2Scripts,
          plutusV3Scripts
        })
      }

      // ShelleyMA array form: [ metadata?, native_scripts? ]
      if (Array.isArray(input)) {
        const arr = input
        let metadata: Metadata.Metadata | undefined
        let nativeScripts: Array<NativeScripts.Native> | undefined

        if (arr.length >= 1 && arr[0] !== undefined) {
          metadata = yield* ParseResult.decodeEither(Metadata.FromCDDL)(arr[0])
        }
        if (arr.length >= 2 && arr[1] !== undefined) {
          nativeScripts = []
          for (const s of arr[1] as ReadonlyArray<any>) {
            nativeScripts.push(yield* ParseResult.decodeEither(NativeScripts.FromCDDL)(s))
          }
        }
        return new ShelleyMAAuxiliaryData({ metadata, nativeScripts })
      }

      // Shelley map form: metadata only
      if (input instanceof Map) {
        const metadata = yield* ParseResult.decodeEither(Metadata.FromCDDL)(input)
        return new ShelleyAuxiliaryData({ metadata })
      }

      // Fallback (should not happen due to Union) – treat as empty Conway
      return new ConwayAuxiliaryData({})
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
 * Create an empty Conway AuxiliaryData instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const emptyConwayAuxiliaryData = (): AuxiliaryData => new ConwayAuxiliaryData({})

/**
 * Backwards-friendly helper returning empty Conway-format auxiliary data.
 * Alias kept for ergonomics and CML-compat tests.
 */
export const empty = (): AuxiliaryData => new ConwayAuxiliaryData({})

/**
 * Create a Conway-era AuxiliaryData instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const conway = (input: {
  metadata?: Metadata.Metadata
  nativeScripts?: Array<NativeScripts.Native>
  plutusV1Scripts?: Array<PlutusV1.PlutusV1>
  plutusV2Scripts?: Array<PlutusV2.PlutusV2>
  plutusV3Scripts?: Array<PlutusV3.PlutusV3>
}): AuxiliaryData => new ConwayAuxiliaryData({ ...input })

/**
 * Create a ShelleyMA-era AuxiliaryData instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const shelleyMA = (input: {
  metadata?: Metadata.Metadata
  nativeScripts?: Array<NativeScripts.Native>
}): AuxiliaryData => new ShelleyMAAuxiliaryData({ ...input })

/**
 * Create a Shelley-era AuxiliaryData instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const shelley = (input: { metadata: Metadata.Metadata }): AuxiliaryData =>
  new ShelleyAuxiliaryData({ metadata: input.metadata })

/**
 * Check if two AuxiliaryData instances are equal (deep comparison).
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AuxiliaryData, b: AuxiliaryData): boolean => {
  // Different eras are never equal
  if (a._tag !== b._tag) return false

  const cmpArray = (x?: ReadonlyArray<any>, y?: ReadonlyArray<any>) =>
    x && y ? x.length === y.length && x.every((v, i) => v === y[i]) : x === y

  // Compare metadata if both have it
  if (a.metadata && b.metadata) {
    if (!Metadata.equals(a.metadata, b.metadata)) return false
  } else if (a.metadata || b.metadata) return false

  // Conway-specific comparisons
  if (a._tag === "ConwayAuxiliaryData" && b._tag === "ConwayAuxiliaryData") {
    if (!cmpArray(a.nativeScripts, b.nativeScripts)) return false
    if (!cmpArray(a.plutusV1Scripts, b.plutusV1Scripts)) return false
    if (!cmpArray(a.plutusV2Scripts, b.plutusV2Scripts)) return false
    if (!cmpArray(a.plutusV3Scripts, b.plutusV3Scripts)) return false
  }

  // ShelleyMA-specific comparisons
  if (a._tag === "ShelleyMAAuxiliaryData" && b._tag === "ShelleyMAAuxiliaryData") {
    if (!cmpArray(a.nativeScripts, b.nativeScripts)) return false
  }

  // Shelley has only metadata, already compared above
  return true
}

/**
 * FastCheck arbitrary for generating Conway-era AuxiliaryData instances.
 * Conway era supports all features: metadata, native scripts, and all Plutus script versions.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const conwayArbitrary: FastCheck.Arbitrary<ConwayAuxiliaryData> = FastCheck.record({
  metadata: FastCheck.option(Metadata.arbitrary, { nil: undefined }),
  nativeScripts: FastCheck.option(FastCheck.array(NativeScripts.arbitrary, { maxLength: 3 }), { nil: undefined }),
  plutusV1Scripts: FastCheck.option(FastCheck.array(PlutusV1.arbitrary, { maxLength: 3 }), { nil: undefined }),
  plutusV2Scripts: FastCheck.option(FastCheck.array(PlutusV2.arbitrary, { maxLength: 3 }), { nil: undefined }),
  plutusV3Scripts: FastCheck.option(FastCheck.array(PlutusV3.arbitrary, { maxLength: 3 }), { nil: undefined })
}).map((r) => new ConwayAuxiliaryData(r))

// Provide a convenient constructor alias for tests using `new AuxiliaryData.AuxiliaryData({...})`
;(AuxiliaryData as any).AuxiliaryData = ConwayAuxiliaryData

export const shelleyMAArbitrary: FastCheck.Arbitrary<ShelleyMAAuxiliaryData> = FastCheck.record({
  metadata: FastCheck.option(Metadata.arbitrary, { nil: undefined }),
  nativeScripts: FastCheck.option(FastCheck.array(NativeScripts.arbitrary, { maxLength: 3 }), { nil: undefined })
}).map((r) => new ShelleyMAAuxiliaryData(r))

export const shelleyArbitrary: FastCheck.Arbitrary<ShelleyAuxiliaryData> = Metadata.arbitrary.map(
  (metadata) => new ShelleyAuxiliaryData({ metadata })
)

/**
 * FastCheck arbitrary for generating random AuxiliaryData instances.
 * Generates all three era formats with equal probability.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<AuxiliaryData> = FastCheck.oneof(
  conwayArbitrary,
  shelleyMAArbitrary,
  shelleyArbitrary
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Decode AuxiliaryData from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  AuxiliaryDataError,
  "AuxiliaryData.fromCBORBytes",
  CBOR.CML_DEFAULT_OPTIONS
)

/**
 * Decode AuxiliaryData from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  AuxiliaryDataError,
  "AuxiliaryData.fromCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

/**
 * Encode AuxiliaryData to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  AuxiliaryDataError,
  "AuxiliaryData.toCBORBytes",
  CBOR.CML_DEFAULT_OPTIONS
)

/**
 * Encode AuxiliaryData to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  AuxiliaryDataError,
  "AuxiliaryData.toCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)

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
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, AuxiliaryDataError, CBOR.CML_DEFAULT_OPTIONS)

  /**
   * Decode AuxiliaryData from CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, AuxiliaryDataError, CBOR.CML_DEFAULT_OPTIONS)

  /**
   * Encode AuxiliaryData to CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, AuxiliaryDataError, CBOR.CML_DEFAULT_OPTIONS)

  /**
   * Encode AuxiliaryData to CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, AuxiliaryDataError, CBOR.CML_DEFAULT_OPTIONS)
}
