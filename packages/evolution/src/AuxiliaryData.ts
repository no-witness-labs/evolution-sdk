import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
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
 * auxiliary_data = {
 *   ? 0 => metadata           ; transaction_metadata
 *   ? 1 => [* native_script]  ; native_scripts
 *   ? 2 => [* plutus_v1_script] ; plutus_v1_scripts
 *   ? 3 => [* plutus_v2_script] ; plutus_v2_scripts  
 *   ? 4 => [* plutus_v3_script] ; plutus_v3_scripts
 * }
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
 * CBOR Schema representing auxiliary data as a Conway-tagged map.
 * Conway era wraps auxiliary data in CBOR tag 259 (0x103).
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: Schema.Union(
    Metadata.CDDLSchema,
    Schema.Array(NativeScripts.CDDLSchema),
    Schema.Array(PlutusV1.CDDLSchema),
    Schema.Array(PlutusV2.CDDLSchema),
    Schema.Array(PlutusV3.CDDLSchema)
  )
})

/**
 * Transform schema between AuxiliaryData class and Conway-tagged CBOR.
 * Uses CBOR tag 259 to wrap auxiliary data for Conway era compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromConwayTagged = Schema.transformOrFail(
  Schema.instanceOf(CBOR.Tag),
  Schema.typeSchema(AuxiliaryData),
  {
    strict: true,
    encode: (auxData: AuxiliaryData) =>
      Eff.gen(function* () {
        // First encode to CDDL map
        const cddlMap = yield* ParseResult.encode(FromCDDL)(auxData)
        // Then wrap in Conway tag (259)
        return new CBOR.Tag({ tag: 259, value: cddlMap })
      }),
    decode: (conwayTag: CBOR.Tag) =>
      Eff.gen(function* () {
        // Extract the map from Conway tag and decode
        const cddlMap = conwayTag.value as ReadonlyMap<bigint, any>
        return yield* ParseResult.decode(FromCDDL)(cddlMap)
      })
  }
).annotations({
  identifier: "AuxiliaryData.FromConwayTagged",
  title: "AuxiliaryData from Conway tagged CBOR",
  description: "Transforms Conway-tagged CBOR to AuxiliaryData"
})

/**
 * Transform schema between CDDL map representation and AuxiliaryData class.
 * Handles Conway-era map format with CBOR tag 259 wrapping.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(AuxiliaryData), {
  strict: true,
  encode: (toA: AuxiliaryData) =>
    Eff.gen(function* () {
      const result = new Map<bigint, any>()
      
      // Map class properties to CDDL map keys
      if (toA.metadata !== undefined) {
        const encodedMetadata = yield* ParseResult.encode(Metadata.FromCDDL)(toA.metadata)
        result.set(0n, encodedMetadata)
      }
      
      if (toA.nativeScripts !== undefined) {
        const encodedNativeScripts = yield* Eff.all(
          toA.nativeScripts.map((s) => ParseResult.encode(NativeScripts.FromCDDL)(s))
        )
        result.set(1n, encodedNativeScripts)
      }
      
      if (toA.plutusV1Scripts !== undefined) {
        const encodedV1Scripts = yield* Eff.all(
          toA.plutusV1Scripts.map((s) => ParseResult.encode(PlutusV1.FromCDDL)(s))
        )
        result.set(2n, encodedV1Scripts)
      }
      
      if (toA.plutusV2Scripts !== undefined) {
        const encodedV2Scripts = yield* Eff.all(
          toA.plutusV2Scripts.map((s) => ParseResult.encode(PlutusV2.FromCDDL)(s))
        )
        result.set(3n, encodedV2Scripts)
      }
      
      if (toA.plutusV3Scripts !== undefined) {
        const encodedV3Scripts = yield* Eff.all(
          toA.plutusV3Scripts.map((s) => ParseResult.encode(PlutusV3.FromCDDL)(s))
        )
        result.set(4n, encodedV3Scripts)
      }
      
      return result
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      // Extract values from CDDL map and convert to class properties
      const metadataValue = fromA.get(0n) as ReadonlyMap<bigint, any> | undefined
      const metadata = metadataValue ? yield* ParseResult.decode(Metadata.FromCDDL)(metadataValue) : undefined
      
      const nativeScriptsArray = fromA.get(1n) as ReadonlyArray<any> | undefined
      const nativeScripts = nativeScriptsArray
        ? yield* Eff.all(nativeScriptsArray.map((s) => ParseResult.decode(NativeScripts.FromCDDL)(s)))
        : undefined
        
      const plutusV1Array = fromA.get(2n) as ReadonlyArray<any> | undefined
      const plutusV1Scripts = plutusV1Array
        ? yield* Eff.all(plutusV1Array.map((s) => ParseResult.decode(PlutusV1.FromCDDL)(s)))
        : undefined
        
      const plutusV2Array = fromA.get(3n) as ReadonlyArray<any> | undefined
      const plutusV2Scripts = plutusV2Array
        ? yield* Eff.all(plutusV2Array.map((s) => ParseResult.decode(PlutusV2.FromCDDL)(s)))
        : undefined
        
      const plutusV3Array = fromA.get(4n) as ReadonlyArray<any> | undefined
      const plutusV3Scripts = plutusV3Array
        ? yield* Eff.all(plutusV3Array.map((s) => ParseResult.decode(PlutusV3.FromCDDL)(s)))
        : undefined
      
      return new AuxiliaryData({
        metadata,
        nativeScripts,
        plutusV1Scripts,
        plutusV2Scripts,
        plutusV3Scripts,
      })
    })
}).annotations({
  identifier: "AuxiliaryData.FromCDDL",
  title: "AuxiliaryData from CDDL",
  description: "Transforms CDDL map representation to AuxiliaryData"
})

/**
 * CBOR bytes transformation schema for AuxiliaryData.
 * Uses Conway tagged format for CML compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromConwayTagged).annotations({
    identifier: "AuxiliaryData.FromCBORBytes",
    title: "AuxiliaryData from CBOR bytes",
    description: "Decode AuxiliaryData from Conway-tagged CBOR-encoded bytes"
  })

/**
 * CBOR hex transformation schema for AuxiliaryData.
 * Uses Conway tagged format for CML compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(Bytes.FromHex, FromCBORBytes(options)).annotations({
    identifier: "AuxiliaryData.FromCBORHex",
    title: "AuxiliaryData from CBOR hex",
    description: "Decode AuxiliaryData from Conway-tagged CBOR-encoded hex string"
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
export const empty = (): AuxiliaryData => new AuxiliaryData({
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
export const fromCBORBytes = (
  bytes: Uint8Array,
  options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
): AuxiliaryData => Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Decode AuxiliaryData from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): AuxiliaryData =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode AuxiliaryData to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: AuxiliaryData, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(value, options))

/**
 * Encode AuxiliaryData to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: AuxiliaryData, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): string =>
  Eff.runSync(Effect.toCBORHex(value, options))

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Decode AuxiliaryData from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<AuxiliaryData, AuxiliaryDataError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataError({
            message: "Failed to decode AuxiliaryData from CBOR bytes",
            cause
          })
      )
    ) as Eff.Effect<AuxiliaryData, AuxiliaryDataError>

  /**
   * Decode AuxiliaryData from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<AuxiliaryData, AuxiliaryDataError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataError({
            message: "Failed to decode AuxiliaryData from CBOR hex",
            cause
          })
      )
    )

  /**
   * Encode AuxiliaryData to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    value: AuxiliaryData,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, AuxiliaryDataError> =>
    Schema.encode(FromCBORBytes(options))(value).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataError({
            message: "Failed to encode AuxiliaryData to CBOR bytes",
            cause
          })
      )
    )

  /**
   * Encode AuxiliaryData to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (
    value: AuxiliaryData,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, AuxiliaryDataError> =>
    Schema.encode(FromCBORHex(options))(value).pipe(
      Eff.mapError(
        (cause) =>
          new AuxiliaryDataError({
            message: "Failed to encode AuxiliaryData to CBOR hex",
            cause
          })
      )
    )
}
