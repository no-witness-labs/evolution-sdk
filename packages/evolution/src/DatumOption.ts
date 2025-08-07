import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import * as PlutusData from "./Data.js"

/**
 * Error class for DatumOption related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class DatumOptionError extends Data.TaggedError("DatumOptionError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for DatumHash variant of DatumOption.
 * Represents a reference to datum data stored elsewhere via its hash.
 *
 * @since 2.0.0
 * @category schemas
 */
export class DatumHash extends Schema.TaggedClass<DatumHash>()("DatumHash", {
  hash: Bytes32.HexSchema
}) {}

/**
 * Schema for InlineDatum variant of DatumOption.
 * Represents inline plutus data embedded directly in the transaction output.
 *
 * @since 2.0.0
 * @category schemas
 */
export class InlineDatum extends Schema.TaggedClass<InlineDatum>()("InlineDatum", {
  data: PlutusData.DataSchema
}) {}

/**
 * Schema for DatumOption representing optional datum information in transaction outputs.
 *
 * CDDL: datum_option = [0, Bytes32// 1, data]
 *
 * Where:
 * - [0, Bytes32] represents a datum hash reference
 * - [1, data] represents inline plutus data
 *
 * @since 2.0.0
 * @category schemas
 */
export const DatumOptionSchema = Schema.Union(DatumHash, InlineDatum).annotations({
  identifier: "DatumOption"
})

/**
 * Type alias for DatumOption representing optional datum information.
 * Can be either a hash reference to datum data or inline plutus data.
 *
 * @since 2.0.0
 * @category model
 */
export type DatumOption = typeof DatumOptionSchema.Type

/**
 * Create a DatumOption with a datum hash.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromHash = (hash: string): DatumOption => new DatumHash({ hash })

/**
 * Create a DatumOption with inline data.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromInlineData = (data: PlutusData.Data): DatumOption => new InlineDatum({ data })

/**
 * Check if a DatumOption is a datum hash.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDatumHash = (datumOption: DatumOption): datumOption is DatumHash => datumOption._tag === "DatumHash"

/**
 * Check if a DatumOption is inline data.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isInlineDatum = (datumOption: DatumOption): datumOption is InlineDatum =>
  datumOption._tag === "InlineDatum"

/**
 * Get the hash from a DatumHash, or undefined if it's not a DatumHash.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getHash = (datumOption: DatumOption): string | undefined =>
  isDatumHash(datumOption) ? datumOption.hash : undefined

/**
 * Get the data from an InlineDatum, or undefined if it's not an InlineDatum.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getData = (datumOption: DatumOption): PlutusData.Data | undefined =>
  isInlineDatum(datumOption) ? datumOption.data : undefined

/**
 * Check if two DatumOption instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: DatumOption, b: DatumOption): boolean => {
  if (a._tag !== b._tag) return false
  if (a._tag === "DatumHash" && b._tag === "DatumHash") {
    return a.hash === b.hash
  }
  if (a._tag === "InlineDatum" && b._tag === "InlineDatum") {
    return a.data === b.data
  }
  return false
}

/**
 * FastCheck arbitrary for generating random DatumOption instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.oneof(
  FastCheck.record({
    _tag: FastCheck.constant("DatumHash" as const),
    hash: FastCheck.hexaString({ minLength: 64, maxLength: 64 })
  }).map((props) => new DatumHash(props)),
  FastCheck.record({
    _tag: FastCheck.constant("InlineDatum" as const),
    data: PlutusData.arbitrary
  }).map((props) => new InlineDatum(props))
)

/**
 * CDDL schema for DatumOption.
 * datum_option = [0, Bytes32// 1, data]
 *
 * Where:
 * - [0, Bytes32] represents a datum hash (tag 0 with 32-byte hash)
 * - [1, data] represents inline data (tag 1 with CBOR-encoded plutus data)
 *
 * @since 2.0.0
 * @category schemas
 */
export const DatumOptionCDDLSchema = Schema.transformOrFail(
  Schema.Union(
    Schema.Tuple(Schema.Literal(0n), CBOR.ByteArray), // [0, Bytes32]
    Schema.Tuple(Schema.Literal(1n), CBOR.CBORSchema) // [1, data] - data as CBOR bytes
  ),
  Schema.typeSchema(DatumOptionSchema),
  {
    strict: true,
    encode: (toA) =>
      Eff.gen(function* () {
        const result =
          toA._tag === "DatumHash"
            ? ([0n, yield* ParseResult.encode(Bytes.FromBytes)(toA.hash)] as const) // Encode as [0, Bytes32]
            : ([1n, PlutusData.plutusDataToCBORValue(toA.data)] as const) // Encode as [1, data]
        return result
      }),
    decode: ([tag, value], _, ast) =>
      Eff.gen(function* () {
        if (tag === 0n) {
          // Decode as DatumHash
          const hash = yield* ParseResult.decode(Bytes.FromBytes)(value)
          return new DatumHash({ hash })
        } else if (tag === 1n) {
          // Decode as InlineDatum
          return new InlineDatum({
            data: PlutusData.cborValueToPlutusData(value)
          })
        }
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, [tag, value], `Invalid DatumOption tag: ${tag}. Expected 0 or 1.`)
        )
      })
  }
).annotations({
  identifier: "DatumOption.DatumOptionCDDLSchema",
  description: "Transforms CBOR structure to DatumOption"
})

/**
 * CBOR bytes transformation schema for DatumOption.
 * Transforms between Uint8Array and DatumOption using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    DatumOptionCDDLSchema // CBOR → DatumOption
  ).annotations({
    identifier: "DatumOption.FromCBORBytes",
    description: "Transforms CBOR bytes to DatumOption"
  })

/**
 * CBOR hex transformation schema for DatumOption.
 * Transforms between hex string and DatumOption using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → DatumOption
  ).annotations({
    identifier: "DatumOption.FromCBORHex",
    description: "Transforms CBOR hex string to DatumOption"
  })

/**
 * Effect namespace for DatumOption operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Convert CBOR bytes to DatumOption using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(bytes),
      (cause) => new DatumOptionError({ message: "Failed to decode from CBOR bytes", cause })
    )

  /**
   * Convert CBOR hex string to DatumOption using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(hex),
      (cause) => new DatumOptionError({ message: "Failed to decode from CBOR hex", cause })
    )

  /**
   * Convert DatumOption to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = (datumOption: DatumOption, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(datumOption),
      (cause) => new DatumOptionError({ message: "Failed to encode to CBOR bytes", cause })
    )

  /**
   * Convert DatumOption to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = (datumOption: DatumOption, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(datumOption),
      (cause) => new DatumOptionError({ message: "Failed to encode to CBOR hex", cause })
    )
}

/**
 * Convert CBOR bytes to DatumOption (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): DatumOption =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Convert CBOR hex string to DatumOption (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): DatumOption =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Convert DatumOption to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = (datumOption: DatumOption, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(datumOption, options))

/**
 * Convert DatumOption to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = (datumOption: DatumOption, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(datumOption, options))
