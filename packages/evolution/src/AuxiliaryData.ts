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
  Schema.MapFromSelf({
    key: CBOR.Integer,
    value: CBOR.CBORSchema
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
          // const struct: Record<number, any> = {}
          const map = new Map<bigint, CBOR.CBOR>()
          if (auxData.metadata !== undefined)
            map.set(0n, yield* ParseResult.encodeEither(Metadata.FromCDDL)(auxData.metadata))
          if (auxData.nativeScripts !== undefined) {
            const scripts = []
            for (const s of auxData.nativeScripts) {
              scripts.push(yield* ParseResult.encodeEither(NativeScripts.FromCDDL)(s))
            }
            map.set(1n, scripts)
          }
          if (auxData.plutusV1Scripts !== undefined) {
            const scripts = []
            for (const s of auxData.plutusV1Scripts) {
              scripts.push(yield* ParseResult.encodeEither(PlutusV1.FromCDDL)(s))
            }
            map.set(2n, scripts)
          }
          if (auxData.plutusV2Scripts !== undefined) {
            const scripts = []
            for (const s of auxData.plutusV2Scripts) {
              scripts.push(yield* ParseResult.encodeEither(PlutusV2.FromCDDL)(s))
            }
            map.set(3n, scripts)
          }
          if (auxData.plutusV3Scripts !== undefined) {
            const scripts = []
            for (const s of auxData.plutusV3Scripts) {
              scripts.push(yield* ParseResult.encodeEither(PlutusV3.FromCDDL)(s))
            }
            map.set(4n, scripts)
          }
          return { value: map, tag: 259 as const, _tag: "Tag" as const }
        }
        case "ShelleyMAAuxiliaryData": {
          // Encode ShelleyMA strictly as a 2-element array [metadataMap, nativeScriptList]
          // Use empty map/array when values are absent to avoid CBOR specials and match CML decoding.
          const encodedMetadata =
            auxData.metadata !== undefined
              ? new Map(yield* ParseResult.encodeEither(Metadata.FromCDDL)(auxData.metadata))
              : new Map()
          const encodedScripts: Array<CBOR.CBOR> = (() => {
            const list = auxData.nativeScripts ?? []
            const scripts: Array<CBOR.CBOR> = []
            for (const s of list) {
              scripts.push(ParseResult.encodeEither(NativeScripts.FromCDDL)(s).pipe(E.getOrThrow))
            }
            return scripts
          })()
          return [encodedMetadata, encodedScripts]
        }
        case "ShelleyAuxiliaryData": {
          // Encode Shelley era as plain metadata map (no tag)
          {
            const m = yield* ParseResult.encodeEither(Metadata.FromCDDL)(auxData.metadata)
            return new Map(m)
          }
        }
      }
    }),
  decode: (input) =>
    E.gen(function* () {
      // Conway tag(259)
      if (CBOR.isTag(input) && input.tag === 259) {
        const struct = input.value
        const meta = struct.get(0n)
        const metadata = meta ? yield* ParseResult.decodeUnknownEither(Metadata.FromCDDL)(meta) : undefined

        const nScripts = struct.get(1n)
        const nativeScripts = nScripts
          ? yield* ParseResult.decodeUnknownEither(Schema.Array(NativeScripts.FromCDDL))(nScripts)
          : undefined
        const rawPlutusV1 = struct.get(2n)
        const plutusV1Scripts = rawPlutusV1
          ? yield* ParseResult.decodeUnknownEither(Schema.Array(PlutusV1.FromCDDL))(rawPlutusV1)
          : undefined
        const rawPlutusV2 = struct.get(3n)
        const plutusV2Scripts = rawPlutusV2
          ? yield* ParseResult.decodeUnknownEither(Schema.Array(PlutusV2.FromCDDL))(rawPlutusV2)
          : undefined
        const rawPlutusV3 = struct.get(4n)
        const plutusV3Scripts = rawPlutusV3
          ? yield* ParseResult.decodeUnknownEither(Schema.Array(PlutusV3.FromCDDL))(rawPlutusV3)
          : undefined
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
          const m = yield* ParseResult.decodeEither(Metadata.FromCDDL)(arr[0])
          metadata = m.size === 0 ? undefined : m
        }
        if (arr.length >= 2 && arr[1] !== undefined) {
          const raw = arr[1] as ReadonlyArray<any>
          if (Array.isArray(raw) && raw.length === 0) {
            nativeScripts = undefined
          } else {
            nativeScripts = []
            for (const s of raw) {
              nativeScripts.push(yield* ParseResult.decodeEither(NativeScripts.FromCDDL)(s))
            }
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

  const arrEq = <T>(x?: ReadonlyArray<T>, y?: ReadonlyArray<T>, cmp: (a: T, b: T) => boolean = (u, v) => u === v) => {
    if (x === undefined && y === undefined) return true
    if (x === undefined || y === undefined) return false
    if (x.length !== y.length) return false
    for (let i = 0; i < x.length; i++) if (!cmp(x[i], y[i])) return false
    return true
  }

  // Compare metadata if both have it
  if (a.metadata && b.metadata) {
    if (!Metadata.equals(a.metadata, b.metadata)) return false
  } else if (a.metadata || b.metadata) return false

  // Conway-specific comparisons
  if (a._tag === "ConwayAuxiliaryData" && b._tag === "ConwayAuxiliaryData") {
    if (!arrEq(a.nativeScripts as any, b.nativeScripts as any, NativeScripts.equals)) return false
    if (!arrEq(a.plutusV1Scripts as any, b.plutusV1Scripts as any, PlutusV1.equals)) return false
    if (!arrEq(a.plutusV2Scripts as any, b.plutusV2Scripts as any, PlutusV2.equals)) return false
    if (!arrEq(a.plutusV3Scripts as any, b.plutusV3Scripts as any, PlutusV3.equals)) return false
  }

  // ShelleyMA-specific comparisons
  if (a._tag === "ShelleyMAAuxiliaryData" && b._tag === "ShelleyMAAuxiliaryData") {
    if (!arrEq(a.nativeScripts as any, b.nativeScripts as any, NativeScripts.equals)) return false
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

export const shelleyMAArbitrary: FastCheck.Arbitrary<ShelleyMAAuxiliaryData> = FastCheck.record({
  metadata: FastCheck.option(Metadata.arbitrary, { nil: undefined }),
  nativeScripts: FastCheck.option(FastCheck.array(NativeScripts.arbitrary, { maxLength: 3 }), { nil: undefined })
})
  .filter((r) => {
    const hasMeta = r.metadata !== undefined
    // Disallow both undefined and scripts-only (since encoder omits scripts without metadata)
    return hasMeta
  })
  .map(
    (r) =>
      new ShelleyMAAuxiliaryData({
        metadata: r.metadata && r.metadata.size > 0 ? r.metadata : undefined,
        nativeScripts: r.nativeScripts && r.nativeScripts.length > 0 ? r.nativeScripts : undefined
      })
  )

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
